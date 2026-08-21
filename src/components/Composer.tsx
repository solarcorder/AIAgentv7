import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import type { PreparedAttachment } from '../lib/file'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { AttachmentChip } from './AttachmentChip'
import { RecordingIndicator } from './RecordingIndicator'

interface Props {
  attachment: PreparedAttachment | null
  isAttachmentPreparing: boolean
  onAddFile: (file: File) => void
  onRemoveAttachment: () => void
  onSend: (text: string, attachment?: PreparedAttachment) => void
  disabled: boolean
  onToast: (message: string) => void
}

const MAX_TEXTAREA_HEIGHT = 160

export function Composer({ attachment, isAttachmentPreparing, onAddFile, onRemoveAttachment, onSend, disabled, onToast }: Props) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const recorder = useVoiceRecorder({
    onTranscribed: (transcribed) => setText((prev) => (prev.trim() ? `${prev.trim()} ${transcribed}` : transcribed)),
    onError: onToast,
  })

  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }

  useEffect(resizeTextarea, [text])

  const canSend = !disabled && !isAttachmentPreparing && recorder.state === 'idle' && (text.trim().length > 0 || !!attachment)

  const handleSend = () => {
    if (!canSend) return
    onSend(text.trim(), attachment ?? undefined)
    setText('')
    onRemoveAttachment()
    requestAnimationFrame(resizeTextarea)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onAddFile(file)
    e.target.value = ''
  }

  const isRecordingOrTranscribing = recorder.state !== 'idle'

  return (
    <div className="pb-safe pl-safe pr-safe flex-none border-t border-white/10 bg-slate-2">
      <div className="mx-auto max-w-2xl px-3 py-2.5 sm:px-6">
        {attachment && (
          <div className="mb-2">
            <AttachmentChip attachment={attachment} isPreparing={isAttachmentPreparing} onRemove={onRemoveAttachment} />
          </div>
        )}

        <div className="flex items-end gap-1.5 rounded-2xl border border-white/10 bg-slate-3 px-2 py-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isRecordingOrTranscribing}
            aria-label="Attach a file"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-lg text-muted transition-colors hover:bg-white/5 hover:text-paper disabled:opacity-40 active:scale-95"
          >
            📎
          </button>

          {recorder.state === 'recording' || recorder.state === 'transcribing' ? (
            <RecordingIndicator state={recorder.state} elapsedSeconds={recorder.elapsedSeconds} />
          ) : (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write to the desk…"
              rows={1}
              disabled={disabled}
              aria-label="Message"
              className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed text-paper placeholder:text-muted focus:outline-none"
            />
          )}

          {recorder.isSupported && (
            <button
              type="button"
              onClick={() => (recorder.state === 'recording' ? recorder.stop() : recorder.start())}
              disabled={disabled || recorder.state === 'transcribing'}
              aria-label={recorder.state === 'recording' ? 'Stop recording' : 'Record a voice message'}
              className={[
                'flex h-11 w-11 flex-none items-center justify-center rounded-full text-lg transition-colors active:scale-95',
                recorder.state === 'recording' ? 'bg-stamp text-white' : 'text-muted hover:bg-white/5 hover:text-paper',
                'disabled:opacity-40',
              ].join(' ')}
            >
              {recorder.state === 'recording' ? '■' : '🎙'}
            </button>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className="flex h-11 min-w-[44px] flex-none items-center justify-center rounded-full bg-brass px-4 font-mono text-xs font-semibold uppercase tracking-wide text-[#241a0a] transition-transform active:scale-95 disabled:bg-slate disabled:text-muted"
          >
            Send
          </button>
        </div>

        <p className="mt-1.5 text-center font-mono text-[10px] text-muted">Enter to send · Shift+Enter for a new line</p>
      </div>
    </div>
  )
}
