import { useState } from 'react'
import { useCart } from '../context/CartContext'

const CATEGORY_EMOJI = {
  ข้าว: '🍚',
  ก๋วยเตี๋ยว: '🍜',
  ชา: '🧋',
  กาแฟ: '☕',
}

export default function MenuCard({ item, onDetail }) {
  const minPrice = item.sizes?.[0]?.price ?? item.price
  const hasMultipleSizes = item.sizes?.length > 1
  const priceLabel = hasMultipleSizes ? `เริ่ม ฿${minPrice}` : `฿${minPrice}`

  return (
    <div className="menu-card" onClick={() => onDetail(item)}>
      <div className="menu-card-img">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} />
        ) : (
          <span className="menu-card-emoji">{CATEGORY_EMOJI[item.category] ?? '🍽️'}</span>
        )}
      </div>
      <div className="menu-card-body">
        <p className="menu-card-category">{item.category}</p>
        <h3 className="menu-card-name">{item.name}</h3>
        <p className="menu-card-price">{priceLabel} บาท</p>
      </div>
      <div className="menu-card-actions">
        <button className="btn-add-quick" onClick={(e) => { e.stopPropagation(); onDetail(item) }}>
          เพิ่มตะกร้า
        </button>
        <button className="btn-detail" onClick={(e) => { e.stopPropagation(); onDetail(item) }}>
          ดูรายละเอียด
        </button>
      </div>
    </div>
  )
}
