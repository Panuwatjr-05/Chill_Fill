import { useState, useEffect, useCallback } from 'react'

const CATEGORIES = ['ข้าว', 'ก๋วยเตี๋ยว', 'ชา', 'กาแฟ']
const SIZE_OPTIONS = ['S', 'M', 'L']

function emptyForm() {
  return { name: '', category: 'ข้าว', description: '', image_url: '', is_available: true, sizes: [] }
}

export default function AdminPage() {
  const [pin, setPin] = useState('')
  const [storedPin, setStoredPin] = useState(() => sessionStorage.getItem('admin_pin') || '')
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('admin_pin'))
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const authHeaders = { 'Content-Type': 'application/json', 'x-admin-pin': storedPin }

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin-menu', { headers: { 'x-admin-pin': storedPin } })
    if (res.status === 401) {
      sessionStorage.removeItem('admin_pin')
      setAuthed(false)
      setLoading(false)
      return
    }
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }, [storedPin])

  useEffect(() => { if (authed) fetchItems() }, [authed, fetchItems])

  function handleLogin(e) {
    e.preventDefault()
    sessionStorage.setItem('admin_pin', pin)
    setStoredPin(pin)
    setAuthed(true)
  }

  async function handleToggle(item) {
    await fetch('/api/admin-menu', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        image_url: item.image_url,
        is_available: !item.is_available,
      }),
    })
    fetchItems()
  }

  async function handleDelete(id) {
    if (!confirm('ลบเมนูนี้?')) return
    await fetch('/api/admin-menu', {
      method: 'DELETE',
      headers: authHeaders,
      body: JSON.stringify({ id }),
    })
    fetchItems()
  }

  async function handleSave(form) {
    setSaving(true)
    setFormError('')
    const sizes = form.sizes.filter((s) => s.price !== '' && s.price !== null)
    const method = form.id ? 'PUT' : 'POST'
    const res = await fetch('/api/admin-menu', {
      method,
      headers: authHeaders,
      body: JSON.stringify({ ...form, sizes }),
    })
    if (!res.ok) {
      const d = await res.json()
      setFormError(d.error || 'เกิดข้อผิดพลาด')
    } else {
      setModal(null)
      fetchItems()
    }
    setSaving(false)
  }

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <p className="admin-login-icon">🔐</p>
          <h2>Admin</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="รหัส PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="form-input"
              autoFocus
            />
            <button type="submit" className="btn-primary">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>จัดการเมนู</h2>
        <button className="btn-primary btn-sm" onClick={() => { setFormError(''); setModal(emptyForm()) }}>
          + เพิ่มเมนู
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">กำลังโหลด...</p>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div key={item.id} className={`admin-item${!item.is_available ? ' admin-item--off' : ''}`}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="admin-item-img" />
              ) : (
                <div className="admin-item-img admin-item-img--placeholder">🍽️</div>
              )}
              <div className="admin-item-info">
                <div className="admin-item-name">{item.name}</div>
                <div className="admin-item-meta">
                  {item.category}
                  {item.menu_sizes?.length > 0 && (
                    <> · {item.menu_sizes.map((s) => `${s.size}:฿${Number(s.price).toFixed(0)}`).join(' / ')}</>
                  )}
                </div>
              </div>
              <div className="admin-item-actions">
                <button
                  className={`btn-toggle${item.is_available ? ' btn-toggle--on' : ''}`}
                  onClick={() => handleToggle(item)}
                >
                  {item.is_available ? 'เปิด' : 'ปิด'}
                </button>
                <button
                  className="btn-icon"
                  onClick={() => {
                    setFormError('')
                    setModal({
                      id: item.id,
                      name: item.name,
                      category: item.category,
                      description: item.description || '',
                      image_url: item.image_url || '',
                      is_available: item.is_available,
                      sizes: item.menu_sizes?.map((s) => ({ size: s.size, price: String(Number(s.price).toFixed(0)) })) || [],
                    })
                  }}
                >
                  ✏️
                </button>
                <button className="btn-icon btn-icon--danger" onClick={() => handleDelete(item.id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <MenuModal
          form={modal}
          saving={saving}
          error={formError}
          onSave={handleSave}
          onClose={() => { setModal(null); setFormError('') }}
        />
      )}
    </div>
  )
}

function MenuModal({ form: initial, saving, error, onSave, onClose }) {
  const [form, setForm] = useState(initial)

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function setSizePrice(size, price) {
    setForm((f) => {
      const existing = f.sizes.find((s) => s.size === size)
      if (existing) {
        return { ...f, sizes: f.sizes.map((s) => (s.size === size ? { ...s, price } : s)) }
      }
      return { ...f, sizes: [...f.sizes, { size, price }] }
    })
  }

  function getSizePrice(size) {
    return form.sizes.find((s) => s.size === size)?.price ?? ''
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{form.id ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          <label className="form-label">ชื่อเมนู *</label>
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="เช่น ข้าวผัดกะเพรา"
          />

          <label className="form-label">หมวดหมู่</label>
          <select className="form-input" value={form.category} onChange={(e) => setField('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="form-label">คำอธิบาย</label>
          <textarea
            className="form-input form-textarea"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="รายละเอียดเมนู (ไม่บังคับ)"
          />

          <label className="form-label">URL รูปภาพ</label>
          <input
            className="form-input"
            value={form.image_url}
            onChange={(e) => setField('image_url', e.target.value)}
            placeholder="https://... (ไม่บังคับ)"
          />

          <label className="form-label">ราคาตามขนาด (ใส่เฉพาะขนาดที่มี)</label>
          <div className="admin-sizes">
            {SIZE_OPTIONS.map((size) => (
              <div key={size} className="admin-size-row">
                <span className="admin-size-label">{size}</span>
                <input
                  type="number"
                  className="form-input admin-size-input"
                  placeholder="ราคา (฿)"
                  value={getSizePrice(size)}
                  onChange={(e) => setSizePrice(size, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="admin-modal-footer">
          <button className="btn-secondary" onClick={onClose}>ยกเลิก</button>
          <button className="btn-primary" onClick={() => onSave(form)} disabled={saving || !form.name}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
