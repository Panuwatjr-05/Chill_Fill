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
