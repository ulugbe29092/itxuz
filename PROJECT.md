# ITX Learning Platform — Full Project Documentation

> **Bu hujjat boshqa AI yoki dasturchi loyihani 0 dan qayta qura olishi uchun yozilgan.**
> Barcha arxitektura, texnologiyalar, fayllar, API endpointlar, database schema va biznes logika to'liq tasvirlangan.

---

## 📋 Loyiha Haqida

**ITX** — O'zbekistondagi onlayn IT ta'lim platformasi.

- **Muallif**: Valiyev Ulug'bek
- **Telegram**: @valiyevv_01
- **Tel**: +998906373754
- **Email**: thisvaliyev@gmail.com
- **Live URL**: https://itxuz.vercel.app
- **API URL**: https://itxuz.onrender.com

---

## 🏗️ Arxitektura

```
itx-app/
├── client/          # React 18 + Vite (Frontend)
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   │   └── admin/   # Admin panel pages
│   │   └── store/       # Zustand state
│   ├── public/
│   │   └── models/      # face-api.js ML models
│   ├── vercel.json      # React Router SPA config
│   └── vite.config.js
│
└── server/          # Node.js + Express (Backend)
    ├── routes/      # API routes
    ├── middleware/  # Auth middleware
    ├── db.js        # Database adapter (SQLite/PostgreSQL)
    ├── schema.sql   # PostgreSQL schema
    └── index.js     # Entry point
```

---

## 🛠️ Texnologiyalar

### Frontend (`client/`)
| Kutubxona | Versiya | Maqsad |
|-----------|---------|--------|
| React | 18.3.1 | UI framework |
| React Router DOM | 6.26.2 | Client-side routing |
| Vite | 5.4.8 | Build tool |
| Axios | 1.7.7 | HTTP client |
| Zustand | 5.0.0 | State management |
| @vladmandic/face-api | 1.7.15 | Face detection (quiz proctoring) |
| lucide-react | 0.447.0 | Icons |
| react-hot-toast | 2.4.1 | Notifications |

### Backend (`server/`)
| Kutubxona | Versiya | Maqsad |
|-----------|---------|--------|
| Express | 4.19.2 | Web framework |
| better-sqlite3 | 12.9.0 | SQLite database |
| pg | 8.11.5 | PostgreSQL client |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT authentication |
| multer | 1.4.5 | File upload |
| @google/generative-ai | 0.21.0 | Gemini AI |
| uuid | 9.0.1 | Unique IDs |
| cors | 2.8.5 | CORS middleware |
| dotenv | 16.4.5 | Environment variables |

---

## 🚀 O'rnatish va Ishga Tushirish

### 1. Repository clone qilish
```bash
git clone https://github.com/ulugbe29092/itxuz.git
cd itxuz/itx-app
```

### 2. Server o'rnatish
```bash
cd server
npm install
```

