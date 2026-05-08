import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, X, CreditCard, Upload, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import BackButton from '../components/BackButton'

const PLANS = [
  { id: 'free', name: 'Free', price: '0', dur: '3 kun', badge: 'free',
    features: ['3 ta kurs', 'Video darslar', 'Quiz testlar', 'AI yordamchi (cheklangan)'],
    no: ['AI chat', 'Sertifikat', 'Mentor', 'Ish kafolati'] },
  { id: 'pro', name: 'Pro', price: '700,000', dur: '30 kun', badge: 'pro', popular: true,
    features: ['Barcha kurslar', 'Video darslar', 'Quiz testlar', 'AI chat', 'Sertifikat'],
    no: ['Mentor', 'Ish kafolati'] },
  { id: 'max', name: 'Max', price: '1,500,000', dur: '30 kun', badge: 'max',
    features: ['Barcha kurslar', 'Video darslar', 'Quiz testlar', 'AI chat', 'Sertifikat', 'Mentor yordami', 'Loyiha tekshiruvi', 'Prioritet yordam'],
    no: ['Ish kafolati'] },
  { id: 'vip', name: 'VIP', price: '3,000,000', dur: '30 kun', badge: 'vip',
    features: ['Barcha kurslar', 'Video darslar', 'Quiz testlar', 'AI chat (cheksiz)', 'Sertifikat', 'Mentor yordami', 'Loyiha tekshiruvi', 'Ish kafolati', 'CV tayyorlash', 'Intervyu tayyorligi', 'Admin bilan aloqa'],
    no: [] },
]

export default function Pricing() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!file) return toast.error("To'lov chekini (rasm) yuklang")
    if (!user) return navigate('/register')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('plan', modal.plan)
      fd.append('payment_proof', file)
      // Content-Type ni axios o'zi qo'yadi — qo'lda bermaslik kerak!
      await api.post('/payment/submit', fd)
      toast.success("To'lov muvaffaqiyatli yuborildi! Admin tekshirib, tarifingizni faollashtiradi.")
      setModal(null)
      setFile(null)
    } catch (err) {
      const msg = err.response?.data?.error || "To'lovni yuborishda xatolik"
      toast.error(msg)
    } finally { setSubmitting(false) }
  }

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="page-hero-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
            <BackButton fallback="/" label="Bosh sahifaga qaytish" />
          </div>
          <h1 className="page-hero-title">Tarif <span className="gradient-text">Rejalari</span></h1>
          <p className="page-hero-sub">O'zingizga mos rejani tanlang va IT karyerangizni boshlang</p>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
        <div className="pricing-grid">
          {PLANS.map(p => (
            <div key={p.id} className={`pricing-card ${p.popular ? 'popular' : ''} ${p.id === 'vip' ? 'vip' : ''}`}>
              {p.popular && <div className="popular-ribbon">Mashhur</div>}
              <span className={`badge-${p.badge}`}>{p.name}</span>
              <div className="pricing-price gradient-text">{p.price}</div>
              <div className="pricing-dur">so'm / {p.dur}</div>
              <ul className="pricing-features">
                {p.features.map(f => (
                  <li key={f}><CheckCircle size={14} color="#22c55e" /> {f}</li>
                ))}
                {p.no.map(f => (
                  <li key={f} style={{ color: 'var(--text-muted)' }}><XCircle size={14} color="#ef4444" /> {f}</li>
                ))}
              </ul>
              {p.id === 'free'
                ? user
                  ? <button className="btn btn-outline btn-block" disabled>{user.plan === 'free' ? 'Joriy reja' : 'Mavjud'}</button>
                  : <Link to="/register" className="btn btn-outline btn-block">Boshlash</Link>
                : user?.plan === p.id
                  ? <button className={`btn ${p.popular || p.id === 'vip' ? 'btn-primary' : 'btn-outline'} btn-block`} disabled>Joriy reja</button>
                  : <button
                      className={`btn ${p.popular || p.id === 'vip' ? 'btn-primary' : 'btn-outline'} btn-block`}
                      onClick={() => { if (!user) navigate('/register'); else setModal({ plan: p.id, price: p.price }) }}>
                      Tanlash
                    </button>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3><CreditCard size={18} /> To'lov yuborish</h3>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="payment-info-box">
                <h4>To'lov ma'lumotlari:</h4>
                {[['Karta raqami', '8600 1234 5678 9012'], ['Karta egasi', 'ULUGBEK VALIYEV'], ['Summa', `${modal.price} so'm`]].map(([k, v]) => (
                  <div key={k} className="payment-row">
                    <span>{k}:</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                Yuqoridagi karta raqamiga to'lov qiling va chekni rasmga olib yuklang.
              </p>
              <form onSubmit={handlePayment}>
                <div className="form-group">
                  <label className="form-label">To'lov cheki (rasm)</label>
                  <label className="file-upload-label">
                    <Upload size={18} />
                    {file ? file.name : 'Rasm tanlash...'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} required />
                  </label>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={16} className="spin" /> Yuborilmoqda...</>
                    : <><CreditCard size={16} /> To'lovni yuborish</>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-hero-section{padding:4rem 0 2rem;background:linear-gradient(135deg,var(--bg2),var(--bg3));border-bottom:1px solid var(--border)}
        .page-hero-title{font-size:2.5rem;font-weight:800;margin-bottom:.5rem}
        .page-hero-sub{color:var(--text-muted)}
        .pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;align-items:stretch}
        .pricing-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:2rem;position:relative;transition:transform .3s;display:flex;flex-direction:column}
        .pricing-card:hover{transform:translateY(-6px)}
        .pricing-card.popular{border-color:var(--primary);box-shadow:0 0 40px rgba(99,102,241,.2)}
        .pricing-card.vip{border-color:#f59e0b}
        .popular-ribbon{position:absolute;top:-1px;right:1.5rem;background:var(--gradient);color:#fff;font-size:.7rem;font-weight:700;padding:.3rem .8rem;border-radius:0 0 8px 8px}
        .pricing-price{font-size:2rem;font-weight:800;margin:.8rem 0 .2rem}
        .pricing-dur{font-size:.8rem;color:var(--text-muted);margin-bottom:1.5rem}
        .pricing-features{list-style:none;margin-bottom:1.5rem;flex:1}
        .pricing-features li{display:flex;align-items:center;gap:.5rem;padding:.35rem 0;font-size:.85rem;border-bottom:1px solid rgba(255,255,255,.04)}
        .pricing-card .btn{margin-top:auto}
        .payment-info-box{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.2rem;margin-bottom:1.2rem}
        .payment-info-box h4{font-size:.9rem;font-weight:700;margin-bottom:.8rem;color:var(--text-muted)}
        .payment-row{display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.9rem}
        .payment-row:last-child{border-bottom:none}
        .file-upload-label{display:flex;align-items:center;gap:.6rem;width:100%;background:var(--bg2);border:1.5px dashed var(--border);border-radius:var(--radius);padding:.8rem 1rem;cursor:pointer;font-size:.9rem;color:var(--text-muted);transition:border-color .2s}
        .file-upload-label:hover{border-color:var(--primary);color:var(--text)}
        @media(max-width:1024px){.pricing-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){
          .pricing-grid{grid-template-columns:1fr}
          .page-hero-title{font-size:1.8rem}
        }
      `}</style>
    </div>
  )
}
