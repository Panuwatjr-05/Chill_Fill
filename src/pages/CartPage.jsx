import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLiff } from '../context/LiffContext'
import { placeOrder } from '../services/orderService'

export default function CartPage() {
  const { items, total, dispatch } = useCart()
  const { lineUserId, liffReady } = useLiff()
  const navigate = useNavigate()
  const [form, setForm] = useState({ address: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.address.trim() || !form.phone.trim()) {
      setError('กรุณากรอกที่อยู่และเบอร์โทรศัพท์')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const { orderId } = await placeOrder(form, items, lineUserId)
      dispatch({ type: 'CLEAR' })
      navigate(`/order-success/${orderId}`)
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <p>🛒 ตะกร้าว่างเปล่า</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          ดูเมนู
        </button>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← กลับ
        </button>
        <h2>รายการที่สั่ง</h2>
        <button className="btn-clear-cart" onClick={() => dispatch({ type: 'CLEAR' })}>
          ✕
        </button>
      </div>

      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.key} className="cart-item">
            <div className="cart-item-info">
              <p className="cart-item-name">
                {item.menu_item_name} {item.size}
              </p>
              <p className="cart-item-meta">฿{item.price} / ชิ้น</p>
              {item.note && <p className="cart-item-note">{item.note}</p>}
            </div>
            <div className="cart-item-right">
              <div className="qty-control">
                <button
                  onClick={() =>
                    dispatch({ type: 'UPDATE_QTY', key: item.key, quantity: item.quantity - 1 })
                  }
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    dispatch({ type: 'UPDATE_QTY', key: item.key, quantity: item.quantity + 1 })
                  }
                >
                  +
                </button>
              </div>
              <p className="cart-item-subtotal">฿{(item.price * item.quantity).toFixed(0)}</p>
              <button
                className="btn-remove"
                onClick={() => dispatch({ type: 'REMOVE_ITEM', key: item.key })}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', margin: '4px 0' }}>
        LIFF: {liffReady ? (lineUserId ? '✅ ' + lineUserId.slice(0, 8) : '❌ no userId') : '⏳ loading'}
      </p>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <label className="checkout-label">
          <span className="checkout-label-text">📍 ที่อยู่จัดส่ง</span>
          <textarea
            name="address"
            rows={3}
            value={form.address}
            onChange={handleChange}
            placeholder="บ้านเลขที่ ซอย ถนน แขวง เขต จังหวัด"
          />
          <small>* กรุณากรอกที่อยู่ให้ครบถ้วน</small>
        </label>

        <label className="checkout-label">
          <span className="checkout-label-text">📱 เบอร์โทรศัพท์</span>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="0812345678"
          />
          <small>* กรุณากรอกเบอร์โทรศัพท์เพื่อติดต่อ</small>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="cart-submit-row">
          <p className="cart-total-label">
            รวม: <strong className="cart-total-price">฿{total.toFixed(0)} บาท</strong>
          </p>
          <button type="submit" className="btn-primary btn-confirm" disabled={submitting}>
            {submitting ? 'กำลังส่งออเดอร์...' : 'ยืนยันการสั่งอาหาร'}
          </button>
        </div>
      </form>
    </div>
  )
}
