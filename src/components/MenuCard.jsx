import { useState } from 'react'
import { useCart } from '../context/CartContext'

const CATEGORY_EMOJI = {
  ข้าว: '🍚',
  ก๋วยเตี๋ยว: '🍜',
  ชา: '🧋',
  กาแฟ: '☕',
}

export default function MenuCard({ item, onDetail }) {
  const { dispatch } = useCart()
  const [flash, setFlash] = useState(false)

  function addToCart(e) {
    e.stopPropagation()
    dispatch({
      type: 'ADD_ITEM',
      item: {
        menu_item_id: item.menu_item_id,
        menu_item_name: item.name,
        size: item.size,
        price: item.price,
        quantity: 1,
        note: '',
      },
    })
    setFlash(true)
    setTimeout(() => setFlash(false), 800)
  }

  return (
    <div className="menu-card">
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
        <p className="menu-card-price">฿{item.price} บาท</p>
      </div>
      <div className="menu-card-actions">
        <button className={`btn-add-quick ${flash ? 'flash' : ''}`} onClick={addToCart}>
          {flash ? '✓ เพิ่มแล้ว' : 'เพิ่มตะกร้า'}
        </button>
        <button className="btn-detail" onClick={() => onDetail(item)}>
          ดูรายละเอียด
        </button>
      </div>
    </div>
  )
}
