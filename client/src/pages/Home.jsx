import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, BookOpen, Video, Star, CheckCircle, XCircle,
  ArrowRight, TrendingUp, Heart, Send, Phone, Mail,
  MessageCircle, ChevronLeft, ChevronRight, GraduationCap
} from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import { getCourseLogo } from '../components/CourseLogos'

const COURSES = [
  { slug: 'html-css',         title: 'HTML & CSS',       desc: 'Web sahifalar yaratishning asosi' },
  { slug: 'javascript',       title: 'JavaScript',       desc: 'Interaktiv web ilovalar' },
  { slug: 'python',           title: 'Python',           desc: "Eng mashhur dasturlash tili" },
  { slug: 'reactjs',          title: 'React.js',         desc: 'Zamonaviy frontend kutubxona' },
  { slug: 'nodejs',           title: 'Node.js',          desc: 'Backend server dasturlash' },
  { slug: 'sql-postgresql',   title: 'PostgreSQL',       desc: 'Kuchli SQL database' },
  { slug: 'git-github',       title: 'Git & GitHub',     desc: 'Versiya boshqaruv tizimi' },
  { slug: 'linux-terminal',   title: 'Linux',            desc: 'Server operatsion tizimi' },
  { slug: 'docker-devops',    title: 'Docker',           desc: 'Konteynerizatsiya texnologiyasi' },
  { slug: 'vuejs',            title: 'Vue.js',           desc: 'Progressive JS framework' },
  { slug: 'typescript',       title: 'TypeScript',       desc: "Kuchli JavaScript versiyasi" },
  { slug: 'mongodb',          title: 'MongoDB',          desc: "NoSQL ma'lumotlar bazasi" },
  { slug: 'flutter-dart',     title: 'Flutter',          desc: 'Mobil ilovalar yaratish' },
  { slug: 'machine-learning', title: 'Machine Learning', desc: "Sun'iy intellekt asoslari" },
  { slug: 'cybersecurity',    title: 'Cybersecurity',    desc: 'Axborot xavfsizligi' },
]

const PLANS = [
  { name: 'Free', price: '0', dur: '3 kun', badge: 'free', features: ['3 ta kurs', 'Video darslar', 'AI (cheklangan)'], no: ['Sertifikat', 'Mentor'] },
  { name: 'Pro', price: '700,000', dur: '30 kun', badge: 'pro', popular: true, features: ['Barcha kurslar', 'Video darslar', 'AI chat', 'Sertifikat'], no: ['Mentor'] },
  { name: 'Max', price: '1,500,000', dur: '30 kun', badge: 'max', features: ['Barcha kurslar', 'AI chat', 'Sertifikat', 'Mentor', 'Loyiha tekshiruvi'], no: ['Ish kafolati'] },
  { name: 'VIP', price: '3,000,000', dur: '30 kun', badge: 'vip', features: ['Barcha kurslar', 'AI chat', 'Sertifikat', 'Mentor', 'Ish kafolati', 'CV tayyorlash', 'Intervyu'], no: [] },
]

const TESTIMONIALS = [
  { name: 'Aziz Karimov', role: 'Frontend Developer', text: 'ITX orqali 6 oyda JavaScript va React ni organdim. Hozir IT kompaniyada ishlayapman! Kurslar juda tushunarli va amaliy.', rating: 5 },
  { name: 'Malika Yusupova', role: 'Data Scientist', text: 'Python kursini tugatib, Data Science sohasiga kirdim. Mentor yordami juda foydali boldi! Tavsiya qilaman.', rating: 5 },
  { name: 'Jasur Toshmatov', role: 'Backend Developer', text: 'VIP paket orqali ish kafolati oldim. 3 oy ichida intervyudan otib, yaxshi maosh bilan ishga kirdim!', rating: 5 },
  { name: 'Dilnoza Rahimova', role: 'Full Stack Developer', text: 'Node.js va React kurslarini birgalikda olib, full stack developer boldim. ITX eng yaxshi platforma!', rating: 5 },
  { name: 'Bobur Xasanov', role: 'DevOps Engineer', text: 'Docker va Linux kurslaridan keyin DevOps sohasiga kirdim. Kurslar professional darajada tayyorlangan.', rating: 5 },
]

