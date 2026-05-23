import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { placeOrder } from '../services/orderService'

export default function CheckoutPage() {
  const { items, total, dispatch } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({ customer_name: '', phone: '', address: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.customer_name || !form.phone || !form.address) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const { orderId } = await placeOrder(form, items)
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
    navigate('/')
    return null
  }

  return (
    <div className="checkout-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← กลับ</button>
        <h2>ยืนยันออเดอร์</h2>
      </div>

      <div className="checkout-summary">
        <h3>สรุปรายการ</h3>
        {items.map((item) => (
          <div key={item.key} className="checkout-item-row">
            <span>{item.menu_item_name} ({item.size}) x{item.quantity}</span>
            <span>฿{(item.price * item.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div className="checkout-total-row">
          <strong>ยอดรวม</strong>
          <strong>฿{total.toFixed(0)}</strong>
        </div>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <h3>ข้อมูลจัดส่ง</h3>

        <label>
          ชื่อผู้สั่ง
          <input
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            placeholder="ชื่อ-นามสกุล"
          />
        </label>

        <label>
          เบอร์โทรศัพท์
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="0812345678"
          />
        </label>

        <label>
          ที่อยู่จัดส่ง
          <textarea
            name="address"
            rows={3}
            value={form.address}
            onChange={handleChange}
            placeholder="บ้านเลขที่ ซอย ถนน แขวง เขต จังหวัด รหัสไปรษณีย์"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button
          type="submit"
          className="btn-primary btn-confirm"
          disabled={submitting}
        >
          {submitting ? 'กำลังส่งออเดอร์...' : `ยืนยันสั่งซื้อ ฿${total.toFixed(0)}`}
        </button>
      </form>
    </div>
  )
}
