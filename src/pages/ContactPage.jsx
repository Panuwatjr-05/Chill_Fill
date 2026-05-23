import { useNavigate } from 'react-router-dom'
import { STORE_CONFIG } from '../utils/storeConfig'

export default function ContactPage() {
  const navigate = useNavigate()

  return (
    <div className="contact-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← กลับ
        </button>
        <h2>ติดต่อเรา</h2>
        <span style={{ width: 40 }} />
      </div>

      <div className="contact-body">
        <h3 className="contact-brand">{STORE_CONFIG.name}</h3>

        <section className="contact-section">
          <p className="contact-section-title">📞 เบอร์โทรติดต่อ</p>
          <a href={`tel:${STORE_CONFIG.phone}`} className="contact-card contact-phone-card">
            <span className="contact-icon-circle">📞</span>
            <div>
              <p className="contact-card-primary">{STORE_CONFIG.phone}</p>
              <p className="contact-card-sub">แตะเพื่อโทร</p>
            </div>
          </a>
        </section>

        <section className="contact-section">
          <p className="contact-section-title">📍 ที่อยู่ร้าน</p>
          <div className="contact-card">
            <p className="contact-card-primary">{STORE_CONFIG.address}</p>
          </div>
          <a
            href={STORE_CONFIG.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary btn-map"
          >
            🗺️ เปิดแผนที่ Google Maps
          </a>
        </section>

        <section className="contact-section">
          <p className="contact-section-title">🕐 เวลาทำการ</p>
          <div className="contact-card">
            {STORE_CONFIG.hours.map((h, i) => (
              <div key={i} className="hours-row">
                <span>{h.days}</span>
                <span>{h.time}</span>
              </div>
            ))}
          </div>
        </section>

        <button className="btn-primary btn-back-to-menu" onClick={() => navigate('/')}>
          🍽️ กลับไปสั่งอาหาร
        </button>
      </div>
    </div>
  )
}
