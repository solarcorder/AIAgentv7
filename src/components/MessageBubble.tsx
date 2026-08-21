import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage } from '../lib/types'

interface Props {
  message: ChatMessage
  onRetry: (id: string) => void
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function MessageBubble({ message, onRetry }: Props) {
  const isUser = message.role === 'user'
  const isError = message.status === 'error'
  const isSending = message.status === 'sending'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[86%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={[
            'rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm',
            isUser
              ? 'bg-brass text-[#241a0a] rounded-br-sm'
              : 'bg-paper text-ink rounded-bl-sm',
            isError ? 'ring-1 ring-stamp/60' : '',
            isSending ? 'opacity-70' : '',
          ].join(' ')}
        >
          {message.attachmentName && (
            <div
              className={[
                'mb-1.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-xs',
                isUser ? 'bg-black/10 text-[#241a0a]' : 'bg-black/5 text-ink-soft',
              ].join(' ')}
            >
              <span aria-hidden>📎</span>
              <span className="truncate max-w-[180px]">{message.attachmentName}</span>
            </div>
          )}

          {message.text &&
            (isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            ) : (
              <div className="md break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
              </div>
            ))}
        </div>

        <div className={`flex items-center gap-2 px-1 font-mono text-[10.5px] text-muted ${isUser ? 'flex-row-reverse' : ''}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isSending && <span>sending…</span>}
        </div>

        {isError && (
          <div className={`flex flex-col gap-1.5 px-1 ${isUser ? 'items-end' : 'items-start'}`}>
            <p className="text-xs text-stamp">{message.errorMessage ?? 'Failed to send.'}</p>
            <button
              type="button"
              onClick={() => onRetry(message.id)}
              className="min-h-[32px] rounded-md border border-stamp px-3 text-xs font-mono uppercase tracking-wide text-stamp active:scale-95 transition-transform"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
