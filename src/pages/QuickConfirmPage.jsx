import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function QuickConfirmPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [pin, setPin] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId || !pin || pin.length < 4) return
    fetch(`/api/admin-orders`, { headers: { 'x-admin-pin': pin } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((o) => o.id === orderId)
          setOrder(found || null)
        }
      })
      .catch(() => {})
  }, [orderId, pin])

  async function handleConfirm() {
    if (!pin) { setError('กรุณาใส่ PIN'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
      body: JSON.stringify({ orderId }),
    })
    if (res.status === 401) { setError('PIN ไม่ถูกต้อง'); setLoading(false); return }
    if (!res.ok) { setError('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง'); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  const shortId = orderId?.slice(0, 8).toUpperCase()

  if (done) {
    return (
      <div className="qconfirm-page">
        <div className="qconfirm-box">
          <p style={{ fontSize: '3rem', margin: 0 }}>✅</p>
          <h2>ยืนยันเรียบร้อย!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>ระบบแจ้งลูกค้าแล้ว</p>
        </div>
      </div>
    )
  }

  return (
    <div className="qconfirm-page">
      <div className="qconfirm-box">
        <h2>✅ ยืนยันชำระเงิน</h2>
        <p className="qconfirm-id">ออเดอร์ #{shortId}</p>

        {order && (
          <div className="qconfirm-info">
            <div className="qconfirm-row"><span>ยอด</span><span style={{ color: 'var(--primary)', fontWeight: 700 }}>฿{Number(order.total).toFixed(0)}</span></div>
            <div className="qconfirm-row"><span>ที่อยู่</span><span>{order.address}</span></div>
            {order.slip_url && <img src={order.slip_url} alt="slip" className="qconfirm-slip" />}
          </div>
        )}

        <label className="form-label" style={{ marginTop: 16 }}>รหัส PIN เจ้าของร้าน</label>
        <input
          type="password"
          className="form-input"
          placeholder="ใส่ PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
        />
        {error && <p className="form-error">{error}</p>}
        <button className="btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={handleConfirm} disabled={loading || !pin}>
          {loading ? 'กำลังยืนยัน...' : '✅ ยืนยันชำระเงินแล้ว'}
        </button>
      </div>
    </div>
  )
}
