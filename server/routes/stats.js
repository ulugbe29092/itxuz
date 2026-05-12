'use strict';
const router = require('express').Router();
const pool = require('../db');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const [users, courses, lessons] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM users WHERE role='user'"),
      pool.query('SELECT COUNT(*) as count FROM courses'),
      pool.query('SELECT COUNT(*) as count FROM lessons'),
    ]);
    res.json({
      total_users: +users.rows[0].count || 0,
      total_courses: +courses.rows[0].count || 15,
      total_videos: +lessons.rows[0].count || 0,
      rating: 4.9,
    });
  } catch {
    res.json({ total_users: 0, total_courses: 15, total_videos: 0, rating: 4.9 });
  }
});

// POST /api/stats/ai-chat  — Google Gemini AI
router.post('/ai-chat', async (req, res) => {
  const { message, userName, userRole } = req.body;
  if (!message) return res.json({ reply: 'Xabar yuboring.' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAMtIm9Tawv24yhq4faNJOBwLOqegzM2ww'

  const greeting = userName
    ? (userRole === 'admin'
        ? `Siz admin ${userName} bilan gaplashyapsiz.`
        : `Foydalanuvchi ismi: ${userName}.`)
    : 'Mehmon foydalanuvchi.';

  const systemPrompt = `Sen ITX platformasining AI yordamchisisisan. 
${greeting}

ITX haqida:
- O'zbekistondagi #1 onlayn IT platformasi
- Yaratuvchi: Valiyev Ulug'bek, Telegram: @valiyevv_01, Tel: +998906373754

Kurslar (15 ta): HTML & CSS, JavaScript, Python, React.js, Node.js, SQL, Git, Linux, Docker, Vue.js, TypeScript, MongoDB, Flutter, Machine Learning, Cybersecurity

Narxlar:
- Free: bepul, 3 kun, 3 kurs
- Pro: 700,000 so'm/oy
- Max: 1,500,000 so'm/oy  
- VIP: 3,000,000 so'm/oy (ish kafolati bilan)

Qoidalar: O'zbek tilida, qisqa (2-4 jumla), foydalanuvchini ismi bilan chaqir.

Foydalanuvchi savoli: ${message}`

  try {
    if (!GEMINI_API_KEY) throw new Error('No API key');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      throw new Error('Gemini API error: ' + response.status);
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('No reply from Gemini');
    
    res.json({ reply });

  } catch (err) {
    console.error('AI chat error:', err.message);
    res.json({ reply: fallbackReply(message) });
  }
});

function fallbackReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('salom') || m.includes('assalom') || m.includes('hello'))
    return 'Assalomu alaykum! Men ITX AI yordamchisiman. Kurslar, narxlar yoki platforma haqida savollaringizga javob beraman!';
  if (m.includes('narx') || m.includes('tarif') || m.includes('plan'))
    return 'ITX tarif rejalari:\n• Free: 3 kun bepul\n• Pro: 700,000 so\'m\n• Max: 1,500,000 so\'m\n• VIP: 3,000,000 so\'m';
  if (m.includes('kurs'))
    return 'ITX da 15 ta professional kurs mavjud: HTML, CSS, JavaScript, Python, React, Node.js va boshqalar!';
  if (m.includes('aloqa') || m.includes('telegram') || m.includes('tel'))
    return 'Aloqa:\n📱 Telegram: @valiyevv_01\n📞 Tel: +998906373754\n📧 Email: thisvaliyev@gmail.com';
  return 'ITX platformasida 15 ta kurs mavjud. Qaysi mavzu haqida bilmoqchisiz?';
}

module.exports = router;
