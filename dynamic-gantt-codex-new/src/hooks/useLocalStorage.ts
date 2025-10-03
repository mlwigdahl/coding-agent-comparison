import { useCallback, useMemo } from 'react'
import { logError } from '@/utils/logger'

const isBrowser = typeof window !== 'undefined'

const useLocalStorage = <T,>(key: string, fallback: () => T) => {
  const read = useCallback((): T => {
    if (!isBrowser) {
      return fallback()
    }

    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      return fallback()
    }

    try {
      return JSON.parse(rawValue) as T
    } catch (error) {
      logError('Failed to parse localStorage value', error)
      return fallback()
    }
  }, [key, fallback])

  const write = useCallback(
    (value: T) => {
      if (!isBrowser) {
        return
      }

      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        logError('Failed to persist localStorage value', error)
      }
    },
    [key],
  )

  const clear = useCallback(() => {
    if (!isBrowser) {
      return
    }

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      logError('Failed to clear localStorage value', error)
    }
  }, [key])

  return useMemo(() => ({ read, write, clear }), [read, write, clear])
}

export default useLocalStorage