function Counter({ target, decimal }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let cur = 0
    const inc = target / 60
    const t = setInterval(() => {
      cur += inc
      if (cur >= target) { cur = target; clearInterval(t) }
      setVal(decimal ? (cur / 10).toFixed(1) : Math.floor(cur).toLocaleString())
    }, 30)
    return () => clearInterval(t)
  }, [target])
  return <span>{val}</span>
}

// Auto-sliding courses (5 ta ko'rinadi, 5 sekundda o'tadi)
function CourseSlider() {
  const [idx, setIdx] = useState(0)
  const visible = 5
  const total = COURSES.length

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => (i + 1) % (total - visible + 1))
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(total - visible, i + 1))

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex', gap: '1rem',
          transform: `translateX(calc(-${idx * (100 / visible)}% - ${idx * (16 / visible)}px))`,
          transition: 'transform 0.6s cubic-bezier(.4,0,.2,1)',
          width: `${(total / visible) * 100}%`
        }}>
          {COURSES.map((c, i) => {
            const logo = getCourseLogo(c.slug)
            return (
            <div key={i} style={{
              flex: `0 0 calc(${100 / total}% - ${(total - 1) * 16 / total}px)`,
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              textAlign: 'center', transition: 'all 0.3s', cursor: 'pointer',
              minWidth: 0
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = logo.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${logo.color}30` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 14, background: logo.bg, border: `1px solid ${logo.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                {logo.svg}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{c.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.desc}</div>
            </div>
            )
          })}
        </div>
      </div>
      <button onClick={prev} disabled={idx === 0} style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'all 0.2s', opacity: idx === 0 ? 0.3 : 1 }}>
        <ChevronLeft size={18} />
      </button>
      <button onClick={next} disabled={idx >= total - visible} style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'all 0.2s', opacity: idx >= total - visible ? 0.3 : 1 }}>
        <ChevronRight size={18} />
      </button>
      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
        {Array.from({ length: total - visible + 1 }).map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
    </div>
  )
}

