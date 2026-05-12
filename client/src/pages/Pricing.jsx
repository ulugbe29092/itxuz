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
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!file) return toast.error("To'lov chekini (rasm) yuklang")
    if (!user) return navigate('/register')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('plan', modal.plan)
      fd.append('payment_proof', file)
      await api.post('/payment/submit', fd)
      setPaymentSuccess(true)
      // 10 soniyadan keyin modal yopilsin
      setTimeout(() => {
        setModal(null)
        setFile(null)
        setPaymentSuccess(false)
      }, 10000)
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
              {paymentSuccess ? (
                /* ===== TO'LOV MUVAFFAQIYATLI ===== */
                <div
                  onClick={() => { setModal(null); setFile(null); setPaymentSuccess(false) }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Yuqori xabar */}
                  <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '2px solid #86efac', borderRadius: 16, padding: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a', marginBottom: '0.4rem' }}>
                      To'lovingiz qabul qilindi!
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#15803d', lineHeight: 1.6 }}>
                      24 soat ichida adminlar to'lovni tasdiqlashadi va tarifingiz faollashadi.
                    </div>
                  </div>

                  {/* Bog'lanish */}
                  <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.2rem' }}>📞</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.2rem' }}>Savol bo'lsa bog'laning:</div>
                      <a href="tel:+998906373754" style={{ fontSize: '1rem', fontWeight: 800, color: '#3b82f6', textDecoration: 'none' }}>+998 90 637 37 54</a>
                    </div>
                  </div>

                  {/* Pastki xabar */}
                  <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600, marginBottom: '0.3rem' }}>
                      ⏰ 24 soat ichida tarifingiz faollashadi
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#b45309' }}>
                      Bu xabar 10 soniyadan keyin yopiladi • Yopish uchun bosing
                    </div>
                  </div>
                </div>
              ) : (
                /* ===== TO'LOV FORMASI ===== */
                <>
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '1.2rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>To'lov ma'lumotlari</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' }}>
                      <span style={{ color: '#6b7280' }}>Admin telefon:</span>
                      <strong><a href="tel:+998906373754" style={{ color: '#3b82f6', textDecoration: 'none' }}>+998 90 637 37 54</a></strong>
                    </div>
                    {[['Karta raqami', '8600 1234 5678 9012'], ['Karta egasi', "VALIYEV ULUG'BEK"], ['Summa', `${modal.price} so'm`]].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' }}>
                        <span style={{ color: '#6b7280' }}>{k}:</span>
                        <strong style={{ color: '#111827' }}>{v}</strong>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#1d4ed8', lineHeight: 1.6 }}>
                    💳 Yuqoridagi karta raqamiga to'lov qiling va chekni rasmga olib yuklang.
                  </div>

                  <form onSubmit={handlePayment}>
                    <div className="form-group">
                      <label className="form-label">To'lov cheki (rasm)</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', background: file ? '#f0fdf4' : '#f8fafc', border: `1.5px dashed ${file ? '#86efac' : '#d1d5db'}`, borderRadius: 10, padding: '0.9rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: file ? '#16a34a' : '#9ca3af', transition: 'all 0.2s' }}>
                        <Upload size={18} color={file ? '#16a34a' : '#9ca3af'} />
                        {file ? `✓ ${file.name}` : 'Rasm tanlang (JPG, PNG)'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} required />
                      </label>
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', background: submitting ? '#9ca3af' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: submitting ? 'none' : '0 4px 16px rgba(59,130,246,0.3)', transition: 'all 0.2s' }} disabled={submitting}>
                      {submitting
                        ? <><Loader2 size={16} className="spin" /> Yuborilmoqda...</>
                        : <><CreditCard size={16} /> To'lovni yuborish</>
                      }
                    </button>
                  </form>
                </>
              )}
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
