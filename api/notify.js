export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const userId = process.env.LINE_USER_ID

  if (!token || !userId) {
    return res.status(200).json({ ok: false, reason: 'LINE not configured' })
  }

  const { order, items } = req.body
  const shortId = order.id.slice(0, 8).toUpperCase()

  const itemRows = items.map((item) => ({
    type: 'box',
    layout: 'horizontal',
    contents: [
      {
        type: 'text',
        text: `${item.menu_item_name} (${item.size}) x${item.quantity}`,
        size: 'sm',
        color: '#555555',
        flex: 4,
        wrap: true,
      },
      {
        type: 'text',
        text: `฿${(item.price * item.quantity).toFixed(0)}`,
        size: 'sm',
        color: '#111111',
        align: 'end',
        flex: 2,
      },
    ],
  }))

  const flexMessage = {
    type: 'flex',
    altText: `🛵 ออเดอร์ใหม่ #${shortId} — ฿${Number(order.total).toFixed(0)}`,
    contents: {
      type: 'bubble',
      styles: {
        header: { backgroundColor: '#FFF0EA' },
        footer: { backgroundColor: '#F8F8F8' },
      },
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: '🍽️ รายการอาหารที่สั่ง', weight: 'bold', size: 'lg', color: '#FF6B35' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          ...itemRows,
          { type: 'separator', margin: 'md' },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: '💰 ยอดรวมทั้งหมด', size: 'sm', weight: 'bold', flex: 3 },
              { type: 'text', text: `฿${Number(order.total).toFixed(0)} บาท`, size: 'sm', weight: 'bold', color: '#FF6B35', align: 'end', flex: 2 },
            ],
          },
          { type: 'separator', margin: 'md' },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            spacing: 'xs',
            contents: [
              { type: 'text', text: '📍 ที่อยู่จัดส่ง', size: 'xs', color: '#888888', weight: 'bold' },
              { type: 'text', text: order.address, size: 'sm', wrap: true, color: '#333333' },
              { type: 'text', text: `📞 ${order.phone}`, size: 'sm', color: '#333333', margin: 'sm' },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: `หมายเลขออเดอร์: #${shortId}`, size: 'xs', color: '#AAAAAA', align: 'center' },
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
      body: JSON.stringify({ to: userId, messages: [flexMessage] }),
    })
    const data = await lineRes.json()
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
