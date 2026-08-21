import type { ChatMessage } from './types'

const HISTORY_KEY = 'desk.history'

export function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // A message stuck mid-flight from a closed tab can never resolve on reload.
    return parsed.map((m: ChatMessage) => (m.status === 'sending' ? { ...m, status: 'error', errorMessage: 'Interrupted — page was closed before a reply arrived.' } : m))
  } catch {
    return []
  }
}

export function saveHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages))
  } catch {
    // Storage full or unavailable (private browsing) — history just won't
    // survive a refresh; the live chat still works fine.
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}
