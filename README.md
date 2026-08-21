# The Desk — AI Assistant Chat PWA

A mobile-first, installable web chat client for a personal AI assistant. It's a static
frontend — React + Vite + TypeScript + Tailwind — that talks directly to an existing
n8n backend over two webhooks. There is no server of its own.

## Features

- Chat UI with markdown-rendered assistant replies, persisted history and session id
  (both in `localStorage`), auto-scroll that backs off once you've scrolled up to read.
- Voice input via `MediaRecorder` (not the Web Speech API, for cross-browser support):
  record, transcribe, review the text, then send explicitly — never auto-sent.
- File attachments (PDF / TXT / MD, 15 MB cap) via the paperclip button or drag-and-drop
  onto the chat area, sent alongside the message text in one request.
- Installable PWA with a manifest, service worker, and app icons (`vite-plugin-pwa`).
- Mobile-first responsive layout with iOS safe-area padding and 44×44px touch targets.

## Backend contract

This app is a client for two already-live n8n webhooks — it does not implement or
proxy them:

- `POST https://myn8napp27052008.duckdns.org/webhook/assistant-inbound`
  Send a chat message (and optionally one attachment). Returns `{ "reply": string }`.
- `POST https://myn8napp27052008.duckdns.org/webhook/transcribe-audio`
  Transcribe a recorded audio clip. Returns `{ "text": string, "error"?: string }`.
  This only transcribes — it never sends the message itself.

See `src/lib/api.ts` and `src/lib/types.ts` for the exact request/response shapes.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
```

## Build

```bash
npm run build      # type-checks, then builds to dist/
npm run preview    # serve the production build locally
```

`dist/` is a static site — deploy it as-is to Vercel, Netlify, Cloudflare Pages, or
any static host. No environment variables or server config are required; the webhook
URLs above are called directly from the browser.

## Project layout

```
src/
  lib/          session id, localStorage persistence, API client, file helpers, types
  hooks/        useChat, useVoiceRecorder, useAttachment, useAutoScroll, useToast
  components/   chat header, message list/bubble, composer, attachment chip, toasts
scripts/
  icon-source.svg, icon-maskable-source.svg, generate-icons.mjs
    — regenerate public/icons/* and public/apple-touch-icon.png with
      `node scripts/generate-icons.mjs` if you change the app icon
reference/
  assistant-desk.html — the original single-file mockup this app's visual
  style ("The Desk": paper/brass/slate palette) is based on
```

## Notes

- Only PDF, TXT, and MD attachments are allowed client-side, matching what the backend
  currently supports. If a reply looks like an unsupported-file error, a toast tells
  the user rather than hard-blocking the upload.
- Requests to `/assistant-inbound` and `/transcribe-audio` are given up to 60s before
  the UI shows a timeout error with a retry button that resends the exact same payload.
- No auth — `session_id` (a `crypto.randomUUID()` persisted in `localStorage`) is the
  only identity concept, matching the backend's session-based memory.
