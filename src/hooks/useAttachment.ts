import { useCallback, useState } from 'react'
import { MAX_ATTACHMENT_BYTES, isAllowedAttachment, prepareAttachment, type PreparedAttachment } from '../lib/file'

export function useAttachment(onToast: (message: string) => void) {
  const [attachment, setAttachment] = useState<PreparedAttachment | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)

  const addFile = useCallback(
    async (file: File) => {
      if (!isAllowedAttachment(file)) {
        onToast('Only PDF, TXT, and MD files are supported right now.')
        return
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        onToast('That file is larger than 15 MB — pick a smaller one.')
        return
      }
      setIsPreparing(true)
      try {
        const prepared = await prepareAttachment(file)
        setAttachment(prepared)
      } catch {
        onToast('Could not read that file.')
      } finally {
        setIsPreparing(false)
      }
    },
    [onToast],
  )

  const clear = useCallback(() => setAttachment(null), [])

  return { attachment, isPreparing, addFile, clear }
}
