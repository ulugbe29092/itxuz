const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/courses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const planLimits = { free: 3, pro: 999, max: 999, vip: 999 };
    const limit = req.user.role === 'admin' ? 999 : (planLimits[req.user.plan] || 3);

    const result = await pool.query(
      `SELECT c.*,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN up.watched=TRUE THEN up.lesson_id END) as completed_lessons
       FROM courses c
       LEFT JOIN lessons l ON l.course_id=c.id
       LEFT JOIN user_progress up ON up.lesson_id=l.id AND up.user_id=$1
       GROUP BY c.id ORDER BY c.order_num ASC`,
      [req.user.id]
    );

    const courses = result.rows.map((c, i) => ({
      ...c,
      locked: req.user.role !== 'admin' && i >= limit,
    }));

    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/public
router.get('/public', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY order_num ASC');
    res.json({ courses: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:slug
router.get('/:slug', authMiddleware, async (req, res) => {
  try {
    const courseResult = await pool.query('SELECT * FROM courses WHERE slug=$1', [req.params.slug]);
    if (!courseResult.rows.length) return res.status(404).json({ error: 'Kurs topilmadi' });
    const course = courseResult.rows[0];

    const allCourses = await pool.query('SELECT id FROM courses ORDER BY order_num ASC');
    const idx = allCourses.rows.findIndex(c => c.id === course.id);
    const planLimits = { free: 3, pro: 999, max: 999, vip: 999 };
    const limit = planLimits[req.user.plan] || 3;
    if (req.user.role !== 'admin' && idx >= limit)
      return res.status(403).json({ error: 'Bu kursga kirish uchun tarif yangilang', upgrade: true });

    const lessons = await pool.query(
      `SELECT l.*, up.watched, up.quiz_passed, up.quiz_score, q.id as quiz_id
       FROM lessons l
       LEFT JOIN user_progress up ON up.lesson_id=l.id AND up.user_id=$1
       LEFT JOIN quizzes q ON q.lesson_id=l.id
       WHERE l.course_id=$2 ORDER BY l.order_num ASC`,
      [req.user.id, course.id]
    );

    res.json({ course, lessons: lessons.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
