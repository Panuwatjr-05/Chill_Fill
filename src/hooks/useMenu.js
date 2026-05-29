import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export function useMenu() {
  const [flatItems, setFlatItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMenu() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, menu_sizes(*)')
        .eq('is_available', true)
        .order('category')
        .order('name')

      if (error) {
        setError(error.message)
      } else {
        const items = data.map((item) => {
          const sizes = [...item.menu_sizes].sort(
            (a, b) => ['S', 'M', 'L'].indexOf(a.size) - ['S', 'M', 'L'].indexOf(b.size)
          )
          return {
            cardKey: item.id,
            menu_item_id: item.id,
            name: item.name,
            category: item.category,
            description: item.description,
            image_url: item.image_url,
            sizes,
            price: sizes[0]?.price ?? 0,
          }
        })
        setFlatItems(items)
      }
      setLoading(false)
    }

    fetchMenu()
    window.addEventListener('focus', fetchMenu)
    return () => window.removeEventListener('focus', fetchMenu)
  }, [])

  return { flatItems, loading, error }
}
