import { useCallback, useRef, useState, type DragEvent } from 'react'
import { ChatHeader } from './components/ChatHeader'
import { MessageList } from './components/MessageList'
import { Composer } from './components/Composer'
import { ToastStack } from './components/ToastStack'
import { useChat } from './hooks/useChat'
import { useAttachment } from './hooks/useAttachment'
import { useAutoScroll } from './hooks/useAutoScroll'
import { useToast } from './hooks/useToast'

const ERROR_REPLY_HINTS = [
  'not supported',
  "couldn't process",
  'could not process',
  'failed to parse',
  'unsupported file',
  'unable to read',
]

function looksLikeUnsupportedFileReply(reply: string): boolean {
  const lower = reply.toLowerCase()
  return ERROR_REPLY_HINTS.some((hint) => lower.includes(hint))
}

function App() {
  const { toasts, showToast, dismiss } = useToast()

  const handleReply = useCallback(
    (reply: string) => {
      if (looksLikeUnsupportedFileReply(reply)) {
        showToast("That file type doesn't look supported yet — try a PDF, TXT, or MD.")
      }
    },
    [showToast],
  )

  const { messages, isSending, send, retry, clearAll } = useChat({ onReply: handleReply })
  const { attachment, isPreparing, addFile, clear: clearAttachment } = useAttachment(showToast)

  const listRef = useRef<HTMLDivElement>(null)
  useAutoScroll(listRef, [messages.length, isSending])

  const dragCounter = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('Files')) {
      dragCounter.current += 1
      setIsDragging(true)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    dragCounter.current = Math.max(0, dragCounter.current - 1)
    if (dragCounter.current === 0) setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) addFile(file)
  }

  const handleRetry = useCallback((id: string) => void retry(id), [retry])

  const handleSend = useCallback(
    (text: string, att?: Parameters<typeof send>[1]) => {
      void send(text, att)
    },
    [send],
  )

  return (
    <div
      className="relative flex h-dvh flex-col overflow-hidden bg-slate"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ChatHeader hasMessages={messages.length > 0} onClear={clearAll} />

      <MessageList ref={listRef} messages={messages} isSending={isSending} onRetry={handleRetry} />

      <Composer
        attachment={attachment}
        isAttachmentPreparing={isPreparing}
        onAddFile={addFile}
        onRemoveAttachment={clearAttachment}
        onSend={handleSend}
        disabled={isSending}
        onToast={showToast}
      />

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-slate/90">
          <div className="rounded-2xl border-2 border-dashed border-brass px-8 py-6 text-center">
            <p className="font-display text-lg text-paper">Drop to attach</p>
            <p className="mt-1 font-mono text-xs text-muted">PDF, TXT, or MD</p>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}

export default App
