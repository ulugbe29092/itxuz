require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Upload papkalarini yaratish
['uploads/payments', 'uploads/avatars', 'uploads/videos'].forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// CORS — barcha localhost portlarni qabul qil
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
    return cb(null, process.env.CLIENT_URL || 'http://localhost:3000');
  },
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/ai', require('./routes/ai-assistant'));

// Auto-block expired free users (SQLite uchun 0/1 ishlatiladi)
const pool = require('./db');
async function autoBlock() {
  try {
    await pool.query(
      `UPDATE users SET is_blocked=1
       WHERE role='user' AND plan='free' AND is_blocked=0
       AND created_at < datetime('now', '-3 days')`
    );
    await pool.query(
      `UPDATE users SET plan='free', is_blocked=1
       WHERE role='user' AND plan!='free'
       AND plan_expires_at IS NOT NULL
       AND plan_expires_at < datetime('now') AND is_blocked=0`
    );
  } catch (err) {
    console.error('[AutoBlock]', err.message);
  }
}
setInterval(autoBlock, 60 * 60 * 1000);
setTimeout(autoBlock, 5000);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route topilmadi' }));

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Server xatosi: ' + err.message });
});

app.listen(PORT, () => {
  console.log(`✅ ITX Server: http://localhost:${PORT}`);
});
