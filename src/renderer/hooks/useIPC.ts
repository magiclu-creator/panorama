import { useState, useCallback, useRef } from 'react'

interface UseIPCResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
}

export function useIPC<T>(
  ipcCall: (...args: unknown[]) => Promise<unknown>,
): UseIPCResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ipcCallRef = useRef(ipcCall)
  ipcCallRef.current = ipcCall

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await ipcCallRef.current(...args)
        setData(result as T)
        setLoading(false)
        return result as T
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setLoading(false)
        console.error('IPC call failed:', err)
        return null
      }
    },
    []
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}
