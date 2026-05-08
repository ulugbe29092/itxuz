const jwt = require('jsonwebtoken');
const pool = require('../db');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token kerak' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, username, role, plan, plan_expires_at, is_blocked, avatar FROM users WHERE id = $1',
      [decoded.userId]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    const user = result.rows[0];
    if (user.is_blocked && user.role !== 'admin') {
      return res.status(403).json({ error: 'Hisobingiz bloklangan', blocked: true });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token yaroqsiz' });
  }
};

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin huquqi kerak' });
    }
    next();
  });
};

module.exports = { authMiddleware, adminMiddleware };
