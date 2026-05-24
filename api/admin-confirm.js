import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (req.headers['x-admin-pin'] !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { orderId } = req.body
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' })

  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
  if (!order) return res.status(404).json({ error: 'Order not found' })

  await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId)

  const shortId = orderId.slice(0, 8).toUpperCase()

  if (order.line_user_id) {
    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: order.line_user_id,
        messages: [
          {
            type: 'flex',
            altText: `✅ ยืนยันการชำระเงิน ออเดอร์ #${shortId}`,
            contents: {
              type: 'bubble',
              styles: { header: { backgroundColor: '#E8F5E9' } },
              header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  { type: 'text', text: '✅ ยืนยันการชำระเงินแล้ว', weight: 'bold', size: 'md', color: '#2E7D32' },
                ],
              },
              body: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: `ออเดอร์ #${shortId} ได้รับการยืนยันแล้ว`, size: 'sm', color: '#555555', wrap: true },
                  { type: 'text', text: '🛵 กำลังเตรียมอาหาร รอรับได้เลยครับ', size: 'sm', color: '#555555', margin: 'sm' },
                ],
              },
            },
          },
        ],
      }),
    })
  }

  return res.status(200).json({ ok: true })
}
