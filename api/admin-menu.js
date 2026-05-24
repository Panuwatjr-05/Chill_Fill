import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.headers['x-admin-pin'] !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, menu_sizes(*)')
      .order('category')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name, category, description, image_url, is_available, sizes } = req.body
    const { data: item, error } = await supabase
      .from('menu_items')
      .insert({ name, category, description, image_url, is_available: is_available ?? true })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })

    if (sizes?.length) {
      await supabase.from('menu_sizes').insert(
        sizes.map((s) => ({ menu_item_id: item.id, size: s.size, price: Number(s.price) }))
      )
    }
    return res.status(200).json(item)
  }

  if (req.method === 'PUT') {
    const { id, name, category, description, image_url, is_available, sizes } = req.body
    const { error } = await supabase
      .from('menu_items')
      .update({ name, category, description, image_url, is_available })
      .eq('id', id)
    if (error) return res.status(500).json({ error: error.message })

    if (sizes !== undefined) {
      await supabase.from('menu_sizes').delete().eq('menu_item_id', id)
      if (sizes.length) {
        await supabase.from('menu_sizes').insert(
          sizes.map((s) => ({ menu_item_id: id, size: s.size, price: Number(s.price) }))
        )
      }
    }
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    await supabase.from('menu_sizes').delete().eq('menu_item_id', id)
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
