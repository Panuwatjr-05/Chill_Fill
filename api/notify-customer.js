export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const { lineUserId, order } = req.body

  if (!token || !lineUserId) {
    return res.status(200).json({ ok: false, reason: 'Missing token or lineUserId' })
  }

  const shortId = order.id.slice(0, 8).toUpperCase()

  const flexMessage = {
    type: 'flex',
    altText: `กรุณาชำระเงิน ฿${Number(order.total).toFixed(0)} ออเดอร์ #${shortId}`,
    contents: {
      type: 'bubble',
      styles: {
        header: { backgroundColor: '#FFF9E6' },
        footer: { backgroundColor: '#FFFDF5' },
      },
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⏰ กรุณาชำระเงินเพื่อยืนยันคำสั่งซื้อ',
            weight: 'bold',
            size: 'md',
            color: '#E08A00',
            wrap: true,
          },
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
              { type: 'text', text: 'เลขที่ออเดอร์:', size: 'sm', color: '#888888', flex: 2 },
              { type: 'text', text: `#${shortId}`, size: 'sm', weight: 'bold', color: '#333', flex: 3 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ยอดรวม:', size: 'sm', color: '#888888', flex: 2 },
              {
                type: 'text',
                text: `${Number(order.total).toFixed(0)} บาท`,
                size: 'sm',
                weight: 'bold',
                color: '#FF6B35',
                flex: 3,
              },
            ],
          },
          { type: 'separator', margin: 'md' },
          {
            type: 'text',
            text: '🏦 ช่องทางการชำระเงิน',
            weight: 'bold',
            size: 'sm',
            margin: 'md',
            color: '#333333',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'sm',
            spacing: 'xs',
            contents: [
              { type: 'text', text: 'ธนาคารกรุงไทย', size: 'sm', color: '#333333' },
              { type: 'text', text: 'เลขบัญชี: 6-3080-03-9', size: 'sm', color: '#333333' },
              { type: 'text', text: 'ชื่อบัญชี: ภานุวัฒน์ ลาพรมมา', size: 'sm', color: '#333333' },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⚠️ เมื่อโอนเงินแล้ว กรุณาแนบสลิปกลับมานะครับ',
            size: 'xs',
            color: '#888888',
            wrap: true,
            align: 'center',
          },
        ],
      },
    },
  }

  try {
    const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to: lineUserId, messages: [flexMessage] }),
    })
    const data = await lineRes.json()
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
