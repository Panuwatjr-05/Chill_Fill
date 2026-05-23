export async function notifyNewOrder(order, items) {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, items }),
    })
  } catch (e) {
    console.error('Failed to send LINE notification:', e)
  }
}

export async function notifyCustomerPayment(lineUserId, order) {
  if (!lineUserId) return
  try {
    await fetch('/api/notify-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineUserId, order }),
    })
  } catch (e) {
    console.error('Failed to send customer payment notification:', e)
  }
}
