import { useCallback, useEffect, useRef, useState } from 'react'
import { transcribeAudio } from '../lib/api'
import { blobToBase64 } from '../lib/file'

export type RecorderState = 'idle' | 'recording' | 'transcribing'

interface UseVoiceRecorderOptions {
  onTranscribed: (text: string) => void
  onError: (message: string) => void
  maxSeconds?: number
}

function detectSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== 'undefined'
  )
}

export function useVoiceRecorder({ onTranscribed, onError, maxSeconds = 60 }: UseVoiceRecorderOptions) {
  const [isSupported] = useState(detectSupport)
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }, [])

  const start = useCallback(async () => {
    if (!isSupported || state !== 'idle') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        clearTimer()
        cleanupStream()
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        chunksRef.current = []
        if (blob.size === 0) {
          setState('idle')
          setElapsedSeconds(0)
          onError('No audio captured — try again.')
          return
        }
        setState('transcribing')
        try {
          const audio_base64 = await blobToBase64(blob)
          const res = await transcribeAudio({ audio_base64, mime_type: mimeType })
          if (res.error || !res.text) {
            onError(res.error || 'Could not transcribe that recording.')
          } else {
            onTranscribed(res.text)
          }
        } catch {
          onError('Could not reach the transcription service.')
        } finally {
          setState('idle')
          setElapsedSeconds(0)
        }
      }

      recorder.start()
      setState('recording')
      startTimeRef.current = Date.now()
      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedSeconds(seconds)
        if (seconds >= maxSeconds) {
          stop()
        }
      }, 250)
    } catch {
      cleanupStream()
      setState('idle')
      onError('Microphone access was denied. Enable it in your browser settings to use voice input.')
    }
  }, [isSupported, state, maxSeconds, stop, clearTimer, cleanupStream, onTranscribed, onError])

  useEffect(
    () => () => {
      clearTimer()
      cleanupStream()
    },
    [clearTimer, cleanupStream],
  )

  return { isSupported, state, elapsedSeconds, start, stop }
}
