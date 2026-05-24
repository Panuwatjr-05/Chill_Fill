import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { count } = useCart()
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={() => navigate('/')}>
        CHILL FILL
      </span>
      <div className="navbar-actions">
        <button className="navbar-icon" onClick={() => navigate('/admin')} title="Admin">
          ⚙️
        </button>
        <button className="navbar-icon" onClick={() => navigate('/contact')} title="ติดต่อร้าน">
          📞
        </button>
        <button className="navbar-icon navbar-cart-btn" onClick={() => navigate('/cart')}>
          🛒
          {count > 0 && <span className="cart-badge">{count}</span>}
        </button>
      </div>
    </nav>
  )
}
