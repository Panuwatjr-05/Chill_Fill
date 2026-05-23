import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useCart } from '../context/CartContext'

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dispatch } = useCart()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    supabase
      .from('menu_items')
      .select('*, menu_sizes(*)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error) {
          setItem(data)
          const sorted = [...data.menu_sizes].sort((a, b) =>
            ['S', 'M', 'L'].indexOf(a.size) - ['S', 'M', 'L'].indexOf(b.size)
          )
          setSelectedSize(sorted[0])
        }
        setLoading(false)
      })
  }, [id])

  function addToCart() {
    if (!selectedSize) return
    dispatch({
      type: 'ADD_ITEM',
      item: {
        menu_item_id: item.id,
        menu_item_name: item.name,
        size: selectedSize.size,
        price: selectedSize.price,
        quantity,
        note,
      },
    })
    setAdded(true)
    setTimeout(() => navigate(-1), 800)
  }

  if (loading) return <div className="loading">กำลังโหลด...</div>
  if (!item)   return <div className="error">ไม่พบเมนูนี้</div>

  const sortedSizes = [...item.menu_sizes].sort(
    (a, b) => ['S', 'M', 'L'].indexOf(a.size) - ['S', 'M', 'L'].indexOf(b.size)
  )

  return (
    <div className="detail-page">
      <button className="btn-back" onClick={() => navigate(-1)}>← กลับ</button>

      <div className="detail-image-wrap">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="detail-img" />
        ) : (
          <div className="detail-img-placeholder">🍽️</div>
        )}
      </div>

      <div className="detail-body">
        <span className="detail-category">{item.category}</span>
        <h2 className="detail-name">{item.name}</h2>
        <p className="detail-desc">{item.description}</p>

        <div className="size-section">
          <p className="section-label">เลือกขนาด</p>
          <div className="size-options">
            {sortedSizes.map((s) => (
              <button
                key={s.size}
                className={`size-btn ${selectedSize?.size === s.size ? 'active' : ''}`}
                onClick={() => setSelectedSize(s)}
              >
                <span className="size-label">{s.size}</span>
                <span className="size-price">฿{s.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="qty-section">
          <p className="section-label">จำนวน</p>
          <div className="qty-control">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>
        </div>

        <div className="note-section">
          <p className="section-label">หมายเหตุ (ไม่บังคับ)</p>
          <textarea
            className="note-input"
            rows={2}
            placeholder="เช่น ไม่ใส่ผัก, หวานน้อย..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="detail-footer">
          <span className="detail-total">
            รวม ฿{selectedSize ? (selectedSize.price * quantity).toFixed(0) : '—'}
          </span>
          <button
            className={`btn-add-cart ${added ? 'added' : ''}`}
            onClick={addToCart}
            disabled={added}
          >
            {added ? '✓ เพิ่มแล้ว' : 'เพิ่มในตะกร้า'}
          </button>
        </div>
      </div>
    </div>
  )
}
