const SESSION_ID_KEY = 'desk.session_id'

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_ID_KEY, id)
  }
  return id
}

export function resetSessionId(): string {
  const id = crypto.randomUUID()
  localStorage.setItem(SESSION_ID_KEY, id)
  return id
}
