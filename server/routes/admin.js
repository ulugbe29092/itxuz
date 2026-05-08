'use strict';
const router = require('express').Router();
const pool = require('../db');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Video upload storage
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `video_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`);
  },
});
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Faqat video fayllar: mp4, webm, ogg, mov, avi'));
  },
});

// Super-admin only middleware
function superAdminOnly(req, res, next) {
  if (req.user.username !== 'ulugbek') {
    return res.status(403).json({ error: 'Bu amal faqat super-admin uchun' });
  }
  next();
}

// All admin routes require admin role
router.use(adminMiddleware);

// ===== STATS =====
router.get('/stats', async (req, res) => {
  try {
    const [users, admins, courses, lessons, approved, pending] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM users WHERE role='user'"),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role='admin' AND username!='ulugbek'"),
      pool.query('SELECT COUNT(*) as count FROM courses'),
      pool.query('SELECT COUNT(*) as count FROM lessons'),
      pool.query("SELECT COUNT(*) as count FROM payments WHERE status='approved'"),
      pool.query("SELECT COUNT(*) as count FROM payments WHERE status='pending'"),
    ]);
    const recent = await pool.query(
      "SELECT id,first_name,last_name,username,plan,role,created_at FROM users WHERE role='user' ORDER BY created_at DESC LIMIT 5"
    );
    res.json({
      stats: {
        users: +users.rows[0].count,
        admins: +admins.rows[0].count,
        courses: +courses.rows[0].count,
        lessons: +lessons.rows[0].count,
        payments: +approved.rows[0].count,
        pending: +pending.rows[0].count,
      },
      recentUsers: recent.rows,
      isSuperAdmin: req.user.username === 'ulugbek',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== USERS =====
router.get('/users', async (req, res) => {
  try {
    // Super-admin barcha userlarni ko'radi, sub-admin faqat oddiy userlarni
    const whereClause = req.user.username === 'ulugbek'
      ? "WHERE u.username != 'ulugbek'"
      : "WHERE u.role = 'user'";

    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.role,
              u.plan, u.is_blocked, u.created_at, u.plan_expires_at,
              COUNT(DISTINCT up.lesson_id) as completed_lessons
       FROM users u LEFT JOIN user_progress up ON up.user_id=u.id AND up.watched=1
       ${whereClause}
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json({ users: result.rows, isSuperAdmin: req.user.username === 'ulugbek' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Block user — sub-admin faqat oddiy userlarni bloklaydi
router.post('/users/:id/block', async (req, res) => {
  try {
    const target = await pool.query('SELECT role, username FROM users WHERE id=$1', [req.params.id]);
    if (!target.rows.length) return res.status(404).json({ error: 'Topilmadi' });
    const t = target.rows[0];
    // Sub-admin adminlarni bloklolmaydi
    if (t.role === 'admin' && req.user.username !== 'ulugbek') {
      return res.status(403).json({ error: 'Admin foydalanuvchilarni bloklash uchun super-admin huquqi kerak' });
    }
    // Hech kim super-adminni bloklolmaydi
    if (t.username === 'ulugbek') {
      return res.status(403).json({ error: 'Super-adminni bloklash mumkin emas' });
    }
    await pool.query('UPDATE users SET is_blocked=1 WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/unblock', async (req, res) => {
  try {
    const target = await pool.query('SELECT role, username FROM users WHERE id=$1', [req.params.id]);
    if (!target.rows.length) return res.status(404).json({ error: 'Topilmadi' });
    const t = target.rows[0];
    if (t.role === 'admin' && req.user.username !== 'ulugbek') {
      return res.status(403).json({ error: 'Admin foydalanuvchilarni boshqarish uchun super-admin huquqi kerak' });
    }
    await pool.query('UPDATE users SET is_blocked=0 WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set plan — sub-admin ham qila oladi
router.post('/users/:id/set-plan', async (req, res) => {
  const { plan, days } = req.body;
  try {
    const target = await pool.query('SELECT role, username FROM users WHERE id=$1', [req.params.id]);
    if (!target.rows.length) return res.status(404).json({ error: 'Topilmadi' });
    const t = target.rows[0];
    if (t.role === 'admin' && req.user.username !== 'ulugbek') {
      return res.status(403).json({ error: 'Admin tarifini o\'zgartirish uchun super-admin huquqi kerak' });
    }
    const expiresAt = plan !== 'free' && days
      ? new Date(Date.now() + parseInt(days) * 86400000).toISOString()
      : null;
    await pool.query(
      'UPDATE users SET plan=$1, plan_expires_at=$2, is_blocked=0 WHERE id=$3',
      [plan, expiresAt, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Make admin — FAQAT super-admin
router.post('/users/:id/make-admin', superAdminOnly, async (req, res) => {
  try {
    const target = await pool.query('SELECT username FROM users WHERE id=$1', [req.params.id]);
    if (!target.rows.length) return res.status(404).json({ error: 'Topilmadi' });
    await pool.query("UPDATE users SET role='admin' WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove admin — FAQAT super-admin
router.post('/users/:id/remove-admin', superAdminOnly, async (req, res) => {
  try {
    const target = await pool.query('SELECT username FROM users WHERE id=$1', [req.params.id]);
    if (!target.rows.length) return res.status(404).json({ error: 'Topilmadi' });
    if (target.rows[0].username === 'ulugbek') {
      return res.status(403).json({ error: 'Super-adminni o\'chirish mumkin emas' });
    }
    await pool.query("UPDATE users SET role='user' WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== COURSES =====
router.get('/courses', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(l.id) as lesson_count FROM courses c
       LEFT JOIN lessons l ON l.course_id=c.id GROUP BY c.id ORDER BY c.order_num ASC`
    );
    res.json({ courses: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/courses', async (req, res) => {
  const { title, slug, description, icon, order_num } = req.body;
  try {
    await pool.query(
      'INSERT INTO courses (title,slug,description,icon,order_num) VALUES ($1,$2,$3,$4,$5)',
      [title, slug, description, icon, order_num || 0]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM courses WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== LESSONS =====
router.get('/lessons', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, c.title as course_title FROM lessons l
       JOIN courses c ON c.id=l.course_id ORDER BY c.order_num, l.order_num`
    );
    res.json({ lessons: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/lessons — YouTube yoki local video
router.post('/lessons', videoUpload.single('video_file'), async (req, res) => {
  const { course_id, title, description, video_url, video_type, duration_minutes, order_num } = req.body;
  try {
    let finalVideoUrl = video_url || '';
    let finalVideoType = video_type || 'youtube';

    // Agar local fayl yuklangan bo'lsa
    if (req.file) {
      finalVideoUrl = '/uploads/videos/' + req.file.filename;
      finalVideoType = 'local';
    }

    await pool.query(
      `INSERT INTO lessons (course_id,title,description,video_url,video_type,duration_minutes,order_num)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [course_id, title, description, finalVideoUrl, finalVideoType, duration_minutes || 0, order_num || 0]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/lessons/:id', async (req, res) => {
  try {
    // Local video faylni ham o'chirish
    const lesson = await pool.query('SELECT video_url, video_type FROM lessons WHERE id=$1', [req.params.id]);
    if (lesson.rows.length && lesson.rows[0].video_type === 'local' && lesson.rows[0].video_url) {
      const filePath = path.join(__dirname, '..', lesson.rows[0].video_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query('DELETE FROM lessons WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Block/unblock lesson — sub-admin ham qila oladi
router.post('/lessons/:id/block', async (req, res) => {
  try {
    await pool.query('UPDATE lessons SET is_blocked=1 WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/lessons/:id/unblock', async (req, res) => {
  try {
    await pool.query('UPDATE lessons SET is_blocked=0 WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PAYMENTS =====
router.get('/payments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.username, u.first_name, u.last_name, u.email
       FROM payments p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC`
    );
    res.json({ payments: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/payments/:id/approve', async (req, res) => {
  try {
    const p = await pool.query('SELECT * FROM payments WHERE id=$1', [req.params.id]);
    if (!p.rows.length) return res.status(404).json({ error: 'Topilmadi' });
    const payment = p.rows[0];
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    await pool.query("UPDATE payments SET status='approved' WHERE id=$1", [req.params.id]);
    await pool.query(
      'UPDATE users SET plan=$1, plan_expires_at=$2, is_blocked=0 WHERE id=$3',
      [payment.plan, expiresAt, payment.user_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/payments/:id/reject', async (req, res) => {
  try {
    await pool.query("UPDATE payments SET status='rejected' WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== QUIZZES =====
router.get('/quizzes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.*, l.title as lesson_title, COUNT(qq.id) as question_count
       FROM quizzes q JOIN lessons l ON l.id=q.lesson_id
       LEFT JOIN quiz_questions qq ON qq.quiz_id=q.id
       GROUP BY q.id, l.title ORDER BY q.created_at DESC`
    );
    res.json({ quizzes: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/quizzes', async (req, res) => {
  const { lesson_id, title, pass_percentage } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO quizzes (lesson_id,title,pass_percentage) VALUES ($1,$2,$3) RETURNING *',
      [lesson_id, title, pass_percentage || 70]
    );
    res.json({ success: true, quiz: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/quizzes/:id/questions', async (req, res) => {
  const { question_text, options, correct_option } = req.body;
  try {
    const q = await pool.query(
      'INSERT INTO quiz_questions (quiz_id,question_text) VALUES ($1,$2) RETURNING id',
      [req.params.id, question_text]
    );
    const qId = q.rows[0].id;
    const opts = Array.isArray(options) ? options : [options];
    for (let i = 0; i < opts.length; i++) {
      if (opts[i]) {
        await pool.query(
          'INSERT INTO quiz_options (question_id,option_text,is_correct) VALUES ($1,$2,$3)',
          [qId, opts[i], i === parseInt(correct_option) ? 1 : 0]
        );
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== CERTIFICATES =====
router.post('/certificates', async (req, res) => {
  const { user_id, course_id } = req.body;
  try {
    const code = 'ITX-' + uuidv4().substr(0, 8).toUpperCase();
    await pool.query(
      'INSERT OR IGNORE INTO certificates (user_id,course_id,certificate_code) VALUES ($1,$2,$3)',
      [user_id, course_id, code]
    );
    res.json({ success: true, code });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== ADMIN NOTIFICATIONS (3 ta ogohlantirish) =====
router.get('/notifications', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.first_name, u.last_name, u.username, q.title as quiz_title
       FROM admin_notifications n
       JOIN users u ON u.id=n.user_id
       JOIN quizzes q ON q.id=n.quiz_id
       ORDER BY n.created_at DESC LIMIT 50`
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== QUIZDAN YIQILGANLAR (barcha ogohlantirishlar) =====
router.get('/quiz-violations', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.first_name, u.last_name, u.username, u.avatar, q.title as quiz_title
       FROM quiz_violations v
       JOIN users u ON u.id=v.user_id
       JOIN quizzes q ON q.id=v.quiz_id
       ORDER BY v.created_at DESC LIMIT 100`
    );
    res.json({ violations: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== QAYTA TOPSHIRISH SO'ROVLARI =====
router.get('/retake-requests', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, u.username, q.title as quiz_title
       FROM quiz_retake_requests r
       JOIN users u ON u.id=r.user_id
       JOIN quizzes q ON q.id=r.quiz_id
       WHERE r.status='pending'
       ORDER BY r.created_at DESC`
    );
    res.json({ requests: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Qayta topshirish ruxsat berish
router.post('/retake-requests/:id/approve', async (req, res) => {
  try {
    await pool.query(
      `UPDATE quiz_retake_requests SET status='approved', updated_at=datetime('now') WHERE id=$1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Qayta topshirish rad etish
router.post('/retake-requests/:id/reject', async (req, res) => {
  try {
    await pool.query(
      `UPDATE quiz_retake_requests SET status='rejected', updated_at=datetime('now') WHERE id=$1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/quiz-violations/:id
router.delete('/quiz-violations/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM quiz_violations WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router;
