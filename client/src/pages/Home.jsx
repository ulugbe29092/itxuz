import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, BookOpen, Video, Star, CheckCircle, XCircle,
  ArrowRight, TrendingUp, Heart, Phone, Mail,
  MessageCircle, GraduationCap, Shield, Award, Zap, Clock,
  Globe, Code2, Brain, Lock, PlayCircle, ChevronDown,
  ChevronLeft, ChevronRight, Smartphone, Target, Layers
} from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import { getCourseLogo } from '../components/CourseLogos'

const COURSES = [
  { slug: 'html-css', title: 'HTML & CSS', desc: 'Web sahifalar asosi' },
  { slug: 'javascript', title: 'JavaScript', desc: 'Interaktiv web ilovalar' },
  { slug: 'python', title: 'Python', desc: 'Mashhur dasturlash tili' },
  { slug: 'reactjs', title: 'React.js', desc: 'Zamonaviy frontend' },
  { slug: 'nodejs', title: 'Node.js', desc: 'Backend dasturlash' },
  { slug: 'sql-postgresql', title: 'PostgreSQL', desc: 'SQL database' },
  { slug: 'git-github', title: 'Git & GitHub', desc: 'Versiya boshqaruvi' },
  { slug: 'linux-terminal', title: 'Linux', desc: 'Server tizimi' },
  { slug: 'docker-devops', title: 'Docker', desc: 'Konteynerizatsiya' },
  { slug: 'vuejs', title: 'Vue.js', desc: 'Progressive framework' },
  { slug: 'typescript', title: 'TypeScript', desc: 'Kuchli JavaScript' },
  { slug: 'mongodb', title: 'MongoDB', desc: 'NoSQL database' },
  { slug: 'flutter-dart', title: 'Flutter', desc: 'Mobil ilovalar' },
  { slug: 'machine-learning', title: 'Machine Learning', desc: 'AI asoslari' },
  { slug: 'cybersecurity', title: 'Cybersecurity', desc: 'Axborot xavfsizligi' },
]

const PLANS = [
  { name: 'Free', price: '0', dur: '3 kun', badge: 'free', color: '#6b7280',
    features: ['3 ta kurs', 'Video darslar', 'Quiz testlar', 'AI (cheklangan)'],
    no: ['Sertifikat', 'Mentor', 'Ish kafolati'] },
  { name: 'Pro', price: '700,000', dur: '30 kun', badge: 'pro', popular: true, color: '#3b82f6',
    features: ['Barcha kurslar', 'Video darslar', 'AI chat', 'Sertifikat'],
    no: ['Mentor', 'Ish kafolati'] },
  { name: 'Max', price: '1,500,000', dur: '30 kun', badge: 'max', color: '#8b5cf6',
    features: ['Barcha kurslar', 'AI chat', 'Sertifikat', 'Mentor', 'Loyiha tekshiruvi'],
    no: ['Ish kafolati'] },
  { name: 'VIP', price: '3,000,000', dur: '30 kun', badge: 'vip', color: '#f59e0b',
    features: ['Barcha kurslar', 'AI chat', 'Sertifikat', 'Mentor', 'Ish kafolati', 'CV tayyorlash', 'Intervyu'],
    no: [] },
]

