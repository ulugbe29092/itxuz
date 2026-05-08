const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/avatars')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Faqat rasm'));
  },
});

// GET /api/user/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [progress, courses, certs, daysLeft] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM user_progress WHERE user_id=$1 AND watched=TRUE', [req.user.id]),
      pool.query(
        `SELECT c.*, COUNT(DISTINCT l.id) as total_lessons,
          COUNT(DISTINCT CASE WHEN up.watched=TRUE THEN up.lesson_id END) as completed_lessons
         FROM courses c
         LEFT JOIN lessons l ON l.course_id=c.id
         LEFT JOIN user_progress up ON up.lesson_id=l.id AND up.user_id=$1
         GROUP BY c.id ORDER BY c.order_num ASC LIMIT 6`,
        [req.user.id]
      ),
      pool.query(
        `SELECT cert.*, c.title as course_title, c.icon as course_icon
         FROM certificates cert JOIN courses c ON c.id=cert.course_id
         WHERE cert.user_id=$1 ORDER BY cert.issued_at DESC`,
        [req.user.id]
      ),
      Promise.resolve(null),
    ]);

    let daysRemaining = null;
    if (req.user.plan === 'free' && req.user.plan_expires_at) {
      const diff = new Date(req.user.plan_expires_at) - new Date();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    res.json({
      completedLessons: parseInt(progress.rows[0].count),
      courses: courses.rows,
      certificates: certs.rows,
      daysRemaining,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [progress, certs, quizStats] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM user_progress WHERE user_id=$1 AND watched=TRUE', [req.user.id]),
      pool.query(
        `SELECT cert.*, c.title as course_title, c.icon as course_icon
         FROM certificates cert JOIN courses c ON c.id=cert.course_id
         WHERE cert.user_id=$1 ORDER BY cert.issued_at DESC`,
        [req.user.id]
      ),
      pool.query(
        `SELECT COUNT(*) as total, SUM(CASE WHEN passed THEN 1 ELSE 0 END) as passed
         FROM user_quiz_attempts WHERE user_id=$1`,
        [req.user.id]
      ),
    ]);
    res.json({
      user: req.user,
      completedLessons: parseInt(progress.rows[0].total),
      certificates: certs.rows,
      quizStats: quizStats.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/user/profile
router.put('/profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  const { first_name, last_name, phone, age, location } = req.body;
  try {
    let avatarPath = req.user.avatar;
    if (req.file) avatarPath = '/uploads/avatars/' + req.file.filename;

    const result = await pool.query(
      `UPDATE users SET first_name=$1, last_name=$2, phone=$3, age=$4, location=$5, avatar=$6
       WHERE id=$7 RETURNING id, first_name, last_name, email, phone, username, role, plan, avatar, age, location`,
      [first_name, last_name, phone, age || null, location || null, avatarPath, req.user.id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
