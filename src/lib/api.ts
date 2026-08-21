import type {
  AssistantInboundRequest,
  AssistantInboundResponse,
  TranscribeAudioRequest,
  TranscribeAudioResponse,
} from './types'

export const ASSISTANT_INBOUND_URL = 'https://myn8napp27052008.duckdns.org/webhook/assistant-inbound'
export const TRANSCRIBE_AUDIO_URL = 'https://myn8napp27052008.duckdns.org/webhook/transcribe-audio'

const REPLY_TIMEOUT_MS = 60_000
const TRANSCRIBE_TIMEOUT_MS = 60_000

export class ApiError extends Error {
  readonly kind: 'timeout' | 'network' | 'http'
  constructor(kind: 'timeout' | 'network' | 'http', message: string) {
    super(message)
    this.kind = kind
  }
}

async function postJson<TReq, TRes>(url: string, body: TReq, timeoutMs: number): Promise<TRes> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new ApiError('http', `Server responded with ${res.status}`)
    }
    return (await res.json()) as TRes
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('timeout', 'The assistant is taking longer than expected.')
    }
    throw new ApiError('network', 'Could not reach the assistant. Check your connection.')
  } finally {
    clearTimeout(timer)
  }
}

export function sendMessage(payload: AssistantInboundRequest): Promise<AssistantInboundResponse> {
  return postJson(ASSISTANT_INBOUND_URL, payload, REPLY_TIMEOUT_MS)
}

export function transcribeAudio(payload: TranscribeAudioRequest): Promise<TranscribeAudioResponse> {
  return postJson(TRANSCRIBE_AUDIO_URL, payload, TRANSCRIBE_TIMEOUT_MS)
}
