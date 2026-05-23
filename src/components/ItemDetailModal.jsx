import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

const CATEGORY_EMOJI = {
  ข้าว: '🍚',
  ก๋วยเตี๋ยว: '🍜',
  ชา: '🧋',
  กาแฟ: '☕',
}

export default function ItemDetailModal({ item, onClose }) {
  const { dispatch } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  function addToCart() {
    dispatch({
      type: 'ADD_ITEM',
      item: {
        menu_item_id: item.menu_item_id,
        menu_item_name: item.name,
        size: item.size,
        price: item.price,
        quantity,
        note,
      },
    })
    setAdded(true)
    setTimeout(onClose, 700)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            {item.name} <span className="modal-size-badge">{item.size}</span>
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-img-wrap">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="modal-img" />
          ) : (
            <div className="modal-img-placeholder">
              {CATEGORY_EMOJI[item.category] ?? '🍽️'}
            </div>
          )}
        </div>

        <div className="modal-body">
          <p className="modal-category">{item.category}</p>
          <p className="modal-price">฿{item.price} บาท</p>
          {item.description && <p className="modal-desc">{item.description}</p>}

          <p className="section-label">จำนวน</p>
          <div className="qty-control">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>

          <p className="section-label">หมายเหตุเพิ่มเติม</p>
          <textarea
            className="note-input"
            rows={2}
            placeholder="ระบุความต้องการเพิ่มเติม เช่น ไม่ใส่ผักชี, เพิ่มน้ำจิ้ม..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            className={`btn-add-cart-modal ${added ? 'added' : ''}`}
            onClick={addToCart}
            disabled={added}
          >
            {added
              ? '✓ เพิ่มลงตะกร้าแล้ว!'
              : `เพิ่มตะกร้า — ฿${(item.price * quantity).toFixed(0)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
