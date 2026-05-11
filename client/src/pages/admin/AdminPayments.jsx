import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle, XCircle, Clock, X, ZoomIn } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [imageModal, setImageModal] = useState(null) // chek rasmini ko'rsatish

  const load = () => api.get('/admin/payments').then(r => { setPayments(r.data.payments); setLoading(false) })
  useEffect(() => { load() }, [])

  const approve = async (id) => {
    try { await api.post(`/admin/payments/${id}/approve`); toast.success('Tasdiqlandi! Tarif yangilandi.'); load() }
    catch { toast.error('Xatolik') }
  }

  const reject = async (id) => {
    if (!confirm('Rad etishni tasdiqlaysizmi?')) return
    try { await api.post(`/admin/payments/${id}/reject`); toast.success('Rad etildi'); load() }
    catch { toast.error('Xatolik') }
  }

  const statusBadge = (status) => {
    const map = {
      approved: { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', icon: <CheckCircle size={12} />, label: 'Tasdiqlandi' },
      rejected: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: <XCircle size={12} />, label: 'Rad etildi' },
      pending:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: <Clock size={12} />, label: 'Kutilmoqda' },
    }
    const s = map[status] || map.pending
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.7rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
        {s.icon} {s.label}
      </span>
    )
  }

  if (loading) return <Loader fullScreen={false} />

  const pending = payments.filter(p => p.status === 'pending').length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CreditCard size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>To'lovlar boshqaruvi</h1>
          <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>{payments.length} ta to'lov{pending > 0 ? `, ${pending} ta kutilmoqda` : ''}</p>
        </div>
        {pending > 0 && (
          <span style={{ marginLeft: 'auto', background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700 }}>
            ⏳ {pending} ta yangi
          </span>
        )}
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                {['#', 'Foydalanuvchi', 'Tarif', 'Summa', 'Holat', 'Chek', 'Sana', 'Amallar'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.8rem 1rem', background: '#f8fafc', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                    <CreditCard size={40} style={{ opacity: 0.3, marginBottom: '0.8rem', display: 'block', margin: '0 auto 0.8rem' }} />
                    Hali to'lovlar yo'q
                  </td>
                </tr>
              ) : payments.map((p, i) => (
                <tr key={p.id} style={{ background: p.status === 'pending' ? '#fffbeb' : '#fff', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = p.status === 'pending' ? '#fef9c3' : '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = p.status === 'pending' ? '#fffbeb' : '#fff'}
                >
                  <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#9ca3af', fontSize: '0.8rem' }}>#{p.id}</td>
                  <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{p.first_name} {p.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>@{p.username}</div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                    <span className={`badge-${p.plan}`}>{p.plan?.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                    {p.amount?.toLocaleString()} so'm
                  </td>
                  <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                    {statusBadge(p.status)}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                    {p.payment_proof_image ? (
                      <button
                        onClick={() => setImageModal(p)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.8rem', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#3b82f6' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe' }}
                      >
                        <ZoomIn size={13} /> Ko'rish
                      </button>
                    ) : (
                      <span style={{ color: '#d1d5db', fontSize: '0.8rem' }}>Yo'q</span>
                    )}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#9ca3af', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {new Date(p.created_at).toLocaleDateString('uz-UZ')}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                    {p.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => approve(p.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', borderRadius: 8, background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                        >
                          <CheckCircle size={13} /> Tasdiqlash
                        </button>
                        <button
                          onClick={() => reject(p.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                        >
                          <XCircle size={13} /> Rad
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#d1d5db' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chek rasmi modal */}
      {imageModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setImageModal(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.2rem', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>To'lov cheki</div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{imageModal.first_name} {imageModal.last_name} — {imageModal.plan?.toUpperCase()}</div>
              </div>
              <button onClick={() => setImageModal(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
                <X size={16} />
              </button>
            </div>

            {/* Rasm */}
            <div style={{ padding: '1rem', background: '#f8fafc' }}>
              <img
                src={imageModal.payment_proof_image}
                alt="To'lov cheki"
                style={{ width: '100%', borderRadius: 12, display: 'block', maxHeight: 400, objectFit: 'contain', background: '#fff' }}
              />
            </div>

            {/* Info */}
            <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                {[
                  ['Foydalanuvchi', `${imageModal.first_name} ${imageModal.last_name}`],
                  ['Tarif', imageModal.plan?.toUpperCase()],
                  ['Summa', `${imageModal.amount?.toLocaleString()} so'm`],
                  ['Sana', new Date(imageModal.created_at).toLocaleDateString('uz-UZ')],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#f8fafc', borderRadius: 8, padding: '0.5rem 0.7rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.1rem' }}>{k}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{v}</div>
                  </div>
                ))}
              </div>

              {imageModal.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    onClick={() => { approve(imageModal.id); setImageModal(null) }}
                    style={{ flex: 1, padding: '0.7rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle size={16} /> Tasdiqlash
                  </button>
                  <button
                    onClick={() => { reject(imageModal.id); setImageModal(null) }}
                    style={{ flex: 1, padding: '0.7rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <XCircle size={16} /> Rad etish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
