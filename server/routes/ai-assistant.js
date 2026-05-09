const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')
const db = require('../db')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

// Gemini AI ni ishga tushirish
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// AI yordamchi - faqat admin uchun
router.post('/assist', adminMiddleware, async (req, res) => {
  try {
    const { prompt, context } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt talab qilinadi' })
    }

    // System prompt - admin yordamchisi
    const systemPrompt = `Siz ITX Learning Platform uchun professional AI yordamchisisiz. 
Sizning vazifangiz admin panelda ishlayotgan administratorga yordam berishdir.

Sizning imkoniyatlaringiz:
1. Quiz (test) savollarini yaratish
2. Kurs va dars ma'lumotlarini tahlil qilish
3. Foydalanuvchilar statistikasini tushuntirish
4. Tizim sozlamalariga maslahat berish
5. Ma'lumotlar bazasi so'rovlarini tuzish

Javoblaringiz:
- O'zbek tilida, aniq va tushunarli
- Professional va qisqa
- Amaliy va foydali
- Oddiy tilda, texnik jargonsiz

${context ? `\n\nHozirgi kontekst:\n${context}` : ''}`

    // Gemini modelini ishga tushirish
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const result = await model.generateContent([
      systemPrompt,
      `\n\nFoydalanuvchi so'rovi: ${prompt}`
    ])

    const response = await result.response
    const text = response.text()

    res.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Assistant error:', error)
    res.status(500).json({ 
      error: 'AI yordamchi xatolik berdi',
      details: error.message 
    })
  }
})

// Quiz yaratish - AI yordami bilan (admin panel uchun)
router.post('/generate-quiz', adminMiddleware, async (req, res) => {
  try {
    const { topic, difficulty, questionCount, lessonId } = req.body

    if (!topic || !lessonId) {
      return res.status(400).json({ error: 'Mavzu va dars ID talab qilinadi' })
    }

    const count = questionCount || 5
    const level = difficulty || 'medium'

    const prompt = `${topic} mavzusida ${count} ta ${level} darajadagi test savollarini yarating.

Har bir savol uchun:
- Savol matni (aniq va tushunarli)
- 4 ta javob varianti (A, B, C, D)
- To'g'ri javob belgisi

Format (JSON):
[
  {
    "question": "Savol matni",
    "options": [
      {"text": "A variant", "isCorrect": false},
      {"text": "B variant", "isCorrect": true},
      {"text": "C variant", "isCorrect": false},
      {"text": "D variant", "isCorrect": false}
    ]
  }
]

Faqat JSON formatda javob bering, boshqa matn yo'q.`

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // JSON ni tozalash
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const questions = JSON.parse(text)

    // Ma'lumotlar bazasiga saqlash
    const quizTitle = `${topic} - AI Generated Quiz`
    
    // Quiz yaratish
    const quizResult = await db.run(
      `INSERT INTO quizzes (lesson_id, title, pass_percentage) VALUES (?, ?, ?)`,
      [lessonId, quizTitle, 70]
    )

    const quizId = quizResult.lastID

    // Savollarni qo'shish
    for (const q of questions) {
      const questionResult = await db.run(
        `INSERT INTO quiz_questions (quiz_id, question_text, question_order) VALUES (?, ?, ?)`,
        [quizId, q.question, questions.indexOf(q) + 1]
      )

      const questionId = questionResult.lastID

      // Javoblarni qo'shish
      for (const opt of q.options) {
        await db.run(
          `INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)`,
          [questionId, opt.text, opt.isCorrect ? 1 : 0]
        )
      }
    }

    res.json({
      success: true,
      quizId,
      questionCount: questions.length,
      message: 'Quiz muvaffaqiyatli yaratildi'
    })

  } catch (error) {
    console.error('Generate quiz error:', error)
    res.status(500).json({ 
      error: 'Quiz yaratishda xatolik',
      details: error.message 
    })
  }
})

// Avtomatik quiz generatsiya (video yuklanganda)
router.post('/generate-quiz-auto', async (req, res) => {
  try {
    const { courseTitle, lessonTitle, questionCount } = req.body

    if (!courseTitle || !lessonTitle) {
      return res.status(400).json({ error: 'Kurs va dars nomi talab qilinadi' })
    }

    const count = questionCount || 30

    const prompt = `"${courseTitle}" kursi bo'yicha "${lessonTitle}" darsiga ${count} ta test savolini yarating.

Savollar:
- O'zbek tilida
- Aniq va tushunarli
- Amaliy va nazariy bilimlarni tekshiruvchi
- Har xil qiyinlik darajasida (oson, o'rta, qiyin)

Har bir savol uchun:
- Savol matni
- 4 ta javob varianti
- To'g'ri javob indeksi (0-3)

Format (JSON):
[
  {
    "question": "Savol matni?",
    "options": ["Variant 1", "Variant 2", "Variant 3", "Variant 4"],
    "correctIndex": 1
  }
]

MUHIM: Faqat JSON array qaytaring, boshqa matn yo'q!`

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // JSON ni tozalash
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Agar matn JSON bilan boshlanmasa, uni topish
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1)
    }

    const questions = JSON.parse(text)

    res.json({
      success: true,
      questions,
      count: questions.length
    })

  } catch (error) {
    console.error('Auto quiz generation error:', error)
    res.status(500).json({ 
      error: 'Avtomatik quiz yaratishda xatolik',
      details: error.message,
      questions: [] // Bo'sh array qaytarish
    })
  }
})

module.exports = router
