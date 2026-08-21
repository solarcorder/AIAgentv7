interface Props {
  state: 'recording' | 'transcribing'
  elapsedSeconds: number
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function RecordingIndicator({ state, elapsedSeconds }: Props) {
  if (state === 'transcribing') {
    return (
      <div className="flex flex-1 items-center gap-2 py-1.5 font-mono text-sm text-muted">
        <span className="inline-block h-2 w-2 animate-spin rounded-full border-2 border-brass border-t-transparent" aria-hidden />
        Transcribing…
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center gap-2 py-1.5 font-mono text-sm text-paper">
      <span className="h-2.5 w-2.5 flex-none rounded-full bg-stamp [animation:var(--animate-pulse-rec)]" aria-hidden />
      Recording {formatElapsed(elapsedSeconds)}
    </div>
  )
}
