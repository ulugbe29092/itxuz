# ITX Learning Platform

Online ta'lim platformasi Face ID monitoring tizimi bilan.

## 🎯 Xususiyatlar

- 🎓 **15+ Kurs**: HTML, CSS, JavaScript, Python, React, Node.js, va boshqalar
- 📹 **Video Darslar**: Har bir mavzu uchun video qo'llanma
- 📝 **Quizlar**: Bilimni tekshirish uchun testlar
- 👤 **Face ID Monitoring**: Quiz paytida yuz va ko'z harakatini kuzatish
- 👨‍💼 **Admin Panel**: Foydalanuvchilar, kurslar, to'lovlarni boshqarish
- 💳 **To'lov Tizimi**: Pro, Max, VIP tariflar
- 📊 **Progress Tracking**: O'quvchi progressini kuzatish

## 🔐 Face ID Monitoring

Quiz paytida avtomatik kuzatuv:

- ✅ Yuz aniqlash (2 sekund yo'q bo'lsa ogohlantirish)
- ✅ Ko'z harakati (80px chegara, 2 sekund kutish)
- ✅ Bosh harakati (50px chegara)
- ✅ Tab/oyna o'zgartirish aniqlash
- ✅ Ko'p odam aniqlash (darhol ogohlantirish)
- ✅ Screenshot olish (har bir qoidabuzarlikda)
- ✅ Auto-block tizimi (3 ta xato → bloklash)
- ✅ Admin tasdiqlashi (qayta topshirish uchun)

## 🛠️ Texnologiyalar

### Frontend
- React 18
- React Router v6
- Axios
- face-api.js (Vladimir Mandic)
- Vite
- Lucide Icons

### Backend
- Node.js
- Express.js
- SQLite / PostgreSQL
- bcryptjs
- JWT
- Multer (file upload)
- Google Gemini AI

## 📦 O'rnatish

### 1. Repository ni clone qilish
```bash
git clone https://github.com/ulugbe29092/itx.git
cd itx/itx-app
```

### 2. Server ni o'rnatish
```bash
cd server
npm install
```

**server/.env faylini yarating:**
```env
PORT=5002
DATABASE_URL=postgresql://user:password@localhost:5432/itx
JWT_SECRET=your-jwt-secret-key-here
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Client ni o'rnatish
```bash
cd ../client
npm install
```

### 4. Ishga tushirish

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

### 5. Saytga kirish
- **Foydalanuvchi**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Login**: `ulugbek` / `ulugbek`

## 📁 Papkalar Tuzilmasi

```
itx-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # FaceMonitor, Navbar, va boshqalar
│   │   ├── pages/         # Home, Courses, Quiz, Admin
│   │   ├── api/           # Axios configuration
│   │   └── store/         # Zustand state management
│   ├── public/
│   │   └── models/        # face-api.js models
│   └── package.json
│
└── server/                # Express backend
    ├── routes/            # API routes
    │   ├── quiz.js       # Quiz endpoints
    │   ├── admin.js      # Admin endpoints
    │   └── auth.js       # Authentication
    ├── middleware/        # Auth middleware
    ├── db.js             # Database adapter
    ├── schema.sql        # Database schema
    └── package.json
```

## 🎮 Admin Panel

### Sahifalar:
1. **Dashboard** - Statistika va umumiy ma'lumotlar
2. **Foydalanuvchilar** - Barcha userlarni boshqarish
3. **Kurslar** - Kurslar yaratish va tahrirlash
4. **Videolar** - Video darslar yuklash
5. **To'lovlar** - To'lovlarni tasdiqlash
6. **Quizlar** - Quiz va savollar yaratish
7. **Quizdan yiqilganlar** - Barcha qoidabuzarliklar (screenshot bilan)
8. **Qayta topshirish** - Bloklangan userlar so'rovlari

### Admin Funksiyalari:
- ✅ Foydalanuvchilarni bloklash/ochish
- ✅ Tarif rejalarini o'zgartirish
- ✅ To'lovlarni tasdiqlash
- ✅ Quiz qoidabuzarliklarini ko'rish
- ✅ Qayta topshirish so'rovlarini tasdiqlash/rad etish

## 🔒 Face ID Parametrlari

| Xususiyat | Chegara | Kutish | Ogohlantirish |
|-----------|---------|--------|---------------|
| Ko'z harakati | 80px | 2s | Ha |
| Bosh harakati | 50px | 0s | Ha |
| Ko'z yopiq | - | 2s | Ha |
| Yuz yo'q | - | 2s | Ha |
| Ko'p odam | - | 0s | Ha |
| Tab switch | - | 0s | Ha |
| Qorong'u | 30 brightness | 0s | Chiqarish |
| Cooldown | - | 5s | - |

## 🚀 Production Deploy

### Frontend (Vercel)
1. https://vercel.com ga kiring
2. GitHub repository ni import qiling
3. Root Directory: `itx-app/client`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy qiling

### Backend (Render)
1. https://render.com ga kiring
2. New Web Service yarating
3. GitHub repository ni tanlang
4. Root Directory: `itx-app/server`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Environment Variables ni qo'shing
8. Deploy qiling

## 📝 Environment Variables

### Server
```env
PORT=5002
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your-api-key
```

## 🐛 Debugging

### Console Loglar
Face ID monitoring console ga loglar yozadi:
```javascript
Loading face-api models...
Face-api models loaded successfully
Starting camera...
Camera started successfully
Cooldown active, skipping warning
```

### Server Loglar
```javascript
✅ ITX Server: http://localhost:5002
✅ SQLite ishlatilmoqda
✅ admin_notifications jadvali yaratildi
✅ quiz_retake_requests jadvali yaratildi
✅ quiz_violations jadvali yaratildi
```

## 📄 Litsenziya

MIT

## 👨‍💻 Muallif

**Ulugbek Valiyev**
- GitHub: [@ulugbe29092](https://github.com/ulugbe29092)

## 🤝 Hissa Qo'shish

Pull requestlar qabul qilinadi! Katta o'zgarishlar uchun avval issue oching.

## 📞 Yordam

Agar muammo bo'lsa:
1. Console loglarni tekshiring (F12)
2. Server terminalda xatolik loglarini o'qing
3. GitHub Issues ga yozing

---

**Made with ❤️ in Uzbekistan**
