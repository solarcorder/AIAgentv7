interface Props {
  onClear: () => void
  hasMessages: boolean
}

export function ChatHeader({ onClear, hasMessages }: Props) {
  return (
    <header className="pt-safe pl-safe pr-safe flex-none border-b border-white/10 bg-slate-2">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass text-sm font-semibold text-[#241a0a]" aria-hidden>
            🗨
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold leading-none text-paper">The Desk</h1>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">Personal Assistant</p>
          </div>
        </div>

        {hasMessages && (
          <button
            type="button"
            onClick={onClear}
            className="min-h-[44px] min-w-[44px] rounded-md px-3 font-mono text-xs uppercase tracking-wide text-muted transition-colors hover:text-paper active:scale-95"
            aria-label="Clear conversation"
          >
            Clear
          </button>
        )}
      </div>
    </header>
  )
}
