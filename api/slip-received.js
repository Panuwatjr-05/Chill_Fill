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

  const customerUserId = lineUserId || order.line_user_id

  await supabase
    .from('orders')
    .update({ status: 'slip_received', slip_url: slipUrl, line_user_id: customerUserId })
    .eq('id', orderId)

  const shortId = orderId.slice(0, 8).toUpperCase()

  if (customerUserId) {
    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: customerUserId,
        messages: [
          { type: 'image', originalContentUrl: slipUrl, previewImageUrl: slipUrl },
          {
            type: 'flex',
            altText: `📸 ได้รับสลิปออเดอร์ #${shortId} แล้ว`,
            contents: {
              type: 'bubble',
              styles: { header: { backgroundColor: '#E3F2FD' } },
              header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  { type: 'text', text: '📸 ได้รับสลิปแล้ว', weight: 'bold', size: 'md', color: '#1565C0' },
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
                  { type: 'separator', margin: 'md' },
                  { type: 'text', text: '⏳ กำลังตรวจสอบการชำระเงิน รอสักครู่นะครับ', size: 'sm', color: '#555555', wrap: true, margin: 'md' },
                ],
              },
              footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'button',
                    action: {
                      type: 'uri',
                      label: '✅ ยืนยันชำระเงิน (เจ้าของร้าน)',
                      uri: `https://chill-fill.vercel.app/quick-confirm?orderId=${orderId}`,
                    },
                    style: 'primary',
                    color: '#2E7D32',
                  },
                ],
              },
            },
          },
        ],
      }),
    })
  }

  res.status(200).json({ ok: true })
}
