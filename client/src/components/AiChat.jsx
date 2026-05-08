import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, User, Sparkles } from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function AiChat() {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Greeting — foydalanuvchi ismi bilan
  useEffect(() => {
    if (user) {
      const greeting = user.role === 'admin'
        ? `Assalomu alaykum, ${user.first_name} ${user.last_name}! ITX admin paneliga xush kelibsiz. Sizga qanday yordam bera olaman?`
        : `Salom, ${user.first_name}! Men ITX AI yordamchisiman. Kurslar, narxlar yoki boshqa savollaringizga javob beraman!`
      setMessages([{ role: 'bot', text: greeting }])
    } else {
      setMessages([{ role: 'bot', text: 'Salom! Men ITX AI yordamchisiman.\nKurslar, narxlar yoki platforma haqida savollaringizga javob beraman!' }])
    }
  }, [user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await api.post('/stats/ai-chat', {
        message: text,
        userName: user ? `${user.first_name} ${user.last_name}` : null,
        userRole: user?.role || 'guest',
      })
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Ulanishda xatolik. Qayta urinib ko\'ring.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .ai-widget{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9998}
        .ai-btn{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(99,102,241,.5);transition:all .3s;position:relative;display:flex;align-items:center;justify-content:center}
        .ai-btn:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(99,102,241,.6)}
        .ai-pulse{position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(99,102,241,.4);animation:aiPulse 2s infinite}
        @keyframes aiPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.4}}
        .ai-box{position:absolute;bottom:70px;right:0;width:360px;background:#1a1a2e;border:1px solid rgba(99,102,241,.25);border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,.6);display:flex;flex-direction:column;max-height:500px;animation:fadeUp .2s ease}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .ai-header{background:linear-gradient(135deg,#252545,#1e1e3a);padding:1rem 1.2rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(99,102,241,.2);border-radius:20px 20px 0 0}
        .ai-header-info{display:flex;align-items:center;gap:.7rem}
        .ai-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(99,102,241,.4)}
        .ai-name{font-weight:700;font-size:.9rem;color:#e2e8f0}
        .ai-status{font-size:.7rem;color:#22c55e;display:flex;align-items:center;gap:.3rem}
        .ai-close{background:none;border:none;color:#94a3b8;cursor:pointer;display:flex;align-items:center;padding:.3rem;border-radius:8px;transition:all .2s}
        .ai-close:hover{background:rgba(255,255,255,.08);color:#e2e8f0}
        .ai-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.8rem;min-height:200px}
        .ai-msgs::-webkit-scrollbar{width:4px}
        .ai-msgs::-webkit-scrollbar-thumb{background:#2d2d5e;border-radius:2px}
        .ai-msg{display:flex;gap:.5rem;align-items:flex-end}
        .ai-msg.user{flex-direction:row-reverse}
        .ai-msg-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ai-msg-av.bot{background:linear-gradient(135deg,#6366f1,#8b5cf6)}
        .ai-msg-av.user{background:#252545;border:1px solid #2d2d5e}
        .ai-bubble{max-width:82%;padding:.65rem .9rem;border-radius:14px;font-size:.85rem;line-height:1.55;white-space:pre-wrap}
        .ai-msg.bot .ai-bubble{background:#252545;color:#e2e8f0;border-bottom-left-radius:4px}
        .ai-msg.user .ai-bubble{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-bottom-right-radius:4px}
        .ai-typing .ai-bubble{color:#94a3b8;font-style:italic}
        .ai-input-area{padding:.8rem;border-top:1px solid rgba(99,102,241,.15);display:flex;gap:.5rem;background:#1a1a2e;border-radius:0 0 20px 20px}
        .ai-input{flex:1;background:#0f0f1a;border:1.5px solid #2d2d5e;border-radius:10px;padding:.6rem .9rem;color:#e2e8f0;font-size:.85rem;outline:none;font-family:inherit;transition:border-color .2s}
        .ai-input:focus{border-color:#6366f1}
        .ai-send{background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:10px;width:38px;height:38px;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
        .ai-send:hover{transform:scale(1.05)}
        .ai-send:disabled{opacity:.5;cursor:not-allowed;transform:none}
        @media(max-width:480px){.ai-box{width:calc(100vw - 2rem);right:-0.5rem}}
      `}</style>

      <div className="ai-widget">
        <button className="ai-btn" onClick={() => setOpen(!open)} title="AI Yordamchi">
          {open ? <X size={22} color="#fff" /> : <Sparkles size={22} color="#fff" />}
          {!open && <span className="ai-pulse" />}
        </button>

        {open && (
          <div className="ai-box">
            <div className="ai-header">
              <div className="ai-header-info">
                <div className="ai-avatar"><Bot size={18} color="#fff" /></div>
                <div>
                  <div className="ai-name">ITX AI</div>
                  <div className="ai-status">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    Online
                  </div>
                </div>
              </div>
              <button className="ai-close" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>

            <div className="ai-msgs">
              {messages.map((m, i) => (
                <div key={i} className={`ai-msg ${m.role}`}>
                  <div className={`ai-msg-av ${m.role}`}>
                    {m.role === 'bot' ? <Bot size={14} color="#fff" /> : <User size={14} color="#94a3b8" />}
                  </div>
                  <div className="ai-bubble">{m.text}</div>
                </div>
              ))}
              {loading && (
                <div className="ai-msg bot ai-typing">
                  <div className="ai-msg-av bot"><Bot size={14} color="#fff" /></div>
                  <div className="ai-bubble">Yozmoqda...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="ai-input-area">
              <input
                className="ai-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Savol yozing..."
                maxLength={500}
              />
              <button className="ai-send" onClick={send} disabled={loading}>
                <Send size={15} color="#fff" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