**`server/.env` fayl yaratish:**
```env
PORT=5002
DATABASE_URL=postgresql://user:password@localhost:5432/itx
JWT_SECRET=itx-jwt-secret-2024-ultra-secure
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Client o'rnatish
```bash
cd ../client
npm install
```

### 4. Ishga tushirish

**Terminal 1 — Server:**
```bash
cd server
npm run dev
# Server: http://localhost:5002
```

**Terminal 2 — Client:**
```bash
cd client
npm run dev
# Client: http://localhost:3000
```

### 5. Admin login
- URL: http://localhost:3000/admin
- Username: `ulugbek`
- Password: `ulugbek`

---

## 🗄️ Database

### Adapter (`server/db.js`)
Database adapter **ikki rejimda** ishlaydi:
1. **PostgreSQL** — `DATABASE_URL` env variable bo'lsa
2. **SQLite** — PostgreSQL bo'lmasa, `itx.db` fayl yaratadi

SQLite adapter PostgreSQL sintaksisini avtomatik konvertatsiya qiladi:
- `$1, $2` → `?`
- `NOW()` → `datetime('now')`
- `SERIAL PRIMARY KEY` → `INTEGER PRIMARY KEY AUTOINCREMENT`
- `BOOLEAN` → `INTEGER (0/1)`
- `RETURNING` → alohida SELECT

### Jadvallar

#### `users`
```sql
id, first_name, last_name, email, phone, username, password_hash,
role (user|admin), plan (free|pro|max|vip), plan_expires_at,
is_blocked, created_at, profile_image, age, location, avatar
```

#### `courses`
```sql
id, title, slug (unique), description, icon, order_num, created_at
```

#### `lessons`
```sql
id, course_id (FK), title, description, video_url, video_type (youtube|local),
duration_minutes, order_num, is_blocked, created_at
```

#### `quizzes`
```sql
id, lesson_id (FK), title, pass_percentage (default 70), created_at
```

#### `quiz_questions`
```sql
id, quiz_id (FK), question_text, created_at
```

#### `quiz_options`
```sql
id, question_id (FK), option_text, is_correct (boolean)
```

#### `user_progress`
```sql
id, user_id (FK), lesson_id (FK), watched, quiz_passed, quiz_score,
completed_at — UNIQUE(user_id, lesson_id)
```

#### `user_quiz_attempts`
```sql
id, user_id (FK), quiz_id (FK), score, passed, reset_count, attempted_at
```

#### `payments`
```sql
id, user_id (FK), plan (pro|max|vip), amount, status (pending|approved|rejected),
payment_proof_image, created_at
```

#### `certificates`
```sql
id, user_id (FK), course_id (FK), issued_at, certificate_code (unique)
```

#### `comments`
```sql
id, user_id (FK), lesson_id (FK), content, rating (1-5), created_at
```

#### `admin_notifications`
```sql
id, user_id (FK), quiz_id (FK), violation_type, violation_text,
violation_count, screenshot (base64), created_at
```

#### `quiz_retake_requests`
```sql
id, user_id (FK), quiz_id (FK), status (pending|approved|rejected),
reset_count, reason, created_at, updated_at
```

#### `quiz_violations`
```sql
id, user_id (FK), quiz_id (FK), violation_type, violation_text,
screenshot (base64), created_at
```

#### `statistics`
```sql
id, total_users, total_courses, total_videos, updated_at
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
```
POST /api/auth/register     — Ro'yxatdan o'tish
POST /api/auth/login        — Kirish (JWT token qaytaradi)
GET  /api/auth/me           — Joriy foydalanuvchi ma'lumotlari
POST /api/auth/logout       — Chiqish
```

### Courses (`/api/courses`)
```
GET  /api/courses           — Barcha kurslar (plan asosida locked/unlocked)
GET  /api/courses/:slug     — Kurs detali + darslar ro'yxati
```

### Lessons (`/api/lessons`)
```
GET  /api/lessons/:id       — Dars detali + progress + quiz + comments
POST /api/lessons/:id/complete    — Darsni tugatildi deb belgilash
POST /api/lessons/:id/comment     — Izoh qo'shish
```

### Quiz (`/api/quiz`)
```
GET  /api/quiz/admin-notify              — (POST) Admin notify
GET  /api/quiz/:id/can-retake            — Qayta topshirish mumkinmi?
GET  /api/quiz/:id/check-blocked         — Bloklangan yoki yo'q?
POST /api/quiz/:id/auto-block            — Avtomatik bloklash (3 xato)
POST /api/quiz/:id/request-retake        — Qayta topshirish so'rovi
POST /api/quiz/:id/submit                — Quiz javoblarini yuborish
GET  /api/quiz/:id                       — Quiz ma'lumotlari + savollar
```

### User (`/api/user`)
```
GET  /api/user/dashboard    — Dashboard ma'lumotlari (kurslar, progress, sertifikatlar)
PUT  /api/user/profile      — Profil yangilash
POST /api/user/avatar       — Avatar yuklash
```

### Payment (`/api/payment`)
```
POST /api/payment/submit    — To'lov yuborish (rasm bilan)
```

### Stats (`/api/stats`)
```
GET  /api/stats             — Umumiy statistika
POST /api/stats/ai-chat     — AI chat (Gemini 1.5 Flash)
```

### Admin (`/api/admin`) — Admin token kerak
```
GET  /api/admin/stats                    — Admin statistika
GET  /api/admin/users                    — Barcha foydalanuvchilar
POST /api/admin/users/:id/block          — Bloklash
POST /api/admin/users/:id/unblock        — Blokdan chiqarish
POST /api/admin/users/:id/set-plan       — Tarif o'zgartirish
POST /api/admin/users/:id/make-admin     — Admin qilish (super-admin)
POST /api/admin/users/:id/remove-admin   — Admin huquqini olish (super-admin)
GET  /api/admin/courses                  — Kurslar
POST /api/admin/courses                  — Kurs qo'shish
DELETE /api/admin/courses/:id            — Kurs o'chirish
GET  /api/admin/lessons                  — Darslar
POST /api/admin/lessons                  — Dars qo'shish (video upload bilan)
DELETE /api/admin/lessons/:id            — Dars o'chirish
POST /api/admin/lessons/:id/block        — Darsni bloklash
POST /api/admin/lessons/:id/unblock      — Darsni ochish
GET  /api/admin/payments                 — To'lovlar
POST /api/admin/payments/:id/approve     — To'lovni tasdiqlash
POST /api/admin/payments/:id/reject      — To'lovni rad etish
GET  /api/admin/quizzes                  — Quizlar
POST /api/admin/quizzes                  — Quiz yaratish
POST /api/admin/quizzes/:id/questions    — Savol qo'shish
POST /api/admin/certificates             — Sertifikat berish
GET  /api/admin/notifications            — Admin notifikatsiyalar
GET  /api/admin/quiz-violations          — Qoidabuzarliklar
DELETE /api/admin/quiz-violations/:id    — Qoidabuzarlik o'chirish
GET  /api/admin/retake-requests          — Qayta topshirish so'rovlari
POST /api/admin/retake-requests/:id/approve  — Ruxsat berish
POST /api/admin/retake-requests/:id/reject   — Rad etish
```