// Testimonials auto-carousel (3 ta ko'rinadi, 5 sekundda o'tadi)
function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0)
  const total = TESTIMONIALS.length

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % total), 5000)
    return () => clearInterval(t)
  }, [])

  // 3 ta ko'rsatish
  const visible = [
    TESTIMONIALS[idx % total],
    TESTIMONIALS[(idx + 1) % total],
    TESTIMONIALS[(idx + 2) % total],
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }} className="testimonials-grid-resp">
        {visible.map((t, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem' }}>
              {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />)}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{t.text}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.name[0]}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ total_users: 1250, total_courses: 15, total_videos: 340, rating: 4.9 })

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div style={{ paddingTop: 64 }}>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '4rem 0', background: 'radial-gradient(ellipse at 20% 50%,rgba(99,102,241,.12) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(139,92,246,.08) 0%,transparent 50%)' }}>
        <div className="container">
          <div className="hero-grid">
            <div className="fade-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.3)', color: 'var(--primary)', padding: '.4rem 1rem', borderRadius: '50px', fontSize: '.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                <TrendingUp size={14} /> O'zbekistondagi #1 IT Platforma
              </div>
              <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.2rem' }}>
                IT sohasini <span className="gradient-text">professional</span> darajada o'rganing
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                15+ kurs, 300+ video dars, real loyihalar va sertifikatlar bilan IT karyerangizni boshlang.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {user
                  ? <Link to="/dashboard" className="btn btn-primary btn-lg">Dashboard <ArrowRight size={18} /></Link>
                  : <Link to="/register" className="btn btn-primary btn-lg">Bepul boshlash <ArrowRight size={18} /></Link>
                }
                <Link to="/pricing" className="btn btn-outline btn-lg">Narxlar</Link>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {['3 kun bepul sinov', 'Sertifikat beriladi', 'Mentor yordami'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', color: 'var(--text-muted)' }}>
                    <CheckCircle size={14} color="#22c55e" /> {t}
                  </span>
                ))}
              </div>
            </div>
            {/* Code window */}
            <div className="fade-up hero-code-wrap" style={{ animationDelay: '.1s' }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.8rem 1rem', background: 'var(--card2)', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'block' }} />
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'block' }} />
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', display: 'block' }} />
                  <span style={{ marginLeft: '.5rem', fontSize: '.8rem', color: 'var(--text-muted)' }}>main.js</span>
                </div>
                <div style={{ padding: '1.5rem', fontFamily: 'Courier New,monospace', fontSize: '.9rem', lineHeight: 1.8 }}>
                  <div><span style={{color:'#c084fc'}}>const</span> <span style={{color:'#60a5fa'}}>itx</span> = {'{'}</div>
                  <div style={{paddingLeft:'1.5rem'}}><span style={{color:'#34d399'}}>platform</span>: <span style={{color:'#fbbf24'}}>"ITX"</span>,</div>
                  <div style={{paddingLeft:'1.5rem'}}><span style={{color:'#34d399'}}>courses</span>: <span style={{color:'#f87171'}}>{stats.total_courses}</span>,</div>
                  <div style={{paddingLeft:'1.5rem'}}><span style={{color:'#34d399'}}>students</span>: <span style={{color:'#f87171'}}>{stats.total_users.toLocaleString()}</span>,</div>
                  <div style={{paddingLeft:'1.5rem'}}><span style={{color:'#34d399'}}>rating</span>: <span style={{color:'#f87171'}}>{stats.rating}</span>,</div>
                  <div style={{paddingLeft:'1.5rem'}}><span style={{color:'#60a5fa'}}>start</span>() {'{'}</div>
                  <div style={{paddingLeft:'3rem'}}><span style={{color:'#c084fc'}}>return</span> <span style={{color:'#fbbf24'}}>"O'qishni boshlang!"</span>;</div>
                  <div style={{paddingLeft:'1.5rem'}}>{'}'}</div>
                  <div>{'};'}</div>
                  <div style={{color:'var(--primary)',animation:'blink 1s infinite'}}>▌</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '4rem 0', background: 'var(--bg2)' }}>
        <div className="container">
          <div className="stats-grid-4">
            {[
              { Icon: Users, val: stats.total_users, label: "O'quvchilar", color: '#6366f1' },
              { Icon: BookOpen, val: stats.total_courses, label: 'Kurslar', color: '#8b5cf6' },
              { Icon: Video, val: stats.total_videos, label: 'Video darslar', color: '#06b6d4' },
              { Icon: Star, val: 49, label: 'Reyting', decimal: true, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center', transition: 'transform .3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <s.Icon size={24} color={s.color} />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800 }} className="gradient-text"><Counter target={s.val} decimal={s.decimal} /></div>
                <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.3rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES SLIDER */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '.8rem' }}>Bizning <span className="gradient-text">Kurslar</span></h2>
            <p style={{ color: 'var(--text-muted)' }}>Zamonaviy IT texnologiyalarini o'rganing</p>
          </div>
          <div style={{ padding: '0 1.5rem' }}>
            <CourseSlider />
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to={user ? '/courses' : '/register'} className="btn btn-primary btn-lg">
              {user ? "Kurslarni ko'rish" : 'Bepul boshlash'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '5rem 0', background: 'var(--bg2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '.8rem' }}>Tarif <span className="gradient-text">Rejalari</span></h2>
            <p style={{ color: 'var(--text-muted)' }}>O'zingizga mos rejani tanlang</p>
          </div>
          <div className="pricing-grid-4">
            {PLANS.map((p, i) => (
              <div key={i} style={{ background: 'var(--card)', border: `1px solid ${p.popular ? 'var(--primary)' : p.badge === 'vip' ? '#f59e0b' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '2rem', position: 'relative', transition: 'transform .3s', boxShadow: p.popular ? '0 0 30px rgba(99,102,241,.2)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                {p.popular && <div style={{ position: 'absolute', top: -1, right: '1.5rem', background: 'var(--gradient)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '.3rem .8rem', borderRadius: '0 0 8px 8px' }}>Mashhur</div>}
                <span className={`badge-${p.badge}`}>{p.name}</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, margin: '.8rem 0 .2rem' }} className="gradient-text">{p.price}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>so'm / {p.dur}</div>
                <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
                  {p.features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.3rem 0', fontSize: '.85rem' }}><CheckCircle size={14} color="#22c55e" /> {f}</li>)}
                  {p.no.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.3rem 0', fontSize: '.85rem', color: 'var(--text-muted)' }}><XCircle size={14} color="#ef4444" /> {f}</li>)}
                </ul>
                <Link to="/pricing" className={`btn ${p.popular || p.badge === 'vip' ? 'btn-primary' : 'btn-outline'} btn-block`} style={{ justifyContent: 'center' }}>Tanlash</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - faqat izohlar bo'lsa ko'rsatish */}
      {TESTIMONIALS.length > 0 && (
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>O'quvchilar <span className="gradient-text">fikrlari</span></h2>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>
      )}

      {/* CTA */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.1))', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>IT karyerangizni <span className="gradient-text">bugun boshlang!</span></h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>3 kunlik bepul sinov davri bilan hech qanday xavf yo'q.</p>
          <Link to={user ? '/courses' : '/register'} className="btn btn-primary btn-lg">
            {user ? "Kurslarni ko'rish" : 'Bepul boshlash'} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '3rem 0 1.5rem' }}>
        <div className="container">
          <div className="footer-grid-4">
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontSize: '1.3rem', fontWeight: 800, textDecoration: 'none', marginBottom: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={20} color="#fff" />
                </div>
                <span className="gradient-text">ITX</span>
              </Link>
              <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>IT sohasini o'rganish uchun eng yaxshi platforma. Yaratuvchi: Valiyev Ulug'bek</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <a href="https://t.me/valiyevv_01" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', color: 'var(--text-muted)', fontSize: '.85rem', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,136,204,.15)', border: '1px solid rgba(0,136,204,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={15} color="#0088cc" />
                  </div>
                  @valiyevv_01
                </a>
                <a href="tel:+998906373754" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', color: 'var(--text-muted)', fontSize: '.85rem', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={15} color="#22c55e" />
                  </div>
                  +998 90 637 37 54
                </a>
                <a href="mailto:thisvaliyev@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', color: 'var(--text-muted)', fontSize: '.85rem', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={15} color="#ef4444" />
                  </div>
                  thisvaliyev@gmail.com
                </a>
              </div>
            </div>
            {[
              { title: 'Kurslar', links: [['Barcha kurslar', '/courses'], ['HTML & CSS', '/courses'], ['JavaScript', '/courses'], ['React.js', '/courses'], ['Node.js', '/courses']] },
              { title: 'Platforma', links: [['Narxlar', '/pricing'], ['Dashboard', '/dashboard'], ['Profil', '/profile'], ["Ro'yxatdan o'tish", '/register'], ['Kirish', '/login']] },
              { title: 'Qo\'llab-quvvatlash', links: [['Telegram: @valiyevv_01', 'https://t.me/valiyevv_01'], ['Tel: +998906373754', 'tel:+998906373754'], ['Email: thisvaliyev@gmail.com', 'mailto:thisvaliyev@gmail.com']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '.9rem' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none' }}>
                  {col.links.map(([label, href]) => (
                    <li key={label} style={{ marginBottom: '.6rem' }}>
                      <Link to={href} style={{ color: 'var(--text-muted)', fontSize: '.85rem', textDecoration: 'none', transition: 'color .2s' }}
                        onMouseEnter={e => e.target.style.color = 'var(--text)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                      >{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '.8rem', flexWrap: 'wrap', gap: '.5rem' }}>
            <span>© {new Date().getFullYear()} ITX Platform. Barcha huquqlar himoyalangan.</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              Made with <Heart size={14} color="#ef4444" fill="#ef4444" /> by Valiyev Ulug'bek
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
        .stats-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem}
        .pricing-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem}
        .footer-grid-4{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:3rem;margin-bottom:2rem}
        .testimonials-grid-resp{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
        @media(max-width:1200px){
          .pricing-grid-4{grid-template-columns:repeat(2,1fr)}
          .footer-grid-4{grid-template-columns:1fr 1fr;gap:2rem}
        }
        @media(max-width:1024px){
          .hero-grid{grid-template-columns:1fr}
          .hero-code-wrap{display:none}
          .stats-grid-4{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:768px){
          .hero-grid h1{font-size:2rem!important}
          .stats-grid-4{grid-template-columns:repeat(2,1fr);gap:1rem}
          .pricing-grid-4{grid-template-columns:1fr}
          .testimonials-grid-resp{grid-template-columns:1fr}
          .footer-grid-4{grid-template-columns:1fr}
          section{padding:3rem 0!important}
        }
        @media(max-width:480px){
          .stats-grid-4{grid-template-columns:1fr 1fr}
        }
      `}</style>
    </div>
  )
}


