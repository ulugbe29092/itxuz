export default function Loader({ fullScreen = true }) {
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, flexDirection: 'column', gap: '1rem'
      }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Yuklanmoqda...</p>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div className="spinner" />
    </div>
  )
}
