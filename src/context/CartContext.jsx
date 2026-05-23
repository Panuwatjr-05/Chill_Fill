import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const key = `${action.item.menu_item_id}-${action.item.size}`
      const existing = state.find((i) => i.key === key)
      if (existing) {
        return state.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + action.item.quantity } : i
        )
      }
      return [...state, { ...action.item, key }]
    }
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        return state.filter((i) => i.key !== action.key)
      }
      return state.map((i) =>
        i.key === action.key ? { ...i, quantity: action.quantity } : i
      )
    }
    case 'REMOVE_ITEM':
      return state.filter((i) => i.key !== action.key)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, total, count, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