### AI Assistant (`/api/ai`) — Admin token kerak
```
POST /api/ai/assist          — AI yordamchi (admin uchun)
POST /api/ai/generate-quiz   — AI bilan quiz yaratish
```

---

## 🔐 Authentication

### JWT Token
- Token `localStorage`da `itx_token` kaliti bilan saqlanadi
- Har bir so'rovda `Authorization: Bearer <token>` header qo'shiladi
- Token muddati: 7 kun

### Middleware
```javascript
// server/middleware/auth.js
authMiddleware  — JWT tekshiradi, req.user ni to'ldiradi
adminMiddleware — authMiddleware + admin role tekshiradi
```

### Plan Cheklovlari
```javascript
const planLimits = {
  free: 3,    // 3 ta kurs
  pro: 999,   // Barcha kurslar
  max: 999,   // Barcha kurslar
  vip: 999    // Barcha kurslar
}
```

---

## 👤 Foydalanuvchi Rollari

### `user` (Oddiy foydalanuvchi)
- Kurslarni ko'rish (plan asosida)
- Video darslarni ko'rish
- Quizlarni topshirish
- Izoh qoldirish
- Profil tahrirlash
- AI chat ishlatish

### `admin` (Administrator)
- Barcha user funksiyalari
- Admin panelga kirish
- Foydalanuvchilarni boshqarish
- Kurs/dars/quiz yaratish
- To'lovlarni tasdiqlash
- Quiz qoidabuzarliklarini ko'rish
- Qayta topshirish so'rovlarini tasdiqlash

### Super-admin (`ulugbek` username)
- Barcha admin funksiyalari
- Boshqa adminlarni yaratish/o'chirish

---

## 🎓 Kurslar (15 ta)

| # | Slug | Nomi |
|---|------|------|
| 1 | html-css | HTML & CSS Asoslari |
| 2 | javascript | JavaScript |
| 3 | python | Python |
| 4 | reactjs | React.js |
| 5 | nodejs | Node.js |
| 6 | sql-postgresql | SQL & PostgreSQL |
| 7 | git-github | Git & GitHub |
| 8 | linux-terminal | Linux & Terminal |
| 9 | docker-devops | Docker & DevOps |
| 10 | vuejs | Vue.js |
| 11 | typescript | TypeScript |
| 12 | mongodb | MongoDB |
| 13 | flutter-dart | Flutter & Dart |
| 14 | machine-learning | Machine Learning |
| 15 | cybersecurity | Cybersecurity |

---

## 💳 Tarif Rejalari

| Plan | Narx | Muddat | Kurslar | AI | Sertifikat | Mentor | Ish kafolati |
|------|------|--------|---------|-----|------------|--------|--------------|
| Free | 0 | 3 kun | 3 ta | Cheklangan | ❌ | ❌ | ❌ |
| Pro | 700,000 so'm | 30 kun | Barchasi | ✅ | ✅ | ❌ | ❌ |
| Max | 1,500,000 so'm | 30 kun | Barchasi | ✅ | ✅ | ✅ | ❌ |
| VIP | 3,000,000 so'm | 30 kun | Barchasi | ✅ | ✅ | ✅ | ✅ |

---

## 🔍 Face ID Monitoring (Quiz Proctoring)

Quiz paytida avtomatik kuzatuv tizimi.

### Fayl: `client/src/components/FaceMonitor.jsx`

