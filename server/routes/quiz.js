'use strict';
const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// POST /api/quiz/admin-notify
router.post('/admin-notify', authMiddleware, async (req, res) => {
  try {
    const { quizId, violationType, violationText, count, screenshot, timestamp } = req.body;
    await pool.query(
      `INSERT INTO quiz_violations (user_id, quiz_id, violation_type, violation_text, screenshot, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, quizId, violationType, violationText, screenshot, timestamp || new Date().toISOString()]
    );
    if (count >= 3) {
      await pool.query(
        `INSERT INTO admin_notifications (user_id, quiz_id, violation_type, violation_text, violation_count, screenshot, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.user.id, quizId, violationType, violationText, count, screenshot, timestamp || new Date().toISOString()]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Admin notify error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz/:id/can-retake
router.get('/:id/can-retake', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id FROM quiz_retake_requests
       WHERE user_id=$1 AND quiz_id=$2 AND status='approved'
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, req.params.id]
    );
    res.json({ canRetake: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz/:id/check-blocked
router.get('/:id/check-blocked', authMiddleware, async (req, res) => {
  try {
    const pending = await pool.query(
      `SELECT id FROM quiz_retake_requests
       WHERE user_id=$1 AND quiz_id=$2 AND status='pending'
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, req.params.id]
    );
    const approved = await pool.query(
      `SELECT id FROM quiz_retake_requests
       WHERE user_id=$1 AND quiz_id=$2 AND status='approved'
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, req.params.id]
    );
    res.json({ isBlocked: pending.rows.length > 0 && approved.rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz/:id/auto-block
router.post('/:id/auto-block', authMiddleware, async (req, res) => {
  try {
    const { resetCount, reason } = req.body;
    const existing = await pool.query(
      `SELECT id FROM quiz_retake_requests
       WHERE user_id=$1 AND quiz_id=$2 AND status='pending' LIMIT 1`,
      [req.user.id, req.params.id]
    );
    if (existing.rows.length > 0) {
      return res.json({ success: true, message: 'So\'rov allaqachon mavjud' });
    }
    await pool.query(
      `INSERT INTO quiz_retake_requests (user_id, quiz_id, status, reset_count, reason, created_at)
       VALUES ($1, $2, 'pending', $3, $4, NOW())`,
      [req.user.id, req.params.id, resetCount || 3, reason || 'Avtomatik bloklandi']
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Auto block error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz/:id/request-retake
router.post('/:id/request-retake', authMiddleware, async (req, res) => {
  try {
    const { resetCount, reason } = req.body;
    await pool.query(
      `INSERT INTO quiz_retake_requests (user_id, quiz_id, status, reset_count, reason, created_at)
       VALUES ($1, $2, 'pending', $3, $4, NOW())`,
      [req.user.id, req.params.id, resetCount || 0, reason || 'Qayta topshirish so\'rovi']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz/:id/submit — ASOSIY
router.post('/:id/submit', authMiddleware, async (req, res) => {
  const { answers, resetCount } = req.body;
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Javoblar kerak' });
  }

  try {
    // Quiz ma'lumotlari
    const quizRes = await pool.query(
      `SELECT q.*, l.id as lesson_id
       FROM quizzes q JOIN lessons l ON l.id = q.lesson_id
       WHERE q.id = $1`,
      [req.params.id]
    );
    if (!quizRes.rows.length) return res.status(404).json({ error: 'Quiz topilmadi' });
    const quiz = quizRes.rows[0];

    // Savollar
    const questionsRes = await pool.query(
      'SELECT id FROM quiz_questions WHERE quiz_id = $1',
      [quiz.id]
    );
    const questions = questionsRes.rows;
    const total = questions.length;

    if (total === 0) {
      return res.status(400).json({ error: 'Bu quizda savollar yo\'q' });
    }

    // Javoblarni tekshirish
    let correct = 0;
    for (const q of questions) {
      const selectedId = answers[q.id] || answers[String(q.id)];
      if (!selectedId) continue;

      const optRes = await pool.query(
        'SELECT is_correct FROM quiz_options WHERE id = $1 AND question_id = $2',
        [selectedId, q.id]
      );

      if (optRes.rows.length > 0) {
        const val = optRes.rows[0].is_correct;
        // PostgreSQL boolean: true/false, SQLite: 1/0/'1'/'0'
        if (val === true || val === 1 || val === '1' || val === 't') {
          correct++;
        }
      }
    }

    const score = Math.round((correct / total) * 100);
    const passPercentage = quiz.pass_percentage || 70;
    const passed = score >= passPercentage;

    // Urinishni saqlash
    await pool.query(
      `INSERT INTO user_quiz_attempts (user_id, quiz_id, score, passed, reset_count)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, quiz.id, score, passed, resetCount || 0]
    );

    // Progress yangilash
    if (passed) {
      const existing = await pool.query(
        'SELECT id FROM user_progress WHERE user_id = $1 AND lesson_id = $2',
        [req.user.id, quiz.lesson_id]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE user_progress
           SET quiz_passed = TRUE, quiz_score = $1, completed_at = NOW()
           WHERE user_id = $2 AND lesson_id = $3`,
          [score, req.user.id, quiz.lesson_id]
        );
      } else {
        await pool.query(
          `INSERT INTO user_progress (user_id, lesson_id, watched, quiz_passed, quiz_score, completed_at)
           VALUES ($1, $2, TRUE, TRUE, $3, NOW())`,
          [req.user.id, quiz.lesson_id, score]
        );
      }
    }

    res.json({ success: true, score, passed, correct, total, passPercentage });
  } catch (err) {
    console.error('Quiz submit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz/:id — Quiz ma'lumotlari
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quizRes = await pool.query(
      `SELECT q.*, l.title as lesson_title, l.id as lesson_id
       FROM quizzes q JOIN lessons l ON l.id = q.lesson_id
       WHERE q.id = $1`,
      [req.params.id]
    );
    if (!quizRes.rows.length) return res.status(404).json({ error: 'Quiz topilmadi' });
    const quiz = quizRes.rows[0];

    const questionsRes = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY id ASC',
      [quiz.id]
    );

    const questionsWithOptions = await Promise.all(
      questionsRes.rows.map(async (q) => {
        const opts = await pool.query(
          'SELECT id, option_text FROM quiz_options WHERE question_id = $1 ORDER BY id ASC',
          [q.id]
        );
        return { ...q, options: opts.rows };
      })
    );

    res.json({ quiz, questions: questionsWithOptions });
  } catch (err) {
    console.error('Quiz GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
