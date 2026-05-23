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
    .update({ status: 'slip_received', slip_url: slipUrl })
    .eq('id', orderId)

  const shortId = orderId.slice(0, 8).toUpperCase()
  const customerUserId = lineUserId || order.line_user_id

  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: process.env.LINE_USER_ID,
      messages: [
        { type: 'image', originalContentUrl: slipUrl, previewImageUrl: slipUrl },
        {
          type: 'flex',
          altText: `💳 ลูกค้าส่งสลิป ออเดอร์ #${shortId}`,
          contents: {
            type: 'bubble',
            styles: { header: { backgroundColor: '#E3F2FD' } },
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                { type: 'text', text: '💳 ลูกค้าส่งสลิปมาแล้ว', weight: 'bold', size: 'md', color: '#1565C0' },
              ],
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    { type: 'text', text: 'ออเดอร์:', size: 'sm', color: '#888888', flex: 2 },
                    { type: 'text', text: `#${shortId}`, size: 'sm', weight: 'bold', color: '#333333', flex: 3 },
                  ],
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    { type: 'text', text: 'ยอด:', size: 'sm', color: '#888888', flex: 2 },
                    { type: 'text', text: `฿${Number(order.total).toFixed(0)} บาท`, size: 'sm', weight: 'bold', color: '#FF6B35', flex: 3 },
                  ],
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    { type: 'text', text: 'ที่อยู่:', size: 'sm', color: '#888888', flex: 2 },
                    { type: 'text', text: order.address, size: 'sm', color: '#333333', flex: 3, wrap: true },
                  ],
                },
              ],
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  action: {
                    type: 'postback',
                    label: '✅ ยืนยันชำระเงินแล้ว',
                    data: `action=confirm&orderId=${orderId}&userId=${customerUserId}`,
                  },
                  style: 'primary',
                  color: '#FF6B35',
                },
              ],
            },
          },
        },
      ],
    }),
  })

  res.status(200).json({ ok: true })
}
