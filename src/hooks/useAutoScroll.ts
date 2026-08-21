import { useCallback, useEffect, useRef, type RefObject } from 'react'

const NEAR_BOTTOM_THRESHOLD_PX = 80

/**
 * Keeps a scroll container pinned to the bottom as new content arrives,
 * but stops doing so once the user has scrolled up to read history —
 * so an incoming reply doesn't yank them back down.
 */
export function useAutoScroll(containerRef: RefObject<HTMLElement | null>, deps: unknown[]) {
  const isNearBottomRef = useRef(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      isNearBottomRef.current = distance < NEAR_BOTTOM_THRESHOLD_PX
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [containerRef])

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const el = containerRef.current
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior })
      isNearBottomRef.current = true
    },
    [containerRef],
  )

  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(deps.length ? 'smooth' : 'auto')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { scrollToBottom }
}
