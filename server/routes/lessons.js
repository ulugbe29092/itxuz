const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/lessons/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lessonResult = await pool.query(
      `SELECT l.*, c.title as course_title, c.slug as course_slug, c.id as course_id
       FROM lessons l JOIN courses c ON c.id=l.course_id WHERE l.id=$1`,
      [req.params.id]
    );
    if (!lessonResult.rows.length) return res.status(404).json({ error: 'Dars topilmadi' });
    const lesson = lessonResult.rows[0];

    // Bloklangan darsni faqat admin ko'ra oladi
    if (lesson.is_blocked && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu dars vaqtincha bloklangan' });
    }

    const allCourses = await pool.query('SELECT id FROM courses ORDER BY order_num ASC');
    const idx = allCourses.rows.findIndex(c => c.id === lesson.course_id);
    const planLimits = { free: 3, pro: 999, max: 999, vip: 999 };
    if (req.user.role !== 'admin' && idx >= (planLimits[req.user.plan] || 3))
      return res.status(403).json({ error: 'Tarif yangilang', upgrade: true });

    const progress = await pool.query(
      'SELECT * FROM user_progress WHERE user_id=$1 AND lesson_id=$2',
      [req.user.id, lesson.id]
    );
    const quiz = await pool.query('SELECT * FROM quizzes WHERE lesson_id=$1', [lesson.id]);
    const comments = await pool.query(
      `SELECT cm.*, u.username, u.first_name, u.last_name, u.avatar
       FROM comments cm JOIN users u ON u.id=cm.user_id
       WHERE cm.lesson_id=$1 ORDER BY cm.created_at DESC LIMIT 20`,
      [lesson.id]
    );
    const allLessons = await pool.query(
      'SELECT id, title, order_num FROM lessons WHERE course_id=$1 ORDER BY order_num ASC',
      [lesson.course_id]
    );
    const ci = allLessons.rows.findIndex(l => l.id === lesson.id);

    res.json({
      lesson,
      progress: progress.rows[0] || null,
      quiz: quiz.rows[0] || null,
      comments: comments.rows,
      prevLesson: ci > 0 ? allLessons.rows[ci - 1] : null,
      nextLesson: ci < allLessons.rows.length - 1 ? allLessons.rows[ci + 1] : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/lessons/:id/complete
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    // Avval mavjudligini tekshir
    const existing = await pool.query(
      'SELECT id FROM user_progress WHERE user_id=$1 AND lesson_id=$2',
      [req.user.id, req.params.id]
    );
    if (existing.rows.length > 0) {
      // Yangilash
      await pool.query(
        `UPDATE user_progress SET watched=1, completed_at=datetime('now')
         WHERE user_id=$1 AND lesson_id=$2`,
        [req.user.id, req.params.id]
      );
    } else {
      // Yangi qo'shish
      await pool.query(
        `INSERT INTO user_progress (user_id, lesson_id, watched, completed_at)
         VALUES ($1, $2, 1, datetime('now'))`,
        [req.user.id, req.params.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/lessons/:id/comment
router.post('/:id/comment', authMiddleware, async (req, res) => {
  const { content, rating } = req.body;
  if (!content) return res.status(400).json({ error: 'Izoh yozing' });
  try {
    const result = await pool.query(
      'INSERT INTO comments (user_id,lesson_id,content,rating) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, req.params.id, content, rating || null]
    );
    res.json({ success: true, comment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
