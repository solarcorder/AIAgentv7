import type { PreparedAttachment } from '../lib/file'

interface Props {
  attachment: PreparedAttachment
  isPreparing: boolean
  onRemove: () => void
}

export function AttachmentChip({ attachment, isPreparing, onRemove }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-2 px-2.5 py-1.5">
      <span aria-hidden>📎</span>
      <div className="min-w-0 leading-tight">
        <p className="truncate max-w-[160px] font-mono text-xs text-paper">{attachment.filename}</p>
        <p className="font-mono text-[10px] text-muted">{isPreparing ? 'reading…' : attachment.sizeLabel}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove attachment"
        className="ml-1 flex h-6 w-6 flex-none items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-paper"
      >
        ×
      </button>
    </div>
  )
}
