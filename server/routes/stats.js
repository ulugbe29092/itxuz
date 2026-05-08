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
      total_users: +users.rows[0].count || 1250,
      total_courses: +courses.rows[0].count || 15,
      total_videos: +lessons.rows[0].count || 340,
      rating: 4.9,
    });
  } catch {
    res.json({ total_users: 1250, total_courses: 15, total_videos: 340, rating: 4.9 });
  }
});

// POST /api/stats/ai-chat  — Google Gemini AI
router.post('/ai-chat', async (req, res) => {
  const { message, userName, userRole } = req.body;
  if (!message) return res.json({ reply: 'Xabar yuboring.' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCcwGs8dz2RtkKGLk_6007bIK4M5Kij_-M';

  // Foydalanuvchi konteksti
  const greeting = userName
    ? (userRole === 'admin'
        ? `Siz admin ${userName} bilan gaplashyapsiz. Uni hurmat bilan "Siz" deb murojaat qiling va ism-familiyasi bilan chaqiring.`
        : `Foydalanuvchi ismi: ${userName}. Uni doim ismi bilan chaqiring.`)
    : 'Mehmon foydalanuvchi.';

  const systemPrompt = `Sen ITX platformasining AI yordamchisisisan. 
${greeting}

ITX haqida to'liq ma'lumot:
- ITX — O'zbekistondagi #1 onlayn IT o'rgatish platformasi
- Yaratuvchi: Valiyev Ulug'bek
- Telegram: @valiyevv_01
- Telefon: +998906373754
- Email: thisvaliyev@gmail.com

Kurslar (15 ta):
HTML & CSS, JavaScript, Python, React.js, Node.js, SQL & PostgreSQL, Git & GitHub, Linux & Terminal, Docker & DevOps, Vue.js, TypeScript, MongoDB, Flutter & Dart, Machine Learning, Cybersecurity

Tarif rejalari:
- Free: 3 kun bepul, 3 ta kurs, AI cheklangan
- Pro: 700,000 so'm/oy — barcha kurslar, AI chat, sertifikat
- Max: 1,500,000 so'm/oy — Pro + mentor, loyiha tekshiruvi, prioritet yordam
- VIP: 3,000,000 so'm/oy — Max + ish kafolati, CV tayyorlash, intervyu tayyorligi, admin bilan aloqa

Qoidalar:
1. Doim o'zbek tilida javob ber
2. Qisqa va aniq javob ber (3-5 jumla)
3. Foydalanuvchini ismi bilan chaqir
4. Sayt haqida ko'proq ma'lumot ber
5. Saytdan tashqari savollarga ham javob ber, lekin saytga qaytishga undab qo'y
6. Admin bo'lsa "Siz" deb murojaat qil`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt + '\n\nFoydalanuvchi: ' + message }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (!response.ok) throw new Error('Gemini API error: ' + response.status);

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || fallbackReply(message);
    res.json({ reply });

  } catch (err) {
    console.error('Gemini error:', err.message);
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