const FAQS = [
  { q: "ITX platformasi kimlar uchun?", a: "ITX platformasi IT sohasini noldan o'rganmoqchi bo'lgan har qanday yoshdagi insonlar uchun. Dasturlash tajribasi talab qilinmaydi. Boshlang'ichdan ekspert darajasigacha o'rgatamiz." },
  { q: "Kurslar qancha vaqt davom etadi?", a: "Har bir kurs 2-8 hafta davom etadi. O'z sur'atingizda o'rganishingiz mumkin, darslar 24/7 mavjud. Videolarni istalgan vaqt ko'rishingiz mumkin." },
  { q: "Sertifikat beriladi?", a: "Ha, Pro, Max va VIP rejalarida kursni muvaffaqiyatli tugatgandan so'ng rasmiy sertifikat beriladi. Sertifikat LinkedIn profilingizga qo'shishingiz mumkin." },
  { q: "To'lov qanday amalga oshiriladi?", a: "Karta orqali to'lov qilib, chekni yuborasiz. 24 soat ichida admin tasdiqlaydi va tarifingiz faollashadi. Savol bo'lsa +998 90 637 37 54 ga murojaat qiling." },
  { q: "Face ID tizimi nima?", a: "Quiz paytida kamera orqali yuzingiz kuzatiladi. Bu akademik halollikni ta'minlash uchun. Bosh yoki ko'z harakati 15% dan oshsa ogohlantirish beriladi. 3 ta ogohlantirish bo'lsa quiz qayta boshlanadi." },
  { q: "Mentor bilan qanday ishlash mumkin?", a: "Max va VIP rejalarda shaxsiy mentor tayinlanadi. Telegram orqali savol berishingiz, loyihalaringizni tekshirtirishingiz mumkin. Mentor hafta davomida javob beradi." },
  { q: "Bepul sinov davri bormi?", a: "Ha! Ro'yxatdan o'tgandan so'ng 3 kun bepul sinov davri beriladi. 3 ta kursga kirish imkoniyati mavjud. Karta ma'lumotlari talab qilinmaydi." },
  { q: "Ish kafolati qanday ishlaydi?", a: "VIP rejada kurslarni tugatib, loyihalarni topshirgandan so'ng ish topishda yordam beramiz. Intervyuga tayyorlaymiz va IT kompaniyalarga tavsiya qilamiz." },
]

const TESTIMONIALS = [
  { name: 'Aziz Karimov', role: 'Frontend Developer @ Uzum', text: "ITX orqali 6 oyda JavaScript va React ni o'rgandim. Hozir Uzum kompaniyasida ishlayapman! Kurslar juda tushunarli va amaliy.", rating: 5, color: '#3b82f6' },
  { name: 'Malika Yusupova', role: 'Data Scientist @ Beeline', text: "Python kursini tugatib, Data Science sohasiga kirdim. Mentor yordami juda foydali bo'ldi! Tavsiya qilaman.", rating: 5, color: '#8b5cf6' },
  { name: 'Jasur Toshmatov', role: 'Backend Developer @ Click', text: "VIP paket orqali ish kafolati oldim. 3 oy ichida intervyudan o'tib, yaxshi maosh bilan ishga kirdim!", rating: 5, color: '#06b6d4' },
  { name: 'Dilnoza Rahimova', role: 'Full Stack Developer', text: "Node.js va React kurslarini birgalikda olib, full stack developer bo'ldim. ITX eng yaxshi platforma!", rating: 5, color: '#10b981' },
  { name: 'Bobur Xasanov', role: 'DevOps Engineer @ Epam', text: "Docker va Linux kurslaridan keyin DevOps sohasiga kirdim. Kurslar professional darajada tayyorlangan.", rating: 5, color: '#f59e0b' },
  { name: 'Sarvar Mirzayev', role: 'Mobile Developer', text: "Flutter kursini tugatib, App Store va Google Play da ilovam bor. ITX ning amaliy yondashuvi ajoyib!", rating: 5, color: '#ef4444' },
]

function Counter({ target, decimal }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let cur = 0
    const inc = target / 80
    const t = setInterval(() => {
      cur += inc
      if (cur >= target) { cur = target; clearInterval(t) }
      setVal(decimal ? (cur / 10).toFixed(1) : Math.floor(cur).toLocaleString())
    }, 20)
    return () => clearInterval(t)
  }, [target])
  return <span>{val}</span>
}

