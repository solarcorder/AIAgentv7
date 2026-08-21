import { useCallback, useRef, useState } from 'react'

export interface Toast {
  id: string
  message: string
}

const TOAST_DURATION_MS = 4500

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, number>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message: string) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message }])
      const timer = window.setTimeout(() => dismiss(id), TOAST_DURATION_MS)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  return { toasts, showToast, dismiss }
}
