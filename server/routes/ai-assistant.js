const express = require('express')
const router = express.Router()
const pool = require('../db')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

const GEMINI_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCcwGs8dz2RtkKGLk_6007bIK4M5Kij_-M'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

// Gemini API chaqirish — fetch bilan (Vercel da ishonchli)
async function callGemini(prompt, maxTokens = 8192) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens }
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API ${res.status}: ${err.substring(0, 200)}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini bo\'sh javob qaytardi')
  return text
}

// JSON tozalash
function cleanJSON(text) {
  let t = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const start = t.indexOf('[')
  const end = t.lastIndexOf(']')
  if (start !== -1 && end !== -1) t = t.substring(start, end + 1)
  return t
}

// ===== 1. AI YORDAMCHI (admin) =====
router.post('/assist', adminMiddleware, async (req, res) => {
  try {
    const { prompt, context } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt kerak' })

    const fullPrompt = `Sen ITX Learning Platform uchun AI yordamchisisiz.
Vazifang: admin panelda ishlayotgan administratorga yordam berish.
O'zbek tilida, aniq va qisqa javob ber.
${context ? `Kontekst: ${context}\n` : ''}
Savol: ${prompt}`

    const text = await callGemini(fullPrompt, 400)
    res.json({ success: true, response: text })
  } catch (error) {
    console.error('AI assist error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// ===== 2. AVTOMATIK QUIZ (dars asosida) =====
router.post('/generate-quiz-auto', authMiddleware, async (req, res) => {
  try {
    const { courseTitle, lessonTitle, lessonDescription, videoUrl, questionCount } = req.body
    if (!lessonTitle) return res.status(400).json({ error: 'Dars nomi kerak' })

    const count = Math.min(parseInt(questionCount) || 30, 50)

    let videoInfo = ''
    if (videoUrl) {
      const m = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
      if (m) videoInfo = `\nYouTube: https://www.youtube.com/watch?v=${m[1]}`
    }
    const descInfo = lessonDescription ? `\nTavsif: "${lessonDescription}"` : ''

    const prompt = `Sen professional IT o'qituvchisan. Quyidagi dars uchun AYNAN ${count} ta test savol yoz.

DARS:
- Kurs: "${courseTitle || 'IT kursi'}"
- Dars: "${lessonTitle}"${descInfo}${videoInfo}

TALABLAR:
- O'zbek tilida, aniq
- Dars mavzusiga oid
- Qiyinlik: oson 30%, o'rta 50%, qiyin 20%
- 4 ta variant, 1 ta to'g'ri

FAQAT JSON (boshqa matn yo'q):
[{"question":"...","options":["A","B","C","D"],"correctIndex":0}]`

    const text = await callGemini(prompt, 8192)
    const cleaned = cleanJSON(text)

    let questions
    try {
      questions = JSON.parse(cleaned)
    } catch {
      throw new Error('AI noto\'g\'ri format qaytardi. Qayta urinib ko\'ring.')
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI bo\'sh javob qaytardi')
    }

    const valid = questions.filter(q =>
      q.question &&
      Array.isArray(q.options) && q.options.length === 4 &&
      typeof q.correctIndex === 'number' &&
      q.correctIndex >= 0 && q.correctIndex <= 3
    )

    res.json({
      success: true,
      questions: valid,
      count: valid.length,
      usedDescription: !!lessonDescription,
      usedVideo: !!videoInfo
    })
  } catch (error) {
    console.error('Auto quiz error:', error.message)
    res.status(500).json({
      error: error.message,
      questions: []
    })
  }
})

// ===== 3. QUIZ YARATISH (mavzu bo'yicha) =====
router.post('/generate-quiz', adminMiddleware, async (req, res) => {
  try {
    const { topic, difficulty = 'medium', questionCount = 10, lessonId } = req.body
    if (!topic || !lessonId) return res.status(400).json({ error: 'Mavzu va dars ID kerak' })

    const prompt = `"${topic}" mavzusida ${questionCount} ta ${difficulty} darajadagi test savol yoz.
FAQAT JSON: [{"question":"...","options":["A","B","C","D"],"correctIndex":1}]`

    const text = await callGemini(prompt, 4096)
    const questions = JSON.parse(cleanJSON(text))

    const quizRes = await pool.query(
      'INSERT INTO quizzes (lesson_id, title, pass_percentage) VALUES ($1, $2, 70) RETURNING id',
      [lessonId, `${topic} - AI Quiz`]
    )
    const quizId = quizRes.rows[0].id

    for (const q of questions) {
      const qRes = await pool.query(
        'INSERT INTO quiz_questions (quiz_id, question_text) VALUES ($1, $2) RETURNING id',
        [quizId, q.question]
      )
      for (let i = 0; i < q.options.length; i++) {
        await pool.query(
          'INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
          [qRes.rows[0].id, q.options[i], i === q.correctIndex]
        )
      }
    }

    res.json({ success: true, quizId, questionCount: questions.length })
  } catch (error) {
    console.error('Generate quiz error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
