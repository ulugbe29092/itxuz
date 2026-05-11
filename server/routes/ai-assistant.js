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

// Avtomatik quiz generatsiya (dars qo'shilganda yoki admin paneldan)
router.post('/generate-quiz-auto', adminMiddleware, async (req, res) => {
  try {
    const { courseTitle, lessonTitle, lessonDescription, videoUrl, questionCount } = req.body

    if (!lessonTitle) {
      return res.status(400).json({ error: 'Dars nomi talab qilinadi' })
    }

    const count = Math.min(parseInt(questionCount) || 30, 50)

    // YouTube video ID ni ajratib olish
    let youtubeInfo = ''
    if (videoUrl) {
      const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
      if (ytMatch) {
        youtubeInfo = `\nYouTube video ID: ${ytMatch[1]} (https://www.youtube.com/watch?v=${ytMatch[1]})`
      }
    }

    // Tavsif bo'lsa undan foydalanish
    const descriptionInfo = lessonDescription
      ? `\nDars tavsifi: "${lessonDescription}"`
      : ''

    const prompt = `Sen professional IT o'qituvchisan. Quyidagi dars uchun ${count} ta test savol yoz:

DARS MA'LUMOTLARI:
- Kurs: "${courseTitle || 'IT kursi'}"
- Dars nomi: "${lessonTitle}"${descriptionInfo}${youtubeInfo}

SAVOL TALABLARI:
- O'zbek tilida, aniq va tushunarli
- FAQAT dars nomi va tavsifidagi mavzularga oid
- Har xil qiyinlik: oson (30%), o'rta (50%), qiyin (20%)
- Amaliy va nazariy bilimlarni tekshiruvchi
- Har bir savolda 4 ta variant, faqat 1 tasi to'g'ri
- Variantlar bir-biridan aniq farq qilsin

FAQAT JSON array qaytaring (boshqa hech qanday matn yo'q):
[
  {
    "question": "Savol matni?",
    "options": ["Variant A", "Variant B", "Variant C", "Variant D"],
    "correctIndex": 1
  }
]`

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // JSON ni tozalash
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1)
    }

    const questions = JSON.parse(text)

    res.json({
      success: true,
      questions,
      count: questions.length,
      usedDescription: !!lessonDescription,
      usedVideo: !!youtubeInfo
    })

  } catch (error) {
    console.error('Auto quiz generation error:', error)
    res.status(500).json({ 
      error: 'Avtomatik quiz yaratishda xatolik',
      details: error.message,
      questions: []
    })
  }
})

module.exports = router
