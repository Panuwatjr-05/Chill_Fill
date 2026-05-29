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
        const flat = data.flatMap((item) =>
          [...item.menu_sizes]
            .sort((a, b) => ['S', 'M', 'L'].indexOf(a.size) - ['S', 'M', 'L'].indexOf(b.size))
            .map((s) => ({
              cardKey: `${item.id}-${s.size}`,
              menu_item_id: item.id,
              name: item.name,
              size: s.size,
              price: s.price,
              category: item.category,
              description: item.description,
              image_url: item.image_url,
            }))
        )
        setFlatItems(flat)
      }
      setLoading(false)
    }

    fetchMenu()
    window.addEventListener('focus', fetchMenu)
    return () => window.removeEventListener('focus', fetchMenu)
  }, [])

  return { flatItems, loading, error }
}
