import { supabase } from './supabase'
import { notifyNewOrder, notifyCustomerPayment } from './line'

export async function placeOrder({ address, phone }, cartItems, lineUserId = null) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ customer_name: '', address, phone, total })
    .select()
    .single()

  if (orderError) throw orderError

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    size: item.size,
    quantity: item.quantity,
    price: item.price,
    note: item.note || null,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) throw itemsError

  notifyNewOrder(order, cartItems)
  notifyCustomerPayment(lineUserId, order)

  return { orderId: order.id }
}
