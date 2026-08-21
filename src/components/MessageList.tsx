import { forwardRef } from 'react'
import type { ChatMessage } from '../lib/types'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface Props {
  messages: ChatMessage[]
  isSending: boolean
  onRetry: (id: string) => void
}

export const MessageList = forwardRef<HTMLDivElement, Props>(function MessageList({ messages, isSending, onRetry }, ref) {
  const showTyping = isSending && messages.at(-1)?.status !== 'error'

  return (
    <div ref={ref} className="scroll-thin flex-1 overflow-y-auto px-3 py-4 sm:px-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        {messages.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="mx-auto max-w-xs font-display text-[15px] italic leading-relaxed text-muted">
              Nothing here yet. Say what you need, attach a file, or tap the mic to speak.
            </p>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} onRetry={onRetry} />)
        )}
        {showTyping && <TypingIndicator />}
      </div>
    </div>
  )
})