### Parametrlar
```javascript
CHECK_INTERVAL_MS = 1000      // Har 1 sekundda tekshirish
MAX_WARNINGS = 3              // 3 ta ogohlantirish → reset
YAW_THRESHOLD = 42            // Bosh yon burilish daraja
ABSENT_SECONDS = 2            // 2 sekund yuz yo'q → ogohlantirish
BRIGHTNESS_THRESHOLD = 30     // Qorong'u chegarasi
WARN_COOLDOWN_MS = 5000       // Ogohlantirishlar orasida 5 sekund
EYE_ASPECT_RATIO_THRESHOLD = 0.21  // Ko'z yopiq/ochiq
GAZE_THRESHOLDS = { down/left/right/up: 80 }  // Ko'z harakati px
EYE_CLOSED_DURATION = 2000    // Ko'z 2 sekund yopiq → ogohlantirish
HEAD_MOVEMENT_THRESHOLD = 50  // Bosh 50px dan ko'p qimirlasa
```

### Qoidabuzarlik Turlari
| Tur | Trigger | Kutish |
|-----|---------|--------|
| `absent` | Yuz yo'q | 2 sekund |
| `multiface` | 2+ odam | Darhol |
| `yaw` | Bosh yon burilish >42° | Darhol |
| `dark` | Qorong'u | Darhol → chiqarish |
| `eyeClosed` | Ko'z yopiq | 2 sekund |
| `gazeDown/Up/Left/Right` | Ko'z harakati >80px | 2 sekund |
| `tabSwitch` | Tab o'zgartirish | Darhol |

### Jarayon
```
3 ogohlantirish → Quiz reset (javoblar o'chadi)
3 reset → Avtomatik bloklash → Admin panelga so'rov
Admin tasdiqlasa → Qayta topshirish mumkin
```

### Screenshot
3-ogohlantirish paytida video kadrdan JPEG screenshot olinadi va `quiz_violations` jadvaliga base64 formatda saqlanadi.

---

## 🤖 AI Chat

### Fayl: `server/routes/stats.js` → `POST /api/stats/ai-chat`

### Model: Gemini 1.5 Flash
```javascript
// Request
{
  message: "Savol matni",
  userName: "Foydalanuvchi ismi",
  userRole: "user" | "admin"
}

// Response
{
  reply: "AI javobi"
}
```

### Fallback
Gemini API ishlamasa, hardcoded javoblar qaytariladi (kurslar, narxlar, aloqa).

---

## 📁 Frontend Sahifalar

### Public (login talab qilinmaydi)
```
/           → Home.jsx         — Bosh sahifa
/pricing    → Pricing.jsx      — Narxlar
/login      → Login.jsx        — Kirish
/register   → Register.jsx     — Ro'yxatdan o'tish
```

### Private (login kerak)
```
/dashboard          → Dashboard.jsx      — Shaxsiy kabinet
/courses            → Courses.jsx        — Kurslar ro'yxati
/courses/:slug      → CourseDetail.jsx   — Kurs detali
/lessons/:id        → LessonPage.jsx     — Dars sahifasi
/quiz/:id           → QuizPage.jsx       — Quiz sahifasi
/profile            → Profile.jsx        — Profil
```

### Admin (admin role kerak)
```
/admin                      → AdminDashboard.jsx
/admin/users                → AdminUsers.jsx
/admin/courses              → AdminCourses.jsx
/admin/lessons              → AdminLessons.jsx
/admin/payments             → AdminPayments.jsx
/admin/quiz                 → AdminQuiz.jsx
/admin/violations           → AdminViolations.jsx
/admin/retake-requests      → AdminRetakeRequests.jsx
```

---

## 🧩 Komponentlar

### `FaceMonitor.jsx`
Quiz proctoring komponenti. Props:
```javascript
{
  active: boolean,           // Monitoring yoqilganmi
  onViolation: () => void,   // 3 ogohlantirish → reset
  onDarkExit: () => void,    // Qorong'u → chiqarish
  onAdminNotify: (data) => void  // Screenshot + ma'lumot
}
```

### `Navbar.jsx`
- Admin kirsa: `[Admin Panel] [Saytni ko'rish]`
- User kirsa: `[Bosh sahifa] [Kurslar] [Narxlar] [Dashboard]`
- Kirmagan: `[Bosh sahifa] [Kurslar] [Narxlar] [Kirish] [Ro'yxatdan o'tish]`

### `AiChat.jsx`
Floating AI chat widget. Barcha sahifalarda ko'rinadi.

### `BackButton.jsx`
Orqaga qaytish tugmasi.

### `Loader.jsx`
Loading spinner.

### `CourseLogos.jsx`
Har bir kurs uchun SVG logo va rang qaytaradi.

---

## 🌐 Deploy

### Frontend — Vercel
- **URL**: https://itxuz.vercel.app
- **Root Directory**: `client`
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  ```
  VITE_API_URL=https://itxuz.onrender.com/api
  ```
