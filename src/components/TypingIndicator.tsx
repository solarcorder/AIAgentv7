export function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label="Assistant is typing">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-paper px-4 py-3 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-paper-muted [animation:var(--animate-blink)] [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-paper-muted [animation:var(--animate-blink)] [animation-delay:180ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-paper-muted [animation:var(--animate-blink)] [animation-delay:360ms]" />
      </div>
    </div>
  )
}
