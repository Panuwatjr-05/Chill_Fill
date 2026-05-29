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
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] ?? null)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function addToCart() {
    if (!selectedSize) return
    dispatch({
      type: 'ADD_ITEM',
      item: {
        menu_item_id: item.menu_item_id,
        menu_item_name: item.name,
        size: selectedSize.size,
        price: selectedSize.price,
        quantity,
        note,
      },
    })
    setAdded(true)
    setTimeout(onClose, 700)
  }

  const total = (selectedSize?.price ?? 0) * quantity

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{item.name}</span>
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
          {item.description && <p className="modal-desc">{item.description}</p>}

          {item.sizes?.length > 0 && (
            <>
              <p className="section-label">เลือกขนาด</p>
              <div className="size-selector">
                {item.sizes.map((s) => (
                  <button
                    key={s.size}
                    className={`size-btn ${selectedSize?.size === s.size ? 'size-btn--active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    <span className="size-btn-label">{s.size}</span>
                    <span className="size-btn-price">฿{Number(s.price).toFixed(0)}</span>
                  </button>
                ))}
              </div>
            </>
          )}

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
            placeholder="เช่น ไม่ใส่ผักชี, เพิ่มน้ำจิ้ม..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            className={`btn-add-cart-modal ${added ? 'added' : ''}`}
            onClick={addToCart}
            disabled={added || !selectedSize}
          >
            {added ? '✓ เพิ่มลงตะกร้าแล้ว!' : `เพิ่มตะกร้า — ฿${total.toFixed(0)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
