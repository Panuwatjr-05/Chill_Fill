import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { orderId, lineUserId, slipUrl } = req.body
  if (!orderId || !slipUrl) return res.status(400).json({ error: 'Missing fields' })

  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
  if (!order) return res.status(404).json({ error: 'Order not found' })

  await supabase
    .from('orders')
    .update({ status: 'slip_received', slip_url: slipUrl, line_user_id: lineUserId || order.line_user_id })
    .eq('id', orderId)

  res.status(200).json({ ok: true })
}
