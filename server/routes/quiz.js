'use strict';
const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// POST /api/quiz/admin-notify - 3 ta ogohlantirish → adminga SMS + screenshot (BIRINCHI)
router.post('/admin-notify', authMiddleware, async (req, res) => {
  try {
    const { quizId, violationType, violationText, count, screenshot, timestamp } = req.body;

    console.log('Admin notify received:', { 
      userId: req.user.id, 
      quizId, 
      violationType, 
      count 
    });

    // Har bir ogohlantirish uchun quiz_violations ga saqlash
    await pool.query(
      `INSERT INTO quiz_violations (user_id, quiz_id, violation_type, violation_text, screenshot, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, quizId, violationType, violationText, screenshot, timestamp]
    );

    // 3 ta ogohlantirish bo'lganda admin_notifications ga ham saqlash
    if (count >= 3) {
      await pool.query(
        `INSERT INTO admin_notifications (user_id, quiz_id, violation_type, violation_text, violation_count, screenshot, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.user.id, quizId, violationType, violationText, count, screenshot, timestamp]
      );
      console.log('Admin notification saved for 3 warnings')
    }

    // Bu yerda SMS yuborish logikasi qo'shiladi
    console.log(`Admin SMS: User ${req.user.id} - Quiz ${quizId} - ${count} violations (${violationType})`)

    res.json({ success: true, message: 'Admin notified' });
  } catch (err) {
    console.error('Admin notify error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz/:id/can-retake - Qayta topshirish mumkinmi? (IKKINCHI)
router.get('/:id/can-retake', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM quiz_retake_requests
       WHERE user_id=$1 AND quiz_id=$2 AND status='approved'
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, req.params.id]
    );

    res.json({ canRetake: result.rows.length > 0 });
  } catch (err) {
    console.error('Can retake check error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz/:id/check-blocked - Bloklangan yoki yo'qligini tekshirish (UCHINCHI)
router.get('/:id/check-blocked', authMiddleware, async (req, res) => {
  try {
    // Pending so'rovlar bormi tekshirish
    const result = await pool.query(
      `SELECT * FROM quiz_retake_requests
       WHERE user_id=$1 AND quiz_id=$2 AND status='pending'
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, req.params.id]
    );

    res.json({ isBlocked: result.rows.length > 0 });
  } catch (err) {
    console.error('Check blocked error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz/:id/auto-block - Avtomatik bloklash (3 ta xato) (TO'RTINCHI)
router.post('/:id/auto-block', authMiddleware, async (req, res) => {
  try {
    const quizId = req.params.id;
    const { resetCount, reason } = req.body;

    console.log('Auto-block request:', { 
      userId: req.user.id, 
      quizId, 
      resetCount, 
      reason 
    });

    // Avval mavjud pending so'rov bormi tekshirish
    const existing = await pool.query(
      `SELECT id FROM quiz_retake_requests
       WHERE user_id=$1 AND quiz_id=$2 AND status='pending'
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, quizId]
    );

    if (existing.rows.length > 0) {
      console.log('Pending request already exists, skipping duplicate');
      return res.json({ success: true, message: 'So\'rov allaqachon mavjud' });
    }

    // Avtomatik so'rov yaratish (admin tasdiqlashi kerak)
    await pool.query(
      `INSERT INTO quiz_retake_requests (user_id, quiz_id, status, reset_count, reason, created_at)
       VALUES ($1, $2, 'pending', $3, $4, datetime('now'))`,
      [req.user.id, quizId, resetCount || 3, reason || 'Avtomatik bloklandi - 3 ta xato']
    );

    console.log('Auto-block request saved successfully');

    res.json({ success: true, message: 'Avtomatik bloklandi' });
  } catch (err) {
    console.error('Auto block error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz/:id/request-retake - Qayta topshirish so'rovi (BESHINCHI)
router.post('/:id/request-retake', authMiddleware, async (req, res) => {
  try {
    const quizId = req.params.id;
    const { resetCount, reason } = req.body;

    // So'rovni saqlash
    await pool.query(
      `INSERT INTO quiz_retake_requests (user_id, quiz_id, status, reset_count, reason, created_at)
       VALUES ($1, $2, 'pending', $3, $4, datetime('now'))`,
      [req.user.id, quizId, resetCount || 0, reason || 'Qayta topshirish so\'rovi']
    );

    res.json({ success: true, message: 'So\'rov yuborildi' });
  } catch (err) {
    console.error('Retake request error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz/:id/submit (OLTINCHI)
router.post('/:id/submit', authMiddleware, async (req, res) => {
  const { answers, resetCount } = req.body; // { questionId: optionId }

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Javoblar kerak' });
  }

  try {
    const quizResult = await pool.query(
      `SELECT q.*, l.id as lesson_id
       FROM quizzes q JOIN lessons l ON l.id=q.lesson_id WHERE q.id=$1`,
      [req.params.id]
    );
    if (!quizResult.rows.length) return res.status(404).json({ error: 'Quiz topilmadi' });
    const quiz = quizResult.rows[0];

    const questions = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id=$1',
      [quiz.id]
    );

    let correct = 0;
    const total = questions.rows.length;

    for (const q of questions.rows) {
      const selectedId = answers[q.id] || answers[String(q.id)];
      if (!selectedId) continue;

      const opt = await pool.query(
        'SELECT is_correct FROM quiz_options WHERE id=$1 AND question_id=$2',
        [selectedId, q.id]
      );

      if (opt.rows.length > 0) {
        // SQLite: is_correct = 1 yoki true
        const isCorrect = opt.rows[0].is_correct === 1
          || opt.rows[0].is_correct === true
          || opt.rows[0].is_correct === '1';
        if (isCorrect) correct++;
      }
    }

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= (quiz.pass_percentage || 70);

    // Quiz urinishini saqlash (resetCount bilan)
    await pool.query(
      'INSERT INTO user_quiz_attempts (user_id, quiz_id, score, passed, reset_count) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, quiz.id, score, passed ? 1 : 0, resetCount || 0]
    );

    // Progress yangilash
    if (passed) {
      const existing = await pool.query(
        'SELECT id FROM user_progress WHERE user_id=$1 AND lesson_id=$2',
        [req.user.id, quiz.lesson_id]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE user_progress
           SET quiz_passed=1, quiz_score=$1, completed_at=datetime('now')
           WHERE user_id=$2 AND lesson_id=$3`,
          [score, req.user.id, quiz.lesson_id]
        );
      } else {
        await pool.query(
          `INSERT INTO user_progress (user_id, lesson_id, watched, quiz_passed, quiz_score, completed_at)
           VALUES ($1, $2, 1, 1, $3, datetime('now'))`,
          [req.user.id, quiz.lesson_id, score]
        );
      }
    }

    res.json({
      success: true,
      score,
      passed,
      correct,
      total,
      passPercentage: quiz.pass_percentage || 70,
    });
  } catch (err) {
    console.error('Quiz submit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz/:id (OXIRGI - eng umumiy route)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quizResult = await pool.query(
      `SELECT q.*, l.title as lesson_title, l.id as lesson_id
       FROM quizzes q JOIN lessons l ON l.id=q.lesson_id WHERE q.id=$1`,
      [req.params.id]
    );
    if (!quizResult.rows.length) return res.status(404).json({ error: 'Quiz topilmadi' });
    const quiz = quizResult.rows[0];

    const questions = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id=$1 ORDER BY id ASC',
      [quiz.id]
    );

    const questionsWithOptions = await Promise.all(
      questions.rows.map(async (q) => {
        const opts = await pool.query(
          'SELECT id, option_text FROM quiz_options WHERE question_id=$1 ORDER BY id ASC',
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
