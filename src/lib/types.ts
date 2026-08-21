export interface Attachment {
  filename: string
  mimeType: string
  dataBase64: string
  /** Human-readable size for the UI chip, e.g. "128 KB". */
  sizeLabel: string
}

export type MessageStatus = 'sending' | 'sent' | 'error'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: number
  status: MessageStatus
  /** Filename shown on a user message that carried an attachment. */
  attachmentName?: string
  /** Set when status is 'error', so the composer can offer a retry. */
  errorMessage?: string
}

export interface AssistantInboundRequest {
  session_id: string
  text: string
  attachment?: {
    filename: string
    mime_type: string
    data_base64: string
  }
}

export interface AssistantInboundResponse {
  reply: string
}

export interface TranscribeAudioRequest {
  audio_base64: string
  mime_type: string
}

export interface TranscribeAudioResponse {
  text: string
  error?: string
}
