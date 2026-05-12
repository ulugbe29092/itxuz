const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')
const pool = require('../db')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

// Gemini AI — API key .env dan olish, fallback bilan
const GEMINI_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAMtIm9Tawv24yhq4faNJOBwLOqegzM2ww'
const genAI = new GoogleGenerativeAI(GEMINI_KEY)

// Gemini model yaratish — har safar yangi instance
function getModel(modelName = 'gemini-1.5-flash') {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    }
  })
}

// JSON tozalash utility
function cleanJSON(text) {
  let t = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const start = t.indexOf('[')
  const end = t.lastIndexOf(']')
  if (start !== -1 && end !== -1) t = t.substring(start, end + 1)
  return t
}

// ===== 1. AI YORDAMCHI (admin uchun) =====
router.post('/assist', adminMiddleware, async (req, res) => {
  try {
    const { prompt, context } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt talab qilinadi' })

    const systemPrompt = `Sen ITX Learning Platform uchun professional AI yordamchisisiz.
Vazifang: admin panelda ishlayotgan administratorga yordam berish.

Imkoniyatlar:
1. Quiz savollarini yaratish
2. Kurs va dars ma'lumotlarini tahlil qilish
3. Foydalanuvchilar statistikasini tushuntirish
4. Tizim sozlamalariga maslahat berish

Qoidalar:
- O'zbek tilida, aniq va qisqa (2-4 jumla)
- Professional va amaliy
${context ? `\nKontekst:\n${context}` : ''}

Savol: ${prompt}`

    const model = getModel()
    const result = await model.generateContent(systemPrompt)
    const text = result.response.text()

    res.json({ success: true, response: text, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('AI assist error:', error.message)
    res.status(500).json({ error: 'AI xatolik berdi', details: error.message })
  }
})

// ===== 2. QUIZ YARATISH (admin, mavzu bo'yicha) =====
router.post('/generate-quiz', adminMiddleware, async (req, res) => {
  try {
    const { topic, difficulty = 'medium', questionCount = 10, lessonId } = req.body
    if (!topic || !lessonId) return res.status(400).json({ error: 'Mavzu va dars ID kerak' })

    const prompt = `"${topic}" mavzusida ${questionCount} ta ${difficulty} darajadagi test savol yoz.

FAQAT JSON array qaytaring:
[{"question":"Savol?","options":["A","B","C","D"],"correctIndex":1}]`

    const model = getModel()
    const result = await model.generateContent(prompt)
    let text = cleanJSON(result.response.text())
    const questions = JSON.parse(text)

    // Quiz yaratish
    const quizRes = await pool.query(
      'INSERT INTO quizzes (lesson_id, title, pass_percentage) VALUES ($1, $2, 70) RETURNING id',
      [lessonId, `${topic} - AI Quiz`]
    )
    const quizId = quizRes.rows[0].id

    // Savollarni saqlash
    for (const q of questions) {
      const qRes = await pool.query(
        'INSERT INTO quiz_questions (quiz_id, question_text) VALUES ($1, $2) RETURNING id',
        [quizId, q.question]
      )
      const qId = qRes.rows[0].id
      for (let i = 0; i < q.options.length; i++) {
        await pool.query(
          'INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
          [qId, q.options[i], i === q.correctIndex ? 1 : 0]
        )
      }
    }

    res.json({ success: true, quizId, questionCount: questions.length })
  } catch (error) {
    console.error('Generate quiz error:', error.message)
    res.status(500).json({ error: 'Quiz yaratishda xatolik', details: error.message })
  }
})

// ===== 3. AVTOMATIK QUIZ (dars nomi + tavsif + video asosida) =====
router.post('/generate-quiz-auto', authMiddleware, async (req, res) => {
  try {
    const { courseTitle, lessonTitle, lessonDescription, videoUrl, questionCount } = req.body
    if (!lessonTitle) return res.status(400).json({ error: 'Dars nomi kerak' })

    const count = Math.min(parseInt(questionCount) || 30, 50)

    // YouTube video ID
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

    const model = getModel()
    const result = await model.generateContent(prompt)
    let text = cleanJSON(result.response.text())

    let questions
    try {
      questions = JSON.parse(text)
    } catch {
      throw new Error('AI noto\'g\'ri format qaytardi')
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI bo\'sh javob qaytardi')
    }

    // Validatsiya
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
      error: 'Quiz yaratishda xatolik: ' + error.message,
      details: error.message,
      questions: []
    })
  }
})

module.exports = router