- **`client/vercel.json`** — React Router uchun SPA config:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### Backend — Render.com
- **URL**: https://itxuz.onrender.com
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Environment Variables**:
  ```
  PORT=5002
  JWT_SECRET=itx-jwt-secret-2024-ultra-secure
  CLIENT_URL=https://itxuz.vercel.app
  GEMINI_API_KEY=<your-key>
  ```

> ⚠️ Render free tier da server 50 sekund uxlab qoladi. Birinchi so'rovda kutish kerak.

---

## 🔧 Muhim Konfiguratsiyalar

### `client/src/api/axios.js`
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})
// Token har so'rovga qo'shiladi
// 401 → /login ga yo'naltiradi
```

### `client/vite.config.js`
```javascript
// Development da proxy
proxy: {
  '/api': { target: 'http://localhost:5002', changeOrigin: true },
  '/uploads': { target: 'http://localhost:5002', changeOrigin: true }
}
```

### `server/index.js`
```javascript
// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/lessons', require('./routes/lessons'))
app.use('/api/quiz', require('./routes/quiz'))
app.use('/api/user', require('./routes/user'))
app.use('/api/payment', require('./routes/payment'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/stats', require('./routes/stats'))
app.use('/api/ai', require('./routes/ai-assistant'))
```

---

## 📦 face-api.js Modellari

`client/public/models/` papkasida quyidagi modellar bo'lishi kerak:
```
tiny_face_detector_model-weights_manifest.json
tiny_face_detector_model.bin
face_landmark_68_tiny_model-weights_manifest.json
face_landmark_68_tiny_model.bin
```

Yuklab olish: https://github.com/vladmandic/face-api/tree/master/model

---

## 🐛 Keng Tarqalgan Muammolar

### 1. Port band
```bash
# Windows
Get-NetTCPConnection -LocalPort 5002 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### 2. Database jadvallar yo'q
`db.js` da `initSQLiteSchema()` funksiyasi avtomatik yaratadi. Agar muammo bo'lsa:
```bash
rm server/itx.db
npm run dev  # Qayta yaratadi
```

### 3. Face ID birinchi marta ishlamaydi
Browser console da `Loading face-api models...` logini kuting. Modellar yuklanishi 3-5 sekund oladi.

### 4. Vercel 404 xatoligi
`client/vercel.json` fayl bo'lishi kerak:
```json
{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}
```

### 5. AI chat bir xil javob qaytaradi
Gemini API key eskirgan. Yangi key: https://aistudio.google.com/app/apikey

---

## 📝 Muhim Biznes Qoidalar

1. **Free plan** — 3 kun, 3 ta kurs. Muddati o'tsa avtomatik bloklanadi.
2. **To'lov** — Foydalanuvchi karta raqamiga pul o'tkazib, chek rasmini yuklaydi. Admin tasdiqlaydi.
3. **Quiz bloklash** — 3 ta ogohlantirish → reset. 3 ta reset → bloklash. Admin ruxsat bersa qayta topshiradi.
4. **Super-admin** — `ulugbek` username bilan foydalanuvchi. Boshqa adminlarni yarata/o'chira oladi.
5. **Video** — YouTube embed yoki local upload (max 500MB). `video_type: youtube|local`.
6. **Sertifikat** — Admin qo'lda beradi. Unique kod bilan.

---

## 🔄 Loyihani 0 dan Qurish Uchun Ketma-ketlik

1. `server/` papkasini yarating, `package.json` va barcha route fayllarni yozing
2. `server/db.js` — SQLite/PostgreSQL adapter
3. `server/middleware/auth.js` — JWT middleware
4. `server/index.js` — Express app
5. `client/` papkasini yarating, Vite + React setup
6. `client/src/api/axios.js` — API client
7. `client/src/store/authStore.js` — Zustand auth store
8. Sahifalarni yozing (Home → Login → Register → Dashboard → Courses → Lessons → Quiz)
9. Admin sahifalarini yozing
10. `FaceMonitor.jsx` — face-api.js bilan
11. `AiChat.jsx` — Gemini AI bilan
12. `client/vercel.json` — SPA routing
13. Deploy: Vercel (client) + Render (server)

---

## 📊 Loyiha Statistikasi

- **Jami fayllar**: ~80 ta
- **Frontend sahifalar**: 15 ta
- **Admin sahifalar**: 8 ta
- **API endpointlar**: ~50 ta
- **Database jadvallar**: 13 ta
- **Kurslar**: 15 ta
- **Komponentlar**: 6 ta

---

*Hujjat oxirgi yangilanish: 2026-05-11*
*Muallif: Valiyev Ulug'bek | @valiyevv_01*
