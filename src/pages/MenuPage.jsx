import { useState, useMemo } from 'react'
import { useMenu } from '../hooks/useMenu'
import MenuCard from '../components/MenuCard'
import CategoryTabs from '../components/CategoryTabs'
import SearchBar from '../components/SearchBar'
import ItemDetailModal from '../components/ItemDetailModal'

const CATEGORIES = ['ทั้งหมด', 'ข้าว', 'ก๋วยเตี๋ยว', 'ชา', 'กาแฟ']

export default function MenuPage() {
  const { flatItems, loading, error } = useMenu()
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด')
  const [query, setQuery] = useState('')
  const [modalItem, setModalItem] = useState(null)

  const filtered = useMemo(() => {
    return flatItems.filter((item) => {
      const matchCat = activeCategory === 'ทั้งหมด' || item.category === activeCategory
      const matchSearch = item.name.toLowerCase().includes(query.toLowerCase())
      return matchCat && matchSearch
    })
  }, [flatItems, activeCategory, query])

  if (loading) return <div className="loading">กำลังโหลดเมนู...</div>
  if (error) return <div className="error">เกิดข้อผิดพลาด: {error}</div>

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1 className="brand">CHILL FILL</h1>
        <p className="brand-sub">อิ่มได้ชิลล์ได้ทุกวัน</p>
      </div>

      <SearchBar value={query} onChange={setQuery} />
      <CategoryTabs
        categories={CATEGORIES}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      {filtered.length === 0 ? (
        <p className="empty">ไม่พบเมนูที่ค้นหา</p>
      ) : (
        <div className="menu-grid">
          {filtered.map((item) => (
            <MenuCard key={item.cardKey} item={item} onDetail={setModalItem} />
          ))}
        </div>
      )}

      {modalItem && (
        <ItemDetailModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
    </div>
  )
}
