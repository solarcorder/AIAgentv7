import type { Toast } from '../hooks/useToast'

interface Props {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastStack({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className="pb-safe pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-24">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onDismiss(t.id)}
          className="pointer-events-auto max-w-sm rounded-lg border border-white/10 bg-slate-3 px-4 py-2.5 text-left text-sm text-paper shadow-lg"
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
