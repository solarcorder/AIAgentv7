export const ALLOWED_ATTACHMENT_EXTENSIONS = ['.pdf', '.txt', '.md'] as const
export const ALLOWED_ATTACHMENT_MIME_TYPES = ['application/pdf', 'text/plain', 'text/markdown'] as const
export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024

export function isAllowedAttachment(file: File): boolean {
  const name = file.name.toLowerCase()
  const extOk = ALLOWED_ATTACHMENT_EXTENSIONS.some((ext) => name.endsWith(ext))
  if (extOk) return true
  return (ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type)
}

function mimeForFile(file: File): string {
  if (file.type) return file.type
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return 'application/pdf'
  if (name.endsWith('.md')) return 'text/markdown'
  return 'text/plain'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Reads a File into raw base64 (no `data:...;base64,` prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const commaIndex = result.indexOf(',')
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/** Reads a Blob (e.g. a recorded audio clip) into raw base64. */
export function blobToBase64(blob: Blob): Promise<string> {
  return fileToBase64(blob as File)
}

export interface PreparedAttachment {
  filename: string
  mimeType: string
  dataBase64: string
  sizeLabel: string
}

export async function prepareAttachment(file: File): Promise<PreparedAttachment> {
  const dataBase64 = await fileToBase64(file)
  return {
    filename: file.name,
    mimeType: mimeForFile(file),
    dataBase64,
    sizeLabel: formatBytes(file.size),
  }
}
