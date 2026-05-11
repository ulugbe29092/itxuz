const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// POST /api/auth/register/step1
router.post('/register/step1', async (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  if (!first_name || !last_name || !email || !phone)
    return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });

  const phoneRegex = /^\+998\d{9}$/;
  if (!phoneRegex.test(phone))
    return res.status(400).json({ error: 'Telefon: +998 + 9 ta raqam (masalan +998901234567)' });

  try {
    res.json({ success: true, message: '1-qadam muvaffaqiyatli' });
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// POST /api/auth/register/step2
router.post('/register/step2', async (req, res) => {
  const { first_name, last_name, email, phone, username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username va parol kerak' });

  if (password.length < 6 || password.length > 20)
    return res.status(400).json({ error: 'Parol 6-20 ta belgidan iborat bo\'lishi kerak' });

  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return res.status(400).json({ error: 'Username faqat harf, raqam va _ bo\'lishi mumkin' });

  try {
    const usernameCheck = await pool.query('SELECT id FROM users WHERE username=$1', [username.toLowerCase()]);
    if (usernameCheck.rows.length)
      return res.status(400).json({ error: 'Bu username band. Boshqa tanlang' });

    const hash = await bcrypt.hash(password, 10);
    const planExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO users (first_name,last_name,email,phone,username,password_hash,role,plan,plan_expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,'user','free',$7) RETURNING id,username,role,plan`,
      [first_name, last_name, email.toLowerCase(), phone, username.toLowerCase(), hash, planExpiresAt]
    );

    await pool.query('UPDATE statistics SET total_users=total_users+1, updated_at=NOW()');

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username va parol kiriting' });

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(username)=$1',
      [username.toLowerCase().trim()]
    );
    if (!result.rows.length)
      return res.status(400).json({ error: 'Username yoki parol noto\'g\'ri' });

    const user = result.rows[0];

    // Blocked check (admins are never blocked)
    if (user.is_blocked && user.role !== 'admin')
      return res.status(403).json({ error: 'Hisobingiz bloklangan. Tarif rejasini yangilang', blocked: true });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(400).json({ error: 'Username yoki parol noto\'g\'ri' });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/check-username
router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  if (!username || username.length < 3)
    return res.json({ available: false, message: 'Kamida 3 ta belgi' });
  try {
    const r = await pool.query('SELECT id FROM users WHERE username=$1', [username.toLowerCase()]);
    res.json({ available: !r.rows.length, message: r.rows.length ? 'Band' : 'Mavjud ✓' });
  } catch {
    res.json({ available: false });
  }
});

module.exports = router;
