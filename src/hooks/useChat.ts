import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, sendMessage } from '../lib/api'
import { getSessionId } from '../lib/session'
import { loadHistory, saveHistory } from '../lib/storage'
import type { AssistantInboundRequest, ChatMessage } from '../lib/types'
import type { PreparedAttachment } from '../lib/file'

function friendlyErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.kind === 'timeout') return 'The assistant took too long to reply. Tap retry to try again.'
    if (err.kind === 'network') return "Couldn't reach the assistant — check your connection and retry."
    return 'The assistant ran into a problem. Tap retry to try again.'
  }
  return 'Something went wrong. Tap retry to try again.'
}

interface UseChatOptions {
  onReply?: (reply: string) => void
}

export function useChat({ onReply }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory())
  const [isSending, setIsSending] = useState(false)
  const pendingPayloads = useRef<Map<string, AssistantInboundRequest>>(new Map())

  useEffect(() => {
    saveHistory(messages)
  }, [messages])

  const runRequest = useCallback(async (messageId: string, payload: AssistantInboundRequest) => {
    setIsSending(true)
    try {
      const res = await sendMessage(payload)
      setMessages((prev) => [
        ...prev.map((m) => (m.id === messageId ? { ...m, status: 'sent' as const, errorMessage: undefined } : m)),
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: res.reply,
          createdAt: Date.now(),
          status: 'sent',
        },
      ])
      pendingPayloads.current.delete(messageId)
      onReply?.(res.reply)
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: 'error' as const, errorMessage: friendlyErrorMessage(err) } : m)),
      )
    } finally {
      setIsSending(false)
    }
  }, [onReply])

  const send = useCallback(
    async (text: string, attachment?: PreparedAttachment) => {
      const id = crypto.randomUUID()
      const payload: AssistantInboundRequest = {
        session_id: getSessionId(),
        text,
        ...(attachment
          ? {
              attachment: {
                filename: attachment.filename,
                mime_type: attachment.mimeType,
                data_base64: attachment.dataBase64,
              },
            }
          : {}),
      }
      const userMsg: ChatMessage = {
        id,
        role: 'user',
        text,
        createdAt: Date.now(),
        status: 'sending',
        attachmentName: attachment?.filename,
      }
      pendingPayloads.current.set(id, payload)
      setMessages((prev) => [...prev, userMsg])
      await runRequest(id, payload)
    },
    [runRequest],
  )

  const retry = useCallback(
    async (messageId: string) => {
      const payload = pendingPayloads.current.get(messageId)
      if (!payload) return
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status: 'sending' as const, errorMessage: undefined } : m)))
      await runRequest(messageId, payload)
    },
    [runRequest],
  )

  const clearAll = useCallback(() => {
    pendingPayloads.current.clear()
    setMessages([])
  }, [])

  return { messages, isSending, send, retry, clearAll }
}
