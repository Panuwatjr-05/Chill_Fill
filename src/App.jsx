import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { LiffProvider } from './context/LiffContext'
import Navbar from './components/Navbar'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ContactPage from './pages/ContactPage'
import SlipUploadPage from './pages/SlipUploadPage'
import AdminPage from './pages/AdminPage'
import './index.css'

export default function App() {
  return (
    <LiffProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/slip-upload" element={<SlipUploadPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
        </BrowserRouter>
      </CartProvider>
    </LiffProvider>
  )
}
