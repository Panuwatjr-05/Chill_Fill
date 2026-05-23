export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const { lineUserId, order, items } = req.body

  if (!token || !lineUserId) {
    return res.status(200).json({ ok: false, reason: 'Missing token or lineUserId' })
  }

  const shortId = order.id.slice(0, 8).toUpperCase()

  const itemRows = (items || []).map((item) => ({
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

  const orderSummaryBubble = {
    type: 'flex',
    altText: `รายการอาหารที่สั่ง #${shortId}`,
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
              {
                type: 'text',
                text: `฿${Number(order.total).toFixed(0)} บาท`,
                size: 'sm',
                weight: 'bold',
                color: '#FF6B35',
                align: 'end',
                flex: 2,
              },
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

  const paymentBubble = {
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
              { type: 'text', text: `#${shortId}`, size: 'sm', weight: 'bold', color: '#333333', flex: 3 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ยอดรวม:', size: 'sm', color: '#888888', flex: 2 },
              {
                type: 'text',
                text: `฿${Number(order.total).toFixed(0)} บาท`,
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
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            action: { type: 'cameraRoll', label: '📸 แนบสลิปการโอนเงิน' },
            style: 'primary',
            color: '#FF6B35',
          },
          {
            type: 'text',
            text: 'กดปุ่มด้านบนเพื่อเลือกรูปสลิปจาก Gallery',
            size: 'xs',
            color: '#AAAAAA',
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
      body: JSON.stringify({ to: lineUserId, messages: [orderSummaryBubble, paymentBubble] }),
    })
    const data = await lineRes.json()
    console.log('LINE API status:', lineRes.status, JSON.stringify(data))
    res.status(200).json({ lineStatus: lineRes.status, ...data })
  } catch (e) {
    console.error('notify-customer error:', e.message)
    res.status(500).json({ error: e.message })
  }
}
