import { useParams, useNavigate } from 'react-router-dom'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const shortId = id?.slice(0, 8).toUpperCase()

  return (
    <div className="success-page">
      <div className="success-icon">✅</div>
      <h2>สั่งซื้อสำเร็จ!</h2>
      <p className="success-order-id">หมายเลขออเดอร์ #{shortId}</p>
      <p className="success-msg">
        ร้านได้รับออเดอร์แล้ว กรุณารอสักครู่ เราจะรีบจัดส่งให้เร็วที่สุด 🚀
      </p>
      <button className="btn-primary" onClick={() => navigate('/')}>
        สั่งอาหารต่อ
      </button>
    </div>
  )
}
