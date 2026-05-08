import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * Universal "Orqaga" tugmasi
 * fallback — agar history bo'sh bo'lsa qayerga o'tish
 */
export default function BackButton({ fallback = '/', label = 'Orqaga' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button onClick={handleBack} className="back-btn" aria-label="Orqaga qaytish">
      <ArrowLeft size={16} />
      <span>{label}</span>
      <style>{`
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
          text-decoration: none;
        }
        .back-btn:hover {
          background: rgba(99,102,241,0.1);
          border-color: var(--primary);
          color: var(--primary);
          transform: translateX(-2px);
        }
      `}</style>
    </button>
  )
}
