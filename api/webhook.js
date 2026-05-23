import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: {
      verify(req, res, buf) {
        req.rawBody = buf
      },
    },
  },
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

function verifySignature(rawBody, signature, secret) {
  const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
  return hash === signature
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const signature = req.headers['x-line-signature']
  if (!verifySignature(req.rawBody, signature, process.env.LINE_CHANNEL_SECRET)) {
    return res.status(403).json({ error: 'Invalid signature' })
  }

  const events = req.body.events || []
  await Promise.all(events.map(handleEvent))
  res.status(200).json({ ok: true })
}

async function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'image') {
    await handleSlipImage(event)
  } else if (event.type === 'postback') {
    await handlePostback(event)
  }
}

async function handleSlipImage(event) {
  const lineUserId = event.source.userId
  const messageId = event.message.id
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('line_user_id', lineUserId)
    .in('status', ['pending', 'slip_received'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!order) {
    await pushMessage(lineUserId, [
      { type: 'text', text: 'ไม่พบออเดอร์ที่รอชำระเงิน กรุณาสั่งอาหารก่อนส่งสลิปครับ 🙏' },
    ])
    return
  }

  const imageRes = await fetch(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const imageBuffer = Buffer.from(await imageRes.arrayBuffer())

  const fileName = `${order.id}_${Date.now()}.jpg`
  const { error: uploadError } = await supabase.storage
    .from('slips')
    .upload(fileName, imageBuffer, { contentType: 'image/jpeg', upsert: true })

  if (uploadError) {
    console.error('Storage upload error:', JSON.stringify(uploadError))
    await pushMessage(lineUserId, [
      { type: 'text', text: 'เกิดข้อผิดพลาดในการรับสลิป กรุณาลองใหม่อีกครั้งครับ' },
    ])
    return
  }

  const slipUrl = `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/slips/${fileName}`

  await supabase
    .from('orders')
    .update({ status: 'slip_received', slip_url: slipUrl })
    .eq('id', order.id)

  const shortId = order.id.slice(0, 8).toUpperCase()

  await pushMessage(process.env.LINE_USER_ID, [
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
                data: `action=confirm&orderId=${order.id}&userId=${lineUserId}`,
              },
              style: 'primary',
              color: '#FF6B35',
            },
          ],
        },
      },
    },
  ])
}

async function handlePostback(event) {
  const params = new URLSearchParams(event.postback.data)
  if (params.get('action') !== 'confirm') return

  const orderId = params.get('orderId')
  const customerUserId = params.get('userId')
  const shortId = orderId.slice(0, 8).toUpperCase()

  await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId)

  await pushMessage(customerUserId, [
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
  ])

  await replyMessage(event.replyToken, [
    { type: 'text', text: `✅ ยืนยันออเดอร์ #${shortId} เรียบร้อยแล้ว` },
  ])
}

async function pushMessage(to, messages) {
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages }),
  })
}

async function replyMessage(replyToken, messages) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  })
}