function CourseSlider() {
  const [idx, setIdx] = useState(0)
  const total = COURSES.length
  const visible = 5
  const maxIdx = total - visible

  useEffect(() => {
    const t = setInterval(() => setIdx(i => i >= maxIdx ? 0 : i + 1), 4000)
    return () => clearInterval(t)
  }, [maxIdx])

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(maxIdx, i + 1))

  return (
    <div style={{ position: 'relative', padding: '0 2.5rem' }}>
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex', gap: '1rem',
          transform: `translateX(calc(-${idx * 20}% - ${idx * 1}rem))`,
          transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
          width: `${total * 20}%`
        }}>
          {COURSES.map((c, i) => {
            const logo = getCourseLogo(c.slug)
            return (
              <div key={i} style={{
                flex: `0 0 calc(20% - 0.8rem)`,
                background: '#fff', border: '1.5px solid #e5e7eb',
                borderRadius: 16, padding: '1.4rem 1rem',
                textAlign: 'center', transition: 'all 0.3s', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', minWidth: 0
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = logo.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${logo.color}22` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, background: logo.bg, border: `1.5px solid ${logo.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                  {logo.svg}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', marginBottom: '0.25rem' }}>{c.title}</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{c.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
      <button onClick={prev} disabled={idx === 0} style={{ position: 'absolute', left: 0, top: '45%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', background: '#fff', border: '1.5px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s', opacity: idx === 0 ? 0.4 : 1 }}>
        <ChevronLeft size={16} />
      </button>
      <button onClick={next} disabled={idx >= maxIdx} style={{ position: 'absolute', right: 0, top: '45%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', background: '#fff', border: '1.5px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s', opacity: idx >= maxIdx ? 0.4 : 1 }}>
        <ChevronRight size={16} />
      </button>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem' }}>
        {Array.from({ length: maxIdx + 1 }).map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? '#3b82f6' : '#d1d5db', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
    </div>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${open ? '#3b82f6' : '#e5e7eb'}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.3s', boxShadow: open ? '0 4px 20px rgba(59,130,246,0.1)' : '0 1px 4px rgba(0,0,0,0.04)' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>{q}</span>
        <span style={{ flexShrink: 0, color: open ? '#3b82f6' : '#9ca3af', display: 'block', transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={18} />
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1.4rem 1.2rem', fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7, borderTop: '1px solid #f3f4f6' }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ total_users: 0, total_courses: 15, total_videos: 0, rating: 4.9 })
  const [tIdx, setTIdx] = useState(0)

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {})
    const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const visibleT = [
    TESTIMONIALS[tIdx % TESTIMONIALS.length],
    TESTIMONIALS[(tIdx + 1) % TESTIMONIALS.length],
    TESTIMONIALS[(tIdx + 2) % TESTIMONIALS.length],
  ]

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 64 }}>

      {/* ===== HERO ===== */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '5rem 0 4rem', background: 'linear-gradient(135deg,#eff6ff 0%,#f5f3ff 50%,#ecfeff 100%)' }}>
        <div className="container">
          <div className="h-hero-grid">
            <div className="fade-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.25)', color: '#3b82f6', padding: '.4rem 1rem', borderRadius: '50px', fontSize: '.82rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                <TrendingUp size={13} /> O'zbekistondagi #1 IT Platforma
              </div>
              <h1 style={{ fontSize: '3.4rem', fontWeight: 900, lineHeight: 1.12, marginBottom: '1.2rem', color: '#111827' }}>
                IT sohasini <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>professional</span><br />darajada o'rganing
              </h1>
              <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem', lineHeight: 1.7, maxWidth: 520 }}>
                15+ kurs, 300+ video dars, AI yordamchi, Face ID nazorat tizimi va sertifikatlar bilan IT karyerangizni boshlang.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {user
                  ? <Link to="/courses" className="h-btn-primary">Kurslarni ko'rish <ArrowRight size={18} /></Link>
                  : <Link to="/register" className="h-btn-primary">Bepul boshlash <ArrowRight size={18} /></Link>
                }
                <Link to="/pricing" className="h-btn-outline">Narxlar</Link>
              </div>
              <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                {[
                  { val: stats.total_users || 1250, label: "O'quvchilar", suffix: '+' },
                  { val: 15, label: 'Kurslar', suffix: '+' },
                  { val: stats.total_videos || 300, label: 'Video darslar', suffix: '+' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
                      <Counter target={s.val} />{s.suffix}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Hero visual */}
            <div className="fade-up h-hero-visual" style={{ animationDelay: '.1s' }}>
              <div style={{ position: 'relative', width: 400, height: 400, margin: '0 auto' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(59,130,246,0.15)', animation: 'hRing 4s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', border: '1.5px solid rgba(139,92,246,0.12)', animation: 'hRing 4s ease-in-out infinite 1s' }} />
                <div style={{ position: 'absolute', inset: 60, borderRadius: '50%', border: '1.5px solid rgba(6,182,212,0.1)', animation: 'hRing 4s ease-in-out infinite 2s' }} />
                {/* Center card — wrapper animatsiya uchun, ichki div pozitsiya uchun */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 10, animation: 'hFloat 4s ease-in-out infinite' }}>
                  <div style={{ width: 140, height: 140, borderRadius: 36, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(59,130,246,0.4), 0 0 0 8px rgba(59,130,246,0.08)' }}>
                    <GraduationCap size={44} color="#fff" />
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginTop: 6, letterSpacing: '-0.5px' }}>ITX</div>
                    <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5, marginTop: 2, textTransform: 'uppercase' }}>IT PLATFORMA</div>
                  </div>
                </div>
                {[
                  { slug: 'html-css', angle: 0 }, { slug: 'javascript', angle: 51 },
                  { slug: 'python', angle: 102 }, { slug: 'reactjs', angle: 153 },
                  { slug: 'nodejs', angle: 204 }, { slug: 'typescript', angle: 255 },
                  { slug: 'docker-devops', angle: 306 },
                ].map((item, i) => {
                  const logo = getCourseLogo(item.slug, 22)
                  const rad = (item.angle * Math.PI) / 180
                  const r = 150
                  const x = Math.cos(rad) * r
                  const y = Math.sin(rad) * r
                  return (
                    <div key={i} style={{ position: 'absolute', left: `calc(50% + ${x}px - 22px)`, top: `calc(50% + ${y}px - 22px)`, width: 44, height: 44, borderRadius: 12, background: '#fff', border: `1.5px solid ${logo.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', animation: 'hFloat 4s ease-in-out infinite', animationDelay: `${i * 0.3}s`, zIndex: 8 }}>
                      {logo.svg}
                    </div>
                  )
                })}
                <div style={{ position: 'absolute', bottom: 10, left: -20, background: '#fff', borderRadius: 14, padding: '0.7rem 1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', animation: 'hFloat 4s ease-in-out infinite 0.5s', zIndex: 15 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>1,250+</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>O'quvchilar</div>
                </div>
                <div style={{ position: 'absolute', top: 20, right: -30, background: '#fff', borderRadius: 14, padding: '0.7rem 1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', animation: 'hFloat 4s ease-in-out infinite 1.5s', zIndex: 15 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>15+</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Kurslar</div>
                </div>
                <div style={{ position: 'absolute', bottom: 60, right: -40, background: '#fff', borderRadius: 14, padding: '0.7rem 1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', animation: 'hFloat 4s ease-in-out infinite 2.5s', zIndex: 15 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>4.9★</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Reyting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ===== STATS ===== */}
      <section style={{ padding: '4rem 0', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
        <div className="container">
          <div className="h-stats-grid">
            {[
              { Icon: Users, val: stats.total_users || 1250, label: "O'quvchilar", color: '#3b82f6', suffix: '+' },
              { Icon: BookOpen, val: 15, label: 'Kurslar', color: '#8b5cf6', suffix: '+' },
              { Icon: Video, val: stats.total_videos || 300, label: 'Video darslar', color: '#06b6d4', suffix: '+' },
              { Icon: Star, val: 49, label: 'Reyting', color: '#f59e0b', decimal: true, suffix: '' },
            ].map((s, i) => (
              <div key={i} className="h-stat-card">
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                  <s.Icon size={22} color={s.color} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
                  <Counter target={s.val} decimal={s.decimal} />{s.suffix}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KURSLAR ===== */}
      <section style={{ padding: '5rem 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(59,130,246,.08)', color: '#3b82f6', padding: '.3rem .9rem', borderRadius: '50px', fontSize: '.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              <BookOpen size={13} /> 15 ta professional kurs
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: '.8rem' }}>Bizning <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Kurslar</span></h2>
            <p style={{ color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>Zamonaviy IT texnologiyalarini amaliy loyihalar orqali o'rganing</p>
          </div>
          <CourseSlider />
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to={user ? '/courses' : '/register'} className="h-btn-primary">
              {user ? "Barcha kurslarni ko'rish" : 'Bepul boshlash'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== NIMA O'RGATAMIZ ===== */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(139,92,246,.08)', color: '#8b5cf6', padding: '.3rem .9rem', borderRadius: '50px', fontSize: '.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              <Layers size={13} /> Yo'nalishlar
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: '.8rem' }}>Nima <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>o'rgatamiz?</span></h2>
            <p style={{ color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>ITX platformasida siz zamonaviy IT texnologiyalarini amaliy loyihalar orqali o'rganasiz</p>
          </div>
          <div className="h-features-grid">
            {[
              { Icon: Globe, color: '#3b82f6', bg: '#eff6ff', title: 'Web Dasturlash', desc: 'HTML, CSS, JavaScript, React, Vue.js, Node.js � zamonaviy web ilovalar yaratishni o\'rganing. Frontend va backend texnologiyalarini birgalikda o\'zlashtirasiz.' },
              { Icon: Code2, color: '#8b5cf6', bg: '#f5f3ff', title: 'Backend & Python', desc: 'Python, Django, FastAPI, PostgreSQL, MongoDB � server tomonida dasturlash va ma\'lumotlar bazasi bilan ishlashni o\'rganing.' },
              { Icon: Smartphone, color: '#06b6d4', bg: '#ecfeff', title: 'Mobil Ilovalar', desc: 'Flutter & Dart bilan iOS va Android uchun bir vaqtda mobil ilovalar yarating. Google Play va App Store ga chiqaring.' },
              { Icon: Brain, color: '#10b981', bg: '#f0fdf4', title: 'AI & Machine Learning', desc: 'Sun\'iy intellekt, neural tarmoqlar, Python bilan ML modellarini yarating. TensorFlow va scikit-learn kutubxonalarini o\'rganing.' },
              { Icon: Lock, color: '#ef4444', bg: '#fef2f2', title: 'Cybersecurity', desc: 'Axborot xavfsizligi asoslari, etik hacking, penetration testing va himoya usullarini professional darajada o\'rganing.' },
              { Icon: Layers, color: '#f59e0b', bg: '#fffbeb', title: 'DevOps & Cloud', desc: 'Docker, Kubernetes, CI/CD, Linux, Git � zamonaviy DevOps amaliyotlari va cloud texnologiyalarini o\'rganing.' },
            ].map((f, i) => (
              <div key={i} className="h-feature-card"
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${f.color}18`; e.currentTarget.style.borderColor = f.color + '40' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e7eb' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
                  <f.Icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.7rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== IMKONIYATLAR ===== */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(6,182,212,.08)', color: '#06b6d4', padding: '.3rem .9rem', borderRadius: '50px', fontSize: '.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              <Zap size={13} /> Platformaning kuchlari
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: '.8rem' }}>Nima uchun <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ITX?</span></h2>
            <p style={{ color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>Boshqa platformalardan farqli, ITX sizga real natija beradi</p>
          </div>
          <div className="h-adv-grid">
            {[
              { Icon: Shield, color: '#3b82f6', title: 'Face ID Nazorat', desc: 'Quiz paytida kamera orqali yuz va ko\'z harakati kuzatiladi. 15% dan oshsa ogohlantirish. Akademik halollik kafolatlangan.' },
              { Icon: Brain, color: '#8b5cf6', title: 'AI Yordamchi', desc: 'Gemini AI asosida ishlaydi. Dars mavzusiga qarab 30 ta test savol avtomatik yaratadi. Savollaringizga darhol javob beradi.' },
              { Icon: Award, color: '#10b981', title: 'Rasmiy Sertifikat', desc: 'Kursni tugatgandan so\'ng rasmiy sertifikat beriladi. LinkedIn va CV ga qo\'shishingiz mumkin. Ish beruvchilar tomonidan tan olinadi.' },
              { Icon: Target, color: '#f59e0b', title: 'Amaliy Loyihalar', desc: 'Har bir kursda real loyihalar mavjud. Portfolio yaratib, ish topishda foydalanasiz. Mentor loyihangizni tekshiradi.' },
              { Icon: Clock, color: '#06b6d4', title: '24/7 Mavjud', desc: 'Darslar istalgan vaqt, istalgan joydan ko\'rish mumkin. Mobil qurilmada ham ishlaydi. O\'z sur\'atingizda o\'rganing.' },
              { Icon: Users, color: '#ef4444', title: 'Mentor Yordami', desc: 'Max va VIP rejalarda shaxsiy mentor tayinlanadi. Telegram orqali savol bering. Hafta davomida javob olasiz.' },
              { Icon: Globe, color: '#3b82f6', title: 'Ish Kafolati', desc: 'VIP rejada kurslarni tugatgandan so\'ng ish topishda yordam beramiz. IT kompaniyalarga tavsiya qilamiz.' },
              { Icon: Zap, color: '#8b5cf6', title: 'Tez O\'rganish', desc: 'Qisqa va aniq video darslar. Har bir dars 10-20 daqiqa. Nazariya va amaliyot birgalikda. Tez natija ko\'rasiz.' },
            ].map((a, i) => (
              <div key={i} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = a.color + '50'; e.currentTarget.style.boxShadow = `0 12px 32px ${a.color}15` }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: a.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <a.Icon size={22} color={a.color} />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{a.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QANDAY ISHLAYDI ===== */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(16,185,129,.08)', color: '#10b981', padding: '.3rem .9rem', borderRadius: '50px', fontSize: '.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              <PlayCircle size={13} /> Jarayon
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: '.8rem' }}>Qanday <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ishlaydi?</span></h2>
            <p style={{ color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>4 ta oddiy qadam bilan IT karyerangizni boshlang</p>
          </div>
          <div className="h-steps-grid">
            {[
              { num: '01', color: '#3b82f6', title: "Ro'yxatdan o'ting", desc: "3 daqiqada ro'yxatdan o'ting. Email va telefon raqamingizni kiriting. 3 kun bepul sinov davri boshlanadi." },
              { num: '02', color: '#8b5cf6', title: 'Kursni tanlang', desc: "15 ta kurs ichidan o'zingizga mos yo'nalishni tanlang. Har bir kurs haqida batafsil ma'lumot mavjud." },
              { num: '03', color: '#06b6d4', title: 'O\'rganing va mashq qiling', desc: "Video darslarni ko'ring, quiz testlarini ishlang. AI yordamchi savollaringizga javob beradi. Amaliy loyihalar bajaring." },
              { num: '04', color: '#10b981', title: 'Sertifikat oling', desc: "Kursni tugatib, sertifikat oling. Portfolio yarating. Ish topishda yordam oling. IT karyerangizni boshlang!" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                {i < 3 && <div style={{ position: 'absolute', top: 28, left: '60%', width: '80%', height: 2, background: 'linear-gradient(90deg,' + s.color + '40,transparent)', zIndex: 0 }} className="h-step-line" />}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,' + s.color + ',' + s.color + 'cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', boxShadow: '0 8px 24px ' + s.color + '30', fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.6rem' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NARXLAR ===== */}
      <section style={{ padding: '5rem 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(245,158,11,.08)', color: '#f59e0b', padding: '.3rem .9rem', borderRadius: '50px', fontSize: '.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              <Award size={13} /> Tarif rejalari
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: '.8rem' }}>Tarif <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Rejalari</span></h2>
            <p style={{ color: '#6b7280' }}>O'zingizga mos rejani tanlang va IT karyerangizni boshlang</p>
          </div>
          <div className="h-pricing-grid">
            {PLANS.map((p, i) => (
              <div key={i} style={{ background: '#fff', border: `2px solid ${p.popular ? p.color : p.badge === 'vip' ? '#f59e0b' : '#e5e7eb'}`, borderRadius: 20, padding: '2rem', position: 'relative', transition: 'transform .3s', boxShadow: p.popular ? `0 0 40px ${p.color}20` : '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                {p.popular && <div style={{ position: 'absolute', top: -1, right: '1.5rem', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '.3rem .8rem', borderRadius: '0 0 10px 10px' }}>Mashhur</div>}
                <span className={'badge-' + p.badge}>{p.name}</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, margin: '.8rem 0 .2rem', color: p.color }}>{p.price}</div>
                <div style={{ fontSize: '.8rem', color: '#9ca3af', marginBottom: '1.5rem' }}>so'm / {p.dur}</div>
                <ul style={{ listStyle: 'none', marginBottom: '1.5rem', flex: 1 }}>
                  {p.features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.3rem 0', fontSize: '.85rem', color: '#374151' }}><CheckCircle size={14} color="#10b981" /> {f}</li>)}
                  {p.no.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.3rem 0', fontSize: '.85rem', color: '#9ca3af' }}><XCircle size={14} color="#d1d5db" /> {f}</li>)}
                </ul>
                <Link to="/pricing" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', padding: '.8rem', borderRadius: 12, fontWeight: 700, fontSize: '.9rem', textDecoration: 'none', marginTop: 'auto', background: p.popular || p.badge === 'vip' ? `linear-gradient(135deg,${p.color},${p.color}cc)` : 'transparent', color: p.popular || p.badge === 'vip' ? '#fff' : p.color, border: `2px solid ${p.color}`, transition: 'all .2s' }}
                  onMouseEnter={e => { if (!(p.popular || p.badge === 'vip')) { e.currentTarget.style.background = p.color; e.currentTarget.style.color = '#fff' } }}
                  onMouseLeave={e => { if (!(p.popular || p.badge === 'vip')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = p.color } }}
                >Tanlash <ArrowRight size={16} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: '.8rem' }}>O'quvchilar <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>fikrlari</span></h2>
            <p style={{ color: '#6b7280' }}>1,250+ o'quvchi ITX orqali IT karyerasini boshladi</p>
          </div>
          <div className="h-testimonials-grid">
            {visibleT.map((t, i) => (
              <div key={i} style={{ background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '2rem', transition: 'all 0.3s', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem' }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,' + t.color + ',' + t.color + 'cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '1rem', flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem' }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTIdx(i)} style={{ width: i === tIdx ? 24 : 8, height: 8, borderRadius: 4, background: i === tIdx ? '#3b82f6' : '#d1d5db', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding: '5rem 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: '.8rem' }}>Tez beriladigan <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>savollar</span></h2>
            <p style={{ color: '#6b7280' }}>Eng ko'p beriladigan savollarga javoblar</p>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>IT karyerangizni bugun boshlang!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1.1rem' }}>3 kunlik bepul sinov davri bilan hech qanday xavf yo'q.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={user ? '/courses' : '/register'} style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: '#fff', color: '#3b82f6', padding: '.9rem 2rem', borderRadius: 12, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              {user ? "Kurslarni ko'rish" : 'Bepul boshlash'} <ArrowRight size={18} />
            </Link>
            <Link to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '.9rem 2rem', borderRadius: 12, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)', transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >Narxlar</Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#111827', padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="h-footer-grid">
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', textDecoration: 'none', marginBottom: '1rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={20} color="#fff" />
                </div>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ITX</span>
              </Link>
              <p style={{ color: '#9ca3af', fontSize: '.85rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>O'zbekistondagi #1 IT ta'lim platformasi. Yaratuvchi: Valiyev Ulug'bek</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <a href="https://t.me/valiyevv_01" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', color: '#9ca3af', fontSize: '.85rem', textDecoration: 'none' }}>
                  <MessageCircle size={15} color="#0088cc" /> @valiyevv_01
                </a>
                <a href="tel:+998906373754" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', color: '#9ca3af', fontSize: '.85rem', textDecoration: 'none' }}>
                  <Phone size={15} color="#10b981" /> +998 90 637 37 54
                </a>
                <a href="mailto:thisvaliyev@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', color: '#9ca3af', fontSize: '.85rem', textDecoration: 'none' }}>
                  <Mail size={15} color="#ef4444" /> thisvaliyev@gmail.com
                </a>
              </div>
            </div>
            {[
              { title: 'Kurslar', links: [['HTML & CSS', '/courses'], ['JavaScript', '/courses'], ['Python', '/courses'], ['React.js', '/courses'], ['Node.js', '/courses'], ['Barcha kurslar', '/courses']] },
              { title: 'Platforma', links: [['Narxlar', '/pricing'], ['Kurslar', '/courses'], ['Profil', '/profile'], ["Ro'yxatdan o'tish", '/register'], ['Kirish', '/login']] },
              { title: "Qo'llab-quvvatlash", links: [['Telegram', 'https://t.me/valiyevv_01'], ['+998 90 637 37 54', 'tel:+998906373754'], ['thisvaliyev@gmail.com', 'mailto:thisvaliyev@gmail.com']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '.9rem', color: '#fff' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none' }}>
                  {col.links.map(([label, href]) => (
                    <li key={label} style={{ marginBottom: '.6rem' }}>
                      <Link to={href} style={{ color: '#9ca3af', fontSize: '.85rem', textDecoration: 'none', transition: 'color .2s' }}
                        onMouseEnter={e => e.target.style.color = '#fff'}
                        onMouseLeave={e => e.target.style.color = '#9ca3af'}
                      >{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1.5rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6b7280', fontSize: '.8rem', flexWrap: 'wrap', gap: '.5rem' }}>
            <span>� {new Date().getFullYear()} ITX Platform. Barcha huquqlar himoyalangan.</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              Made with <Heart size={14} color="#ef4444" fill="#ef4444" /> by Valiyev Ulug'bek
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes hFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes hRing{0%,100%{opacity:0.15;transform:translate(-50%,-50%) scale(0.97)}50%{opacity:0.35;transform:translate(-50%,-50%) scale(1)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        /* Buttons */
        .h-btn-primary{display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;padding:.85rem 1.8rem;border-radius:12px;font-weight:700;font-size:.95rem;text-decoration:none;box-shadow:0 8px 24px rgba(59,130,246,0.3);transition:all .2s}
        .h-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(59,130,246,0.4)}
        .h-btn-outline{display:inline-flex;align-items:center;gap:.5rem;background:transparent;color:#374151;padding:.85rem 1.8rem;border-radius:12px;font-weight:700;font-size:.95rem;text-decoration:none;border:2px solid #e5e7eb;transition:all .2s}
        .h-btn-outline:hover{border-color:#3b82f6;color:#3b82f6;transform:translateY(-2px)}

        /* Layout */
        .h-hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
        .h-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem}
        .h-stat-card{background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:16px;padding:1.8rem;text-align:center;transition:all .3s}
        .h-stat-card:hover{transform:translateY(-4px);border-color:#3b82f6;box-shadow:0 12px 32px rgba(59,130,246,0.1)}
        .h-features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
        .h-feature-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;padding:2rem;transition:all .3s;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
        .h-adv-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem}
        .h-steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem}
        .h-pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;align-items:stretch}
        .h-testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
        .h-footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:3rem;margin-bottom:2rem}

        /* Responsive */
        @media(max-width:1200px){
          .h-adv-grid{grid-template-columns:repeat(3,1fr)}
          .h-pricing-grid{grid-template-columns:repeat(2,1fr)}
          .h-footer-grid{grid-template-columns:1fr 1fr;gap:2rem}
          .h-stats-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:1024px){
          .h-hero-grid{grid-template-columns:1fr;text-align:center;gap:3rem}
          .h-hero-visual{display:flex;justify-content:center}
          .h-features-grid{grid-template-columns:repeat(2,1fr)}
          .h-steps-grid{grid-template-columns:repeat(2,1fr)}
          .h-step-line{display:none}
        }
        @media(max-width:768px){
          .h-hero-grid h1{font-size:2.2rem!important}
          .h-stats-grid{grid-template-columns:repeat(2,1fr);gap:1rem}
          .h-features-grid{grid-template-columns:1fr}
          .h-adv-grid{grid-template-columns:repeat(2,1fr)}
          .h-pricing-grid{grid-template-columns:1fr}
          .h-testimonials-grid{grid-template-columns:1fr}
          .h-footer-grid{grid-template-columns:1fr}
          .h-steps-grid{grid-template-columns:1fr}
          section{padding:3rem 0!important}
        }
        @media(max-width:480px){
          .h-stats-grid{grid-template-columns:1fr 1fr}
          .h-adv-grid{grid-template-columns:1fr}
          .h-hero-grid h1{font-size:1.9rem!important}
        }
      `}</style>
    </div>
  )
}
