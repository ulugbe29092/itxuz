'use strict';
const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload papkasini yaratish
const uploadDir = path.join(__dirname, '../uploads/payments');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Faqat rasm fayllari: jpg, png, gif, webp'));
  },
});

const PRICES = { pro: 700000, max: 1500000, vip: 3000000 };

// POST /api/payment/submit
router.post('/submit', authMiddleware, (req, res) => {
  // multer ni manual ishlatish — xatolarni to'g'ri handle qilish uchun
  upload.single('payment_proof')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Fayl xatosi: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { plan } = req.body;

    if (!['pro', 'max', 'vip'].includes(plan)) {
      return res.status(400).json({ error: "Noto'g'ri tarif rejasi" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "To'lov chekini (rasm) yuklang" });
    }

    try {
      const proofPath = '/uploads/payments/' + req.file.filename;
      const amount = PRICES[plan];

      await pool.query(
        `INSERT INTO payments (user_id, plan, amount, status, payment_proof_image)
         VALUES ($1, $2, $3, 'pending', $4)`,
        [req.user.id, plan, amount, proofPath]
      );

      res.json({
        success: true,
        message: "To'lov muvaffaqiyatli yuborildi! Admin tekshirib, tarifingizni faollashtiradi."
      });
    } catch (dbErr) {
      console.error('Payment DB error:', dbErr.message);
      res.status(500).json({ error: 'Server xatosi: ' + dbErr.message });
    }
  });
});

// GET /api/payment/status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    res.json({ payments: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
