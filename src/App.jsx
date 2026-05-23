import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ContactPage from './pages/ContactPage'
import './index.css'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </CartProvider>
  )
}
