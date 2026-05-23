export default function CategoryTabs({ categories, active, onSelect }) {
  return (
    <div className="category-tabs">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`category-tab ${active === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
