import { useNavigate } from 'react-router-dom'
import { STORE_CONFIG } from '../utils/storeConfig'

export default function ContactPage() {
  const navigate = useNavigate()

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <button className="contact-back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="contact-hero-content">
          <div className="contact-logo-circle">🍜</div>
          <h1 className="contact-hero-name">{STORE_CONFIG.name}</h1>
          <p className="contact-hero-sub">อิ่มได้ชิลล์ได้ทุกวัน</p>
        </div>
      </div>

      <div className="contact-body">

        <a href={`tel:${STORE_CONFIG.phone}`} className="contact-info-card contact-info-card--phone">
          <div className="contact-info-icon" style={{ background: '#fff3ee' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.36 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div className="contact-info-text">
            <span className="contact-info-label">โทรศัพท์</span>
            <span className="contact-info-value">{STORE_CONFIG.phone}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>

        <div className="contact-info-card">
          <div className="contact-info-icon" style={{ background: '#fff0f0' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="contact-info-text">
            <span className="contact-info-label">ที่อยู่ร้าน</span>
            <span className="contact-info-value contact-info-value--sm">{STORE_CONFIG.address}</span>
          </div>
        </div>

        <a href={STORE_CONFIG.mapUrl} target="_blank" rel="noreferrer" className="contact-map-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
            <line x1="9" y1="3" x2="9" y2="18"/>
            <line x1="15" y1="6" x2="15" y2="21"/>
          </svg>
          เปิดใน Google Maps
        </a>

        <div className="contact-hours-card">
          <div className="contact-hours-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            เวลาทำการ
          </div>
          {STORE_CONFIG.hours.map((h, i) => (
            <div key={i} className="contact-hours-row">
              <span>{h.days}</span>
              <span className="contact-hours-time">{h.time}</span>
            </div>
          ))}
        </div>

        <button className="btn-primary contact-order-btn" onClick={() => navigate('/')}>
          สั่งอาหารเลย
        </button>

      </div>
    </div>
  )
}
