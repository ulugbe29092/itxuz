import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, BookOpen, Video, Star, CheckCircle,
  ArrowRight, TrendingUp, Heart, Phone, Mail,
  MessageCircle, GraduationCap,
  Code2, Zap, Shield, Award
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

function CourseGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }} className="courses-home-grid">
      {COURSES.map((c, i) => {
        const logo = getCourseLogo(c.slug)
        return (
          <div key={i} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.2rem',
            textAlign: 'center', transition: 'all 0.3s', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = logo.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${logo.color}30` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 12, background: logo.bg, border: `1px solid ${logo.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
              {logo.svg}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem' }}>{c.title}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{c.desc}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ total_users: 0, total_courses: 15, total_videos: 0, rating: 4.9 })

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
            {/* Hero Visual - Animated */}
            <div className="fade-up hero-visual-wrap" style={{ animationDelay: '.15s' }}>
              <div className="hero-visual">
                {/* Outer glow rings */}
                <div className="hero-ring hero-ring-1" />
                <div className="hero-ring hero-ring-2" />
                <div className="hero-ring hero-ring-3" />

                {/* Center card */}
                <div className="hero-center-card">
                  <div className="hero-center-icon">
                    <GraduationCap size={40} color="#fff" />
                  </div>
                  <div className="hero-center-text">ITX</div>
                  <div className="hero-center-sub" style={{textAlign:'center',letterSpacing:'0.5px'}}>ITX IT PLATFORMA</div>
                </div>

                {/* Orbiting tech icons */}
                {[
                  { slug: 'html-css',   angle: 0,   label: 'HTML' },
                  { slug: 'javascript', angle: 45,  label: 'JS' },
                  { slug: 'python',     angle: 90,  label: 'Python' },
                  { slug: 'reactjs',    angle: 135, label: 'React' },
                  { slug: 'nodejs',     angle: 180, label: 'Node' },
                  { slug: 'typescript', angle: 225, label: 'TS' },
                  { slug: 'docker-devops', angle: 270, label: 'Docker' },
                  { slug: 'mongodb',    angle: 315, label: 'Mongo' },
                ].map((item, i) => {
                  const logo = getCourseLogo(item.slug, 24)
                  const rad = (item.angle * Math.PI) / 180
                  const r = 130
                  const x = Math.cos(rad) * r
                  const y = Math.sin(rad) * r
                  return (
                    <div key={i} className="orbit-icon" style={{
                      left: `calc(50% + ${x}px - 24px)`,
                      top: `calc(50% + ${y}px - 24px)`,
                      animationDelay: `${i * 0.2}s`
                    }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: logo.bg, border: `1.5px solid ${logo.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                        {logo.svg}
                      </div>
                    </div>
                  )
                })}

                {/* Floating stat cards */}
                <div className="hero-stat-card hero-stat-1">
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>1,250+</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>O'quvchilar</div>
                </div>
                <div className="hero-stat-card hero-stat-2">
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#22c55e' }}>15+</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Kurslar</div>
                </div>
                <div className="hero-stat-card hero-stat-3">
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b' }}>4.9★</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Reyting</div>
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
          <div>
            <CourseGrid />
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to={user ? '/courses' : '/register'} className="btn btn-primary btn-lg">
              {user ? "Kurslarni ko'rish" : 'Bepul boshlash'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* NIMA O'RGATAMIZ */}
      <section style={{ padding: '5rem 0', background: 'var(--bg2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '.8rem' }}>Nima <span className="gradient-text">o'rgatamiz?</span></h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>ITX platformasida siz zamonaviy IT texnologiyalarini amaliy loyihalar orqali o'rganasiz</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }} className="features-grid-resp">
            {[
              { icon: '🌐', title: 'Web Dasturlash', desc: 'HTML, CSS, JavaScript, React, Vue.js, Node.js — zamonaviy web ilovalar yaratishni o\'rganing. Frontend va backend texnologiyalarini birgalikda o\'zlashtirasiz.' },
              { icon: '🐍', title: 'Backend & Python', desc: 'Python, Django, FastAPI, PostgreSQL, MongoDB — server tomonida dasturlash va ma\'lumotlar bazasi bilan ishlashni o\'rganing.' },
              { icon: '📱', title: 'Mobil Ilovalar', desc: 'Flutter & Dart bilan iOS va Android uchun bir vaqtda mobil ilovalar yarating. Google Play va App Store ga chiqaring.' },
              { icon: '🤖', title: 'AI & Machine Learning', desc: 'Sun\'iy intellekt, neural tarmoqlar, Python bilan ML modellarini yarating. TensorFlow va scikit-learn kutubxonalarini o\'rganing.' },
              { icon: '🔒', title: 'Cybersecurity', desc: 'Axborot xavfsizligi asoslari, etik hacking, penetration testing va himoya usullarini professional darajada o\'rganing.' },
              { icon: '🐳', title: 'DevOps & Cloud', desc: 'Docker, Kubernetes, CI/CD, Linux, Git — zamonaviy DevOps amaliyotlari va cloud texnologiyalarini o\'rganing.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.8rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NARXLAR */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '.8rem' }}>Tarif <span className="gradient-text">Rejalari</span></h2>
            <p style={{ color: 'var(--text-muted)' }}>O'zingizga mos rejani tanlang va IT karyerangizni boshlang</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', alignItems: 'stretch' }} className="pricing-home-grid">
            {[
              { name: 'Free', price: '0', dur: '3 kun', badge: 'free',
                features: ['3 ta kurs', 'Video darslar', 'Quiz testlar', 'AI (cheklangan)'],
                no: ['Sertifikat', 'Mentor', 'Ish kafolati'] },
              { name: 'Pro', price: '700,000', dur: '30 kun', badge: 'pro', popular: true,
                features: ['Barcha kurslar', 'Video darslar', 'AI chat', 'Sertifikat'],
                no: ['Mentor', 'Ish kafolati'] },
              { name: 'Max', price: '1,500,000', dur: '30 kun', badge: 'max',
                features: ['Barcha kurslar', 'AI chat', 'Sertifikat', 'Mentor', 'Loyiha tekshiruvi'],
                no: ['Ish kafolati'] },
              { name: 'VIP', price: '3,000,000', dur: '30 kun', badge: 'vip',
                features: ['Barcha kurslar', 'AI chat', 'Sertifikat', 'Mentor', 'Ish kafolati', 'CV tayyorlash', 'Intervyu'],
                no: [] },
            ].map((p, i) => (
              <div key={i} style={{
                background: 'var(--card)',
                border: `1px solid ${p.popular ? 'var(--primary)' : p.badge === 'vip' ? '#f59e0b' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', padding: '2rem',
                position: 'relative', transition: 'transform .3s',
                boxShadow: p.popular ? '0 0 30px rgba(99,102,241,.2)' : 'none',
                display: 'flex', flexDirection: 'column'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                {p.popular && <div style={{ position: 'absolute', top: -1, right: '1.5rem', background: 'var(--gradient)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '.3rem .8rem', borderRadius: '0 0 8px 8px' }}>Mashhur</div>}
                <span className={`badge-${p.badge}`}>{p.name}</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, margin: '.8rem 0 .2rem', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{p.price}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>so'm / {p.dur}</div>
                <ul style={{ listStyle: 'none', marginBottom: '1.5rem', flex: 1 }}>
                  {p.features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.3rem 0', fontSize: '.85rem' }}><CheckCircle size={14} color="#22c55e" /> {f}</li>)}
                  {p.no.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.3rem 0', fontSize: '.85rem', color: 'var(--text-muted)' }}><span style={{color:'#ef4444',fontSize:'1rem'}}>✕</span> {f}</li>)}
                </ul>
                <Link to="/pricing" className={`btn ${p.popular || p.badge === 'vip' ? 'btn-primary' : 'btn-outline'} btn-block`} style={{ justifyContent: 'center', marginTop: 'auto' }}>Tanlash</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.1))', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>IT karyerangizni <span className="gradient-text">bugun boshlang!</span></h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>3 kunlik bepul sinov davri bilan hech qanday xavf yo'q. Ro'yxatdan o'ting va darhol boshlang.</p>
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
        /* ===== ANIMATIONS ===== */
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes floatStat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.03)}}
        @keyframes orbitPulse{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
        @keyframes ringPulse{0%{opacity:0.15;transform:scale(0.95)}50%{opacity:0.35;transform:scale(1)}100%{opacity:0.15;transform:scale(0.95)}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes heroCardGlow{
          0%,100%{box-shadow:0 0 40px rgba(99,102,241,0.6),0 0 80px rgba(99,102,241,0.3)}
          50%{box-shadow:0 0 70px rgba(99,102,241,0.9),0 0 120px rgba(139,92,246,0.5)}
        }

        /* ===== HERO VISUAL ===== */
        .hero-visual-wrap{display:flex;align-items:center;justify-content:center}
        .hero-visual{
          position:relative;width:360px;height:360px;
          flex-shrink:0;
        }
        .hero-ring{
          position:absolute;border-radius:50%;border:1px solid rgba(99,102,241,0.25);
          top:50%;left:50%;transform:translate(-50%,-50%);
          animation:ringPulse 3s ease-in-out infinite;
        }
        .hero-ring-1{width:200px;height:200px;animation-delay:0s;border-color:rgba(99,102,241,0.3)}
        .hero-ring-2{width:290px;height:290px;animation-delay:0.8s;border-color:rgba(139,92,246,0.2)}
        .hero-ring-3{width:360px;height:360px;animation-delay:1.6s;border-color:rgba(99,102,241,0.12)}

        .hero-center-card{
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:130px;height:130px;border-radius:32px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          box-shadow:0 0 50px rgba(99,102,241,0.7),0 0 100px rgba(99,102,241,0.35);
          animation:float 4s ease-in-out infinite, heroCardGlow 3s ease-in-out infinite;
          z-index:10;cursor:pointer;
        }
        .hero-center-text{font-size:1.3rem;font-weight:900;color:#fff;line-height:1}
        .hero-center-sub{font-size:0.6rem;color:rgba(255,255,255,0.7);margin-top:2px;letter-spacing:1px;text-transform:uppercase}

        .orbit-icon{
          position:absolute;z-index:8;
          animation:orbitPulse 3s ease-in-out infinite;
          transition:transform 0.3s;
        }
        .orbit-icon:hover{transform:scale(1.2)!important;z-index:20}

        .hero-stat-card{
          position:absolute;z-index:15;
          background:rgba(15,15,26,0.92);
          backdrop-filter:blur(16px);
          border:1px solid rgba(99,102,241,0.25);
          border-radius:14px;padding:0.7rem 1rem;
          text-align:center;min-width:80px;
          animation:floatStat 4s ease-in-out infinite;
          box-shadow:0 8px 32px rgba(0,0,0,0.4);
        }
        .hero-stat-1{bottom:-10px;left:-20px;animation-delay:0s}
        .hero-stat-2{top:10px;right:-30px;animation-delay:1.3s}
        .hero-stat-3{bottom:40px;right:-40px;animation-delay:2.6s}

        /* ===== LAYOUT ===== */
        .hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
        .stats-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem}
        .pricing-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;align-items:stretch}
        .footer-grid-4{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:3rem;margin-bottom:2rem}
        .testimonials-grid-resp{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
        .courses-home-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1rem}
        .features-grid-resp{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
        .pricing-home-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem}

        /* ===== RESPONSIVE ===== */
        @media(max-width:1200px){
          .pricing-grid-4{grid-template-columns:repeat(2,1fr)}
          .footer-grid-4{grid-template-columns:1fr 1fr;gap:2rem}
        }
        @media(max-width:1024px){
          .hero-grid{grid-template-columns:1fr;text-align:center;gap:3rem}
          .hero-visual-wrap{justify-content:center}
          .hero-grid>div:first-child>div[style*="inline-flex"]{margin:0 auto 1.5rem}
          .hero-grid>div:first-child>div[style*="flex-wrap"]{justify-content:center}
          .hero-grid>div:first-child>div[style*="gap:1.5rem"]{justify-content:center}
          .stats-grid-4{grid-template-columns:repeat(2,1fr)}
          .hero-visual{width:300px;height:300px}
          .hero-ring-3{width:300px;height:300px}
          .hero-ring-2{width:240px;height:240px}
          .hero-ring-1{width:165px;height:165px}
          .courses-home-grid{grid-template-columns:repeat(3,1fr)}
          .pricing-home-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:768px){
          .hero-grid h1{font-size:2.2rem!important}
          .stats-grid-4{grid-template-columns:repeat(2,1fr);gap:1rem}
          .pricing-grid-4{grid-template-columns:1fr}
          .testimonials-grid-resp{grid-template-columns:1fr}
          .footer-grid-4{grid-template-columns:1fr}
          section{padding:3rem 0!important}
          .hero-visual{width:260px;height:260px}
          .hero-ring-3{width:260px;height:260px}
          .hero-ring-2{width:200px;height:200px}
          .hero-ring-1{width:140px;height:140px}
          .hero-center-card{width:90px;height:90px;border-radius:22px}
          .hero-stat-1{bottom:-5px;left:-10px}
          .hero-stat-2{top:5px;right:-15px}
          .hero-stat-3{display:none}
          .courses-home-grid{grid-template-columns:repeat(2,1fr)}
          .features-grid-resp{grid-template-columns:1fr}
          .pricing-home-grid{grid-template-columns:1fr}
        }
        @media(max-width:480px){
          .stats-grid-4{grid-template-columns:1fr 1fr}
          .hero-grid h1{font-size:1.9rem!important}
          .hero-visual{width:220px;height:220px}
          .hero-ring-3{width:220px;height:220px}
          .hero-ring-2{width:170px;height:170px}
          .hero-ring-1{width:120px;height:120px}
          .hero-center-card{width:76px;height:76px;border-radius:18px}
          .hero-stat-2{right:-5px}
          .courses-home-grid{grid-template-columns:repeat(2,1fr)}
        }
      `}</style>
    </div>
  )
}


