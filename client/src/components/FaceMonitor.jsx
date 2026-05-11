/**
 * FaceMonitor — Quiz paytida yuzni va ko'z harakatlarini kuzatuvchi komponent
 *
 * Qoidabuzarlik holatlari (faqat aniq):
 *  1. Yuz yo'q (3+ sekund)
 *  2. Bosh katta burilish (yaw > 40°) — pastga qarash HISOBLANMAYDI
 *  3. Ko'p odam (2+ yuz)
 *  4. Qorong'u — "Qorong'u joyda turmang" deb chiqaradi va quizdan chiqaradi
 *  5. Ko'z harakatlari — ±60° diapazonda ERKIN (chapga, o'ngga, yuqoriga, pastga)
 *     Faqat ±60° dan TASHQARIGA chiqsa ogohlantirish
 *  6. Ko'zlar 3+ sekund yopiq
 *  7. Boshqa tab/oyna/saytga o'tish - OGOHLANTIRISH
 *  8. 3 ta xato - quiz bloklash, faqat admin ruxsat bersa qayta topshirish
 *
 * Ovoz: O'zbek erkak ovozi, aniq, bir marta gapiradi
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { CameraOff, AlertTriangle, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react'

let faceapi = null

const MODELS_URL = '/models'
const CHECK_INTERVAL_MS = 500        // har 0.5 sekundda tekshir
const MAX_WARNINGS = 3
const YAW_THRESHOLD = 15             // bosh yon burilish 15%
const ABSENT_SECONDS = 2             // 2 sekund yuz yo'q bo'lsa ogohlantirish
const BRIGHTNESS_THRESHOLD = 30
const WARN_COOLDOWN_MS = 2000        // 2 sekund cooldown — ozidan ozi bermasin

// Ko'z harakatlari uchun parametrlar
const EYE_ASPECT_RATIO_THRESHOLD = 0.21
const GAZE_THRESHOLDS = {
  down: 15,
  left: 15,
  right: 15,
  up: 15
}
const EYE_CLOSED_DURATION = 2000         // 2 sekund ko'z yopiq bo'lsa
const GAZE_VIOLATION_DURATION = 2000     // 2 sekund ko'z chetga qarab tursa

// Bosh harakati parametrlari
const HEAD_MOVEMENT_THRESHOLD = 15

// ===== Yorug'lik tekshiruvi =====
function checkBrightness(video) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 48
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, 64, 48)
    const data = ctx.getImageData(0, 0, 64, 48).data
    let sum = 0
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
    }
    return sum / (data.length / 4)
  } catch {
    return 128 // default — yorug' deb hisoblash
  }
}

// ===== Yaw burchagi (faqat yon burilish) — foizga o'tkazish =====
function calcYaw(landmarks) {
  try {
    const pts = landmarks.positions
    const leftEye  = pts[36]
    const rightEye = pts[45]
    const noseTip  = pts[30]
    const eyeCenter = { x: (leftEye.x + rightEye.x) / 2 }
    const eyeWidth  = Math.abs(rightEye.x - leftEye.x)
    if (eyeWidth < 5) return 0
    const noseOffset = noseTip.x - eyeCenter.x
    // Foizga o'tkazish: noseOffset / eyeWidth * 100
    return Math.abs((noseOffset / eyeWidth) * 100)
  } catch {
    return 0
  }
}

// ===== Ko'z Aspect Ratio (EAR) — ko'z yopiq/ochiq =====
function calcEyeAspectRatio(eyePoints) {
  try {
    // Vertikal masofalar
    const v1 = Math.hypot(eyePoints[1].x - eyePoints[5].x, eyePoints[1].y - eyePoints[5].y)
    const v2 = Math.hypot(eyePoints[2].x - eyePoints[4].x, eyePoints[2].y - eyePoints[4].y)
    // Gorizontal masofa
    const h = Math.hypot(eyePoints[0].x - eyePoints[3].x, eyePoints[0].y - eyePoints[3].y)
    return (v1 + v2) / (2.0 * h)
  } catch {
    return 1.0
  }
}

// ===== Ko'z harakati tahlili — foizga o'tkazish =====
function analyzeGaze(landmarks, videoWidth, videoHeight) {
  try {
    const pts = landmarks.positions
    
    // Chap ko'z nuqtalari (36-41)
    const leftEye = [pts[36], pts[37], pts[38], pts[39], pts[40], pts[41]]
    // O'ng ko'z nuqtalari (42-47)
    const rightEye = [pts[42], pts[43], pts[44], pts[45], pts[46], pts[47]]
    
    // Ko'z ochiq/yopiq tekshiruvi
    const leftEAR = calcEyeAspectRatio(leftEye)
    const rightEAR = calcEyeAspectRatio(rightEye)
    const avgEAR = (leftEAR + rightEAR) / 2
    
    if (avgEAR < EYE_ASPECT_RATIO_THRESHOLD) {
      return { status: 'closed', direction: null, offsetPct: { x: 0, y: 0 } }
    }
    
    // Ko'z markazi
    const leftCenter = {
      x: (leftEye[0].x + leftEye[3].x) / 2,
      y: (leftEye[1].y + leftEye[5].y) / 2
    }
    const rightCenter = {
      x: (rightEye[0].x + rightEye[3].x) / 2,
      y: (rightEye[1].y + rightEye[5].y) / 2
    }
    
    // Burun uchi (30) — markaziy nuqta
    const noseTip = pts[30]
    
    // Foizga o'tkazish (video o'lchamiga nisbatan)
    const eyeCenterX = (leftCenter.x + rightCenter.x) / 2
    const eyeCenterY = (leftCenter.y + rightCenter.y) / 2
    
    const faceWidth = Math.abs(pts[16].x - pts[0].x) || (videoWidth * 0.3)
    const faceHeight = Math.abs(pts[8].y - pts[27].y) || (videoHeight * 0.4)
    
    const offsetPct = {
      x: Math.abs(eyeCenterX - noseTip.x) / faceWidth * 100,
      y: Math.abs(eyeCenterY - noseTip.y) / faceHeight * 100
    }
    
    // Yo'nalishni aniqlash (foiz chegaralariga qarab)
    let direction = null
    
    if (eyeCenterY > noseTip.y && offsetPct.y > GAZE_THRESHOLDS.down) direction = 'down'
    else if (eyeCenterY < noseTip.y && offsetPct.y > GAZE_THRESHOLDS.up) direction = 'up'
    else if (eyeCenterX < noseTip.x && offsetPct.x > GAZE_THRESHOLDS.left) direction = 'left'
    else if (eyeCenterX > noseTip.x && offsetPct.x > GAZE_THRESHOLDS.right) direction = 'right'
    
    return {
      status: 'open',
      direction,
      offsetPct,
      ear: avgEAR
    }
  } catch {
    return { status: 'unknown', direction: null, offsetPct: { x: 0, y: 0 } }
  }
}

// ===== Ovoz tizimi — eng yaxshi browser ovozi =====
let speechQueue = []
let isSpeaking = false
let cachedVoice = null

function getBestVoice() {
  if (cachedVoice) return cachedVoice
  const voices = window.speechSynthesis?.getVoices() || []
  // Prioritet: Google Uzbek > Google Russian > Microsoft Russian > any Russian > any
  const priority = [
    v => v.name.includes('Google') && (v.lang.startsWith('uz') || v.lang.startsWith('UZ')),
    v => v.name.includes('Google') && v.lang.startsWith('ru'),
    v => v.name.includes('Microsoft') && v.lang.startsWith('ru'),
    v => v.lang.startsWith('ru'),
    v => v.lang.startsWith('en') && v.name.includes('Google'),
    v => v.default,
  ]
  for (const fn of priority) {
    const found = voices.find(fn)
    if (found) { cachedVoice = found; return found }
  }
  return voices[0] || null
}

function speakUzbek(text) {
  // Navbatni tozalab, faqat oxirgi xabarni ayt
  speechQueue = [text]
  if (!isSpeaking) processQueue()
}

function processQueue() {
  if (speechQueue.length === 0) { isSpeaking = false; return }
  isSpeaking = true
  const text = speechQueue.shift()

  if (!window.speechSynthesis) { isSpeaking = false; return }
  window.speechSynthesis.cancel()

  const utt = new SpeechSynthesisUtterance(text)
  const voice = getBestVoice()
  if (voice) {
    utt.voice = voice
    utt.lang = voice.lang
  } else {
    utt.lang = 'ru-RU'
  }
  utt.rate = 1.0
  utt.pitch = 1.0
  utt.volume = 1.0

  utt.onend = () => { isSpeaking = false; setTimeout(processQueue, 200) }
  utt.onerror = () => { isSpeaking = false; processQueue() }

  window.speechSynthesis.speak(utt)
}

// Ogohlantirishlar matni (O'zbek tili - aniq va tushunarli)
const WARN_TEXTS = {
  absent:    [
    "Ekranga qarang. Imtihon davom etmoqda.",
    "Iltimos ekranga qarab turing. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
  multiface: "Kadrda bir nechta odam ko'rinmoqda. Bu ruxsat etilmaydi.",
  yaw:       [
    "Ekranga to'g'ri qarang.",
    "Iltimos ekranga qarab turing. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
  dark:      "Qorong'u joyda turmang. Imtihondan chiqarilasiz.",
  eyeClosed: [
    "Ko'zlaringizni oching va ekranga qarang.",
    "Ko'zlaringiz uzoq vaqt yopiq. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
  gazeDown:  [
    "Pastga qaramang. Ekranga qarang.",
    "Diqqatingiz chalg'idi. Ekranga qarang. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
  gazeLeft:  [
    "Chapga qaramang. Ekranga qarang.",
    "Diqqatingiz chalg'idi. Ekranga qarang. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
  gazeRight: [
    "O'ngga qaramang. Ekranga qarang.",
    "Diqqatingiz chalg'idi. Ekranga qarang. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
  gazeUp:    [
    "Tepaga qaramang. Ekranga qarang.",
    "Diqqatingiz chalg'idi. Ekranga qarang. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
  headMove:  [
    "Boshingizni ko'p qimirlatmang.",
    "Boshingizni tinch tutib turing. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
  tabSwitch: [
    "Boshqa oynaga o'tmang!",
    "Imtihon oynasidan chiqmang. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
  browserViolation: [
    "Boshqa brauzerga o'tmang! Faqat shu brauzerda davom eting.",
    "Brauzer o'zgardi. Bu ikkinchi ogohlantirish.",
    "Uchunchi ogohlantirish. Imtihon qayta boshlanadi.",
  ],
}

export default function FaceMonitor({ onViolation, onDarkExit, onAdminNotify, active = true }) {
  const videoRef   = useRef(null)
  const streamRef  = useRef(null)
  const intervalRef = useRef(null)
  const absentRef  = useRef(null)   // absent timer
  const lastWarnRef = useRef(0)     // oxirgi ogohlantirish vaqti
  const darkCountRef = useRef(0)    // qorong'u tekshiruv soni
  const gazeViolationRef = useRef(null) // ko'z harakati buzilishi timer
  const eyeClosedRef = useRef(null)     // ko'z yopiq timer
  const lastHeadPosRef = useRef(null)   // oxirgi bosh pozitsiyasi
  const headMoveCountRef = useRef(0)    // bosh harakati hisoblagichi

  const [status, setStatus]       = useState('loading')
  const [warnings, setWarnings]   = useState(0)
  const [cameraReady, setCameraReady] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [lastMsg, setLastMsg]     = useState('')
  const [expanded, setExpanded]   = useState(false)
  const [gazeStatus, setGazeStatus] = useState('') // ko'z harakati holati
  const warningsRef = useRef(0)   // sync ref

  // ===== Modellarni yuklash =====
  const loadModels = useCallback(async () => {
    if (faceapi) {
      console.log('Face-api models already loaded')
      return true
    }
    try {
      console.log('Loading face-api models...')
      const fa = await import('@vladmandic/face-api')
      faceapi = fa
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_URL),
      ])
      console.log('Face-api models loaded successfully')
      setModelsLoaded(true)
      return true
    } catch (err) {
      console.error('FaceMonitor models error:', err)
      setStatus('error')
      return false
    }
  }, [])

  // ===== Kamerani yoqish =====
  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...')
      
      // Kamera mavjudligini tekshirish
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Camera API not supported')
        setStatus('disabled')
        return
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        console.log('Camera started successfully')
        setCameraReady(true)
        setStatus('ok')
      }
    } catch (err) {
      console.error('Camera error:', err)
      console.warn('Face ID disabled - camera not available')
      setStatus('disabled')
      // Kamera yo'q bo'lsa ham davom etsin
    }
  }, [])

  // ===== Ogohlantirish berish + Screenshot =====
  const issueWarning = useCallback((type) => {
    const now = Date.now()
    if (now - lastWarnRef.current < WARN_COOLDOWN_MS) return

    lastWarnRef.current = now
    const newCount = warningsRef.current + 1
    warningsRef.current = newCount
    setWarnings(newCount)
    setStatus('warning')

    const texts = WARN_TEXTS[type]
    const text = Array.isArray(texts)
      ? texts[Math.min(newCount - 1, texts.length - 1)]
      : texts

    setLastMsg(text)
    speakUzbek(text)

    // Screenshot — har bir ogohlantirish uchun
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth || 320
        canvas.height = videoRef.current.videoHeight || 240
        const ctx = canvas.getContext('2d')
        ctx.drawImage(videoRef.current, 0, 0)
        const screenshot = canvas.toDataURL('image/jpeg', 0.7)
        onAdminNotify?.({
          type: newCount >= MAX_WARNINGS ? 'quiz_blocked' : 'warning',
          count: newCount,
          violationType: type,
          violationText: text,
          screenshot,
          timestamp: new Date().toISOString()
        })
      } catch (err) {
        console.error('Screenshot error:', err)
      }
    }

    setTimeout(() => setStatus('ok'), 3000)

    if (newCount >= MAX_WARNINGS) {
      setTimeout(() => {
        warningsRef.current = 0
        setWarnings(0)
        lastWarnRef.current = 0
        onViolation?.()
      }, 1500)
    }
  }, [onViolation, onAdminNotify])

  // ===== Yuzni tekshirish =====
  const checkFace = useCallback(async () => {
    if (!faceapi || !videoRef.current || !cameraReady) return
    if (videoRef.current.readyState < 2) return

    const video = videoRef.current

    // 1. Yorug'lik tekshiruvi
    const brightness = checkBrightness(video)
    if (brightness < BRIGHTNESS_THRESHOLD) {
      darkCountRef.current++
      if (darkCountRef.current >= 3) {
        speakUzbek(WARN_TEXTS.dark)
        setTimeout(() => onDarkExit?.(), 2500)
        return
      }
      return
    } else {
      darkCountRef.current = 0
    }

    try {
      const detections = await faceapi
        .detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 })
        )
        .withFaceLandmarks(true)

      // 2. Ko'p odam - DARHOL
      if (detections.length >= 2) {
        if (absentRef.current) { clearTimeout(absentRef.current); absentRef.current = null }
        if (gazeViolationRef.current) { clearTimeout(gazeViolationRef.current); gazeViolationRef.current = null }
        if (eyeClosedRef.current) { clearTimeout(eyeClosedRef.current); eyeClosedRef.current = null }
        // DARHOL ogohlantirish
        issueWarning('multiface')
        return
      }

      // 3. Yuz yo'q - 2 sekund (tezroq)
      if (detections.length === 0) {
        if (gazeViolationRef.current) { clearTimeout(gazeViolationRef.current); gazeViolationRef.current = null }
        if (eyeClosedRef.current) { clearTimeout(eyeClosedRef.current); eyeClosedRef.current = null }
        lastHeadPosRef.current = null
        if (!absentRef.current) {
          absentRef.current = setTimeout(() => {
            absentRef.current = null
            issueWarning('absent')
          }, ABSENT_SECONDS * 1000) // 500ms
        }
        return
      }

      // Yuz bor — absent timerni tozalash
      if (absentRef.current) {
        clearTimeout(absentRef.current)
        absentRef.current = null
      }

      const det = detections[0]

      // 4. Bosh harakati tekshiruvi — foizga o'tkazish (face width ga nisbatan)
      if (det.detection && det.detection.box) {
        const box = det.detection.box
        const faceW = box.width || 100
        const currentPos = {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2
        }

        if (lastHeadPosRef.current) {
          const movePct = Math.sqrt(
            Math.pow((currentPos.x - lastHeadPosRef.current.x) / faceW * 100, 2) +
            Math.pow((currentPos.y - lastHeadPosRef.current.y) / faceW * 100, 2)
          )

          if (movePct > HEAD_MOVEMENT_THRESHOLD) {
            issueWarning('headMove')
            lastHeadPosRef.current = currentPos
            return
          }
        }

        lastHeadPosRef.current = currentPos
      }

      // 5. Faqat YON burilish (pastga qarash hisoblanmaydi) - DARHOL
      if (det.landmarks) {
        const yaw = calcYaw(det.landmarks)
        if (yaw > YAW_THRESHOLD) {
          if (gazeViolationRef.current) { clearTimeout(gazeViolationRef.current); gazeViolationRef.current = null }
          if (eyeClosedRef.current) { clearTimeout(eyeClosedRef.current); eyeClosedRef.current = null }
          // DARHOL ogohlantirish
          issueWarning('yaw')
          return
        }

        // 6. Ko'z harakatlari tahlili (pixel asosida) - TEZROQ
        const gazeData = analyzeGaze(det.landmarks, video.videoWidth, video.videoHeight)
        
        // Ko'z yopiq - 2 sekund davomida (tezroq)
        if (gazeData.status === 'closed') {
          if (gazeViolationRef.current) { clearTimeout(gazeViolationRef.current); gazeViolationRef.current = null }
          if (!eyeClosedRef.current) {
            eyeClosedRef.current = setTimeout(() => {
              eyeClosedRef.current = null
              issueWarning('eyeClosed')
            }, EYE_CLOSED_DURATION) // 2 sekund
          }
          return
        } else {
          if (eyeClosedRef.current) {
            clearTimeout(eyeClosedRef.current)
            eyeClosedRef.current = null
          }
        }

        // Ko'z harakati — yo'nalish bo'yicha - 2 SEKUND
        if (gazeData.direction) {
          if (eyeClosedRef.current) { clearTimeout(eyeClosedRef.current); eyeClosedRef.current = null }
          
          const directionText = {
            'down': '↓ Pastga',
            'up': '↑ Tepaga',
            'left': '← Chapga',
            'right': 'O\'ngga →'
          }[gazeData.direction]
          setGazeStatus(directionText || '')
          
          if (!gazeViolationRef.current) {
            gazeViolationRef.current = setTimeout(() => {
              gazeViolationRef.current = null
              const warnType = {
                'down': 'gazeDown',
                'up': 'gazeUp',
                'left': 'gazeLeft',
                'right': 'gazeRight'
              }[gazeData.direction]
              if (warnType) issueWarning(warnType)
            }, GAZE_VIOLATION_DURATION) // 2 SEKUND
          }
          return
        } else {
          setGazeStatus('')
          if (gazeViolationRef.current) {
            clearTimeout(gazeViolationRef.current)
            gazeViolationRef.current = null
          }
        }
      }

      setStatus('ok')
    } catch {
      // Silent fail
    }
  }, [cameraReady, issueWarning, onDarkExit])

  // ===== Brauzer va tab tekshirish - FAQAT visibility change =====
  const initialBrowserRef = useRef(null)
  const initialTabIdRef = useRef(null)

  // ===== Init =====
  useEffect(() => {
    if (!active) { setStatus('disabled'); return }
    let mounted = true
    
    // Ovozlarni oldindan yuklash
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
    
    // Tab ID ni saqlash (faqat birinchi marta)
    if (!initialTabIdRef.current) {
      initialTabIdRef.current = sessionStorage.getItem('quiz_tab_id') || Date.now().toString()
      sessionStorage.setItem('quiz_tab_id', initialTabIdRef.current)
      localStorage.setItem('quiz_active_tab', initialTabIdRef.current)
    }
    
    // Tab switch aniqlash - FAQAT visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && active) {
        issueWarning('tabSwitch')
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    ;(async () => {
      const ok = await loadModels()
      if (!ok || !mounted) return
      await startCamera()
    })()
    return () => {
      mounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (absentRef.current) clearTimeout(absentRef.current)
      if (gazeViolationRef.current) clearTimeout(gazeViolationRef.current)
      if (eyeClosedRef.current) clearTimeout(eyeClosedRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      localStorage.removeItem('quiz_active_tab')
      sessionStorage.removeItem('quiz_tab_id')
      window.speechSynthesis?.cancel()
      speechQueue = []
      isSpeaking = false
    }
  }, [active, loadModels, startCamera, issueWarning])

  // ===== Interval =====
  useEffect(() => {
    if (!cameraReady || !modelsLoaded) return
    intervalRef.current = setInterval(checkFace, CHECK_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [cameraReady, modelsLoaded, checkFace])

  if (!active || status === 'disabled') return null

  const dotColor = { loading:'#94a3b8', ok:'#22c55e', warning:'#ef4444', error:'#f59e0b' }[status] || '#94a3b8'
  const label    = { loading:'Yuklanmoqda...', ok:'Monitoring faol', warning:'Ogohlantirish!', error:'Kamera yo\'q' }[status] || ''

  return (
    <>
      <div
        className={`fm-widget ${status === 'warning' ? 'fm-warn-active' : ''}`}
        onClick={() => setExpanded(e => !e)}
        title="Face ID monitoring — bosing"
      >
        <div className="fm-cam-box">
          <video ref={videoRef} className="fm-video" muted playsInline autoPlay />
          {(status === 'loading' || status === 'error') && (
            <div className="fm-cam-overlay">
              {status === 'loading'
                ? <div className="fm-spin" />
                : <CameraOff size={18} color="#f59e0b" />
              }
            </div>
          )}
        </div>

        <div className="fm-bar">
          <span className="fm-dot" style={{ background: dotColor }} />
          <span className="fm-label">{label}</span>
          <div className="fm-dots">
            {[1,2,3].map(i => (
              <span key={i} className="fm-warn-pip"
                style={{ background: i <= warnings ? '#ef4444' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
        </div>

        {expanded && (
          <div className="fm-detail">
            <div className="fm-detail-row"><Eye size={12}/> {warnings}/{MAX_WARNINGS} ogohlantirish</div>
            {gazeStatus && (
              <div className="fm-detail-row" style={{ color: '#f59e0b' }}>
                <EyeOff size={12}/> {gazeStatus}
              </div>
            )}
            {lastMsg && <div className="fm-detail-row fm-detail-warn"><AlertTriangle size={12}/> {lastMsg}</div>}
            <div className="fm-detail-hint">Ko'z: 15% • Bosh: 15% • 0.5s kutish</div>
          </div>
        )}
      </div>

      {/* Qizil border overlay */}
      {status === 'warning' && (
        <div className="fm-border-overlay">
          <div className="fm-warn-popup">
            <AlertTriangle size={28} color="#ef4444" />
            <div className="fm-warn-count">{warnings}/{MAX_WARNINGS}</div>
            <div className="fm-warn-text">{lastMsg}</div>
          </div>
        </div>
      )}

      <style>{`
        .fm-widget{
          position:fixed; bottom:5.5rem; right:1.5rem; z-index:9990;
          background:rgba(20,20,40,0.96); border:1px solid rgba(99,102,241,0.25);
          border-radius:14px; overflow:hidden; cursor:pointer;
          transition:border-color .3s, box-shadow .3s;
          box-shadow:0 6px 24px rgba(0,0,0,0.5); min-width:130px;
          user-select:none;
        }
        .fm-widget:hover{ border-color:var(--primary); }
        .fm-widget.fm-warn-active{
          border-color:#ef4444 !important;
          animation:fmBlink .6s ease infinite alternate;
        }
        @keyframes fmBlink{
          from{ box-shadow:0 0 8px rgba(239,68,68,0.3); }
          to  { box-shadow:0 0 22px rgba(239,68,68,0.7); }
        }
        .fm-cam-box{ position:relative; width:130px; height:98px; background:#000; overflow:hidden; }
        .fm-video{ width:100%; height:100%; object-fit:cover; transform:scaleX(-1); display:block; }
        .fm-cam-overlay{
          position:absolute; inset:0; background:rgba(0,0,0,0.65);
          display:flex; align-items:center; justify-content:center;
        }
        .fm-spin{
          width:22px; height:22px; border:2px solid rgba(255,255,255,0.2);
          border-top-color:var(--primary); border-radius:50%;
          animation:spin .8s linear infinite;
        }
        .fm-bar{
          display:flex; align-items:center; gap:5px;
          padding:5px 8px; background:rgba(0,0,0,0.4);
        }
        .fm-dot{ width:7px; height:7px; border-radius:50%; flex-shrink:0; transition:background .3s; }
        .fm-label{ font-size:0.68rem; color:#94a3b8; flex:1; white-space:nowrap; overflow:hidden; }
        .fm-dots{ display:flex; gap:3px; }
        .fm-warn-pip{ width:8px; height:8px; border-radius:50%; transition:background .3s; }
        .fm-detail{
          padding:6px 8px; border-top:1px solid rgba(255,255,255,0.06);
          display:flex; flex-direction:column; gap:3px;
        }
        .fm-detail-row{ display:flex; align-items:center; gap:4px; font-size:0.68rem; color:#94a3b8; }
        .fm-detail-warn{ color:#ef4444; }
        .fm-detail-hint{ font-size:0.62rem; color:rgba(148,163,184,0.6); margin-top:2px; }

        /* Qizil border overlay */
        .fm-border-overlay{
          position:fixed; inset:0; z-index:9989; pointer-events:none;
          border:5px solid rgba(239,68,68,0.7);
          background:rgba(239,68,68,0.06);
          display:flex; align-items:flex-start; justify-content:center;
          padding-top:72px;
          animation:fmOverIn .2s ease;
        }
        @keyframes fmOverIn{ from{opacity:0} to{opacity:1} }
        .fm-warn-popup{
          background:rgba(10,10,20,0.95); border:2px solid #ef4444;
          border-radius:14px; padding:1rem 1.5rem; text-align:center;
          display:flex; flex-direction:column; align-items:center; gap:6px;
          box-shadow:0 8px 32px rgba(239,68,68,0.35);
        }
        .fm-warn-count{ font-size:1rem; font-weight:800; color:#ef4444; }
        .fm-warn-text{ font-size:0.82rem; color:#e2e8f0; max-width:220px; line-height:1.4; }

        /* TELEFON VERSIYASI - RESPONSIVE */
        @media(max-width:768px){
          .fm-widget{ 
            bottom:1rem; 
            right:0.5rem; 
            min-width:100px;
            border-radius:10px;
          }
          .fm-cam-box{ 
            width:100px; 
            height:75px; 
          }
          .fm-bar{
            padding:4px 6px;
            gap:4px;
          }
          .fm-label{ 
            font-size:0.6rem; 
          }
          .fm-dot{ 
            width:6px; 
            height:6px; 
          }
          .fm-warn-pip{ 
            width:6px; 
            height:6px; 
          }
          .fm-detail{
            padding:5px 6px;
            gap:2px;
          }
          .fm-detail-row{ 
            font-size:0.6rem; 
            gap:3px;
          }
          .fm-detail-hint{ 
            font-size:0.55rem; 
          }
          .fm-border-overlay{
            border-width:3px;
            padding-top:60px;
          }
          .fm-warn-popup{
            padding:0.8rem 1rem;
            border-radius:10px;
            gap:4px;
            max-width:90%;
          }
          .fm-warn-count{ 
            font-size:0.9rem; 
          }
          .fm-warn-text{ 
            font-size:0.75rem; 
            max-width:200px;
          }
        }

        /* JUDA KICHIK TELEFONLAR */
        @media(max-width:480px){
          .fm-widget{ 
            bottom:0.8rem; 
            right:0.4rem; 
            min-width:90px;
          }
          .fm-cam-box{ 
            width:90px; 
            height:68px; 
          }
          .fm-bar{
            padding:3px 5px;
          }
          .fm-label{ 
            font-size:0.55rem; 
          }
          .fm-warn-popup{
            padding:0.6rem 0.8rem;
            max-width:95%;
          }
          .fm-warn-text{ 
            font-size:0.7rem; 
            max-width:180px;
          }
        }
      `}</style>
    </>
  )
}
