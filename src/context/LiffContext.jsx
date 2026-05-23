import { createContext, useContext, useEffect, useState } from 'react'
import liff from '@line/liff'

const LIFF_ID = '2010175611-NW7mjoIg'

const LiffContext = createContext({ lineUserId: null, liffReady: false })

export function LiffProvider({ children }) {
  const [lineUserId, setLineUserId] = useState(null)
  const [liffReady, setLiffReady] = useState(false)

  useEffect(() => {
    liff
      .init({ liffId: LIFF_ID })
      .then(() => {
        if (liff.isLoggedIn()) {
          return liff.getProfile()
        }
        return null
      })
      .then((profile) => {
        if (profile?.userId) setLineUserId(profile.userId)
      })
      .catch((err) => console.warn('LIFF init:', err))
      .finally(() => setLiffReady(true))
  }, [])

  return (
    <LiffContext.Provider value={{ lineUserId, liffReady }}>
      {children}
    </LiffContext.Provider>
  )
}

export function useLiff() {
  return useContext(LiffContext)
}
