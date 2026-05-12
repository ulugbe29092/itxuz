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

  const GEMINI_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAMtIm9Tawv24yhq4faNJOBwLOqegzM2ww';

  const name = userName ? userName.split(' ')[0] : null;
  const nameGreet = name ? `Foydalanuvchi ismi: ${name}.` : 'Mehmon foydalanuvchi.';

  const systemPrompt = `Sen ITX — O'zbekistondagi #1 IT ta'lim platformasining aqlli AI yordamchisisisan.
${nameGreet}

MUHIM QOIDALAR:
1. Har qanday savolga aniq va to'liq javob ber
2. IT texnologiyalar haqida savol bo'lsa — tushuntir (HTML, CSS, JS, Python va h.k.)
3. Faqat ITX haqida emas, umumiy IT savollarga ham javob ber
4. O'zbek tilida gapir, lekin texnik atamalarni inglizcha yoz
5. Qisqa va aniq: 2-5 jumla
6. Takrorlanma, har safar yangi ma'lumot ber

ITX PLATFORMASI:
- 15 ta professional kurs: HTML & CSS, JavaScript, Python, React.js, Node.js, SQL & PostgreSQL, Git & GitHub, Linux & Terminal, Docker & DevOps, Vue.js, TypeScript, MongoDB, Flutter & Dart, Machine Learning, Cybersecurity
- Narxlar: Free (bepul/3kun), Pro (700,000 so'm/oy), Max (1,500,000 so'm/oy), VIP (3,000,000 so'm/oy)
- VIP da ish kafolati bor
- Yaratuvchi: Valiyev Ulug'bek | Telegram: @valiyevv_01 | Tel: +998906373754

Foydalanuvchi savoli: "${message}"

Javob:`;

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.8, maxOutputTokens: 400 }
    });

    const result = await model.generateContent(systemPrompt);
    const reply = result.response.text();

    if (!reply || reply.trim().length < 3) throw new Error('Empty reply');
    res.json({ reply: reply.trim() });

  } catch (err) {
    console.error('AI chat error:', err.message);
    // Smart fallback — savolga qarab javob
    res.json({ reply: smartFallback(message, name) });
  }
});

function smartFallback(msg, name) {
  const m = msg.toLowerCase();
  const hi = name ? `${name}, ` : '';

  if (m.includes('html')) return `${hi}HTML (HyperText Markup Language) — web sahifalar yaratish uchun asosiy til. U sahifaning tuzilmasini belgilaydi: sarlavhalar, paragraflar, rasmlar, havolalar va boshqalar. ITX da HTML & CSS kursi mavjud!`;
  if (m.includes('css')) return `${hi}CSS (Cascading Style Sheets) — web sahifalarni bezash tili. Ranglar, shriftlar, joylashuv va animatsiyalarni boshqaradi. HTML bilan birgalikda ishlatiladi.`;
  if (m.includes('javascript') || m.includes('js')) return `${hi}JavaScript — web sahifalarni interaktiv qiluvchi dasturlash tili. Tugmalar, formalar, animatsiyalar va server bilan aloqa uchun ishlatiladi. Eng mashhur dasturlash tillaridan biri!`;
  if (m.includes('python')) return `${hi}Python — oddiy sintaksisli, kuchli dasturlash tili. Data Science, AI, web dasturlash va avtomatlashtirish uchun ishlatiladi. Boshlang'ichlar uchun eng yaxshi til!`;
  if (m.includes('react')) return `${hi}React.js — Facebook tomonidan yaratilgan JavaScript kutubxonasi. Zamonaviy SPA (Single Page Application) ilovalar yaratish uchun ishlatiladi. Hozir eng mashhur frontend texnologiya!`;
  if (m.includes('node')) return `${hi}Node.js — JavaScript ni server tomonida ishlatish imkonini beradi. Express.js bilan REST API yaratish, real-time ilovalar qurish uchun ishlatiladi.`;
  if (m.includes('sql') || m.includes('postgres') || m.includes('database')) return `${hi}SQL — ma'lumotlar bazasi bilan ishlash tili. PostgreSQL — eng kuchli ochiq manbali SQL database. Har qanday dasturchi bilishi shart!`;
  if (m.includes('git') || m.includes('github')) return `${hi}Git — versiya boshqaruv tizimi. Kod tarixini saqlaydi, jamoa bilan ishlashni osonlashtiradi. GitHub — kodni onlayn saqlash va ulashish platformasi.`;
  if (m.includes('docker') || m.includes('devops')) return `${hi}Docker — ilovalarni konteynerda ishlatish texnologiyasi. DevOps — dastur yaratish va deploy qilish jarayonini avtomatlashtirish. Zamonaviy IT da juda muhim!`;
  if (m.includes('narx') || m.includes('tarif') || m.includes('price') || m.includes('plan')) return `${hi}ITX tarif rejalari:\n• Free — bepul, 3 kun, 3 ta kurs\n• Pro — 700,000 so'm/oy, barcha kurslar\n• Max — 1,500,000 so'm/oy, mentor yordami\n• VIP — 3,000,000 so'm/oy, ish kafolati bilan`;
  if (m.includes('kurs') || m.includes('course')) return `${hi}ITX da 15 ta professional kurs bor: HTML & CSS, JavaScript, Python, React.js, Node.js, SQL, Git, Linux, Docker, Vue.js, TypeScript, MongoDB, Flutter, Machine Learning, Cybersecurity. Qaysi biri qiziqtiradi?`;
  if (m.includes('salom') || m.includes('assalom') || m.includes('hello') || m.includes('hi')) return `${hi}Assalomu alaykum! Men ITX AI yordamchisiman. IT texnologiyalar, kurslar yoki platforma haqida istalgan savolingizga javob beraman. Nima haqida bilmoqchisiz?`;
  if (m.includes('aloqa') || m.includes('telegram') || m.includes('tel') || m.includes('contact')) return `Aloqa:\n📱 Telegram: @valiyevv_01\n📞 Tel: +998 90 637 37 54\n📧 Email: thisvaliyev@gmail.com`;
  if (m.includes('sertifikat') || m.includes('certificate')) return `${hi}Ha, ITX da kursni tugatgandan so'ng rasmiy sertifikat beriladi. Pro, Max va VIP rejalarda sertifikat mavjud. LinkedIn profilingizga qo'shishingiz mumkin!`;
  if (m.includes('mentor')) return `${hi}Mentor yordami Max va VIP rejalarda mavjud. Shaxsiy mentor Telegram orqali savollaringizga javob beradi va loyihalaringizni tekshiradi.`;
  if (m.includes('ish') || m.includes('job') || m.includes('kafolat')) return `${hi}Ish kafolati faqat VIP rejada mavjud (3,000,000 so'm/oy). Kurslarni tugatib, loyihalarni topshirgandan so'ng IT kompaniyalarga tavsiya qilamiz va intervyuga tayyorlaymiz.`;

  return `${hi}Savolingiz uchun rahmat! Men ITX AI yordamchisiman. IT texnologiyalar (HTML, CSS, JavaScript, Python va h.k.), kurslar yoki narxlar haqida savollaringizga javob beraman. Aniqroq savol bering!`;
}

module.exports = router;
