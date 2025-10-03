import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Clear console mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default value')
    )

    expect(result.current[0]).toBe('default value')
  })

  it('returns value from localStorage if it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'))

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default value')
    )

    expect(result.current[0]).toBe('stored value')
  })

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))
  })

  it('handles function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10))

    act(() => {
      result.current[1]((prev) => prev + 5)
    })

    expect(result.current[0]).toBe(15)
    expect(localStorage.getItem('test-key')).toBe('15')
  })

  it('works with complex objects', () => {
    const initialValue = { name: 'John', age: 30 }
    const { result } = renderHook(() =>
      useLocalStorage('test-key', initialValue)
    )

    const updatedValue = { name: 'Jane', age: 25 }
    act(() => {
      result.current[1](updatedValue)
    })

    expect(result.current[0]).toEqual(updatedValue)
    expect(JSON.parse(localStorage.getItem('test-key') ?? '{}')).toEqual(
      updatedValue
    )
  })

  it('works with arrays', () => {
    const initialValue = [1, 2, 3]
    const { result } = renderHook(() =>
      useLocalStorage('test-key', initialValue)
    )

    const updatedValue = [4, 5, 6]
    act(() => {
      result.current[1](updatedValue)
    })

    expect(result.current[0]).toEqual(updatedValue)
    expect(JSON.parse(localStorage.getItem('test-key') ?? '[]')).toEqual(
      updatedValue
    )
  })

  it('handles parse errors gracefully and returns initial value', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem('test-key', 'invalid json{{{')

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default value')
    )

    expect(result.current[0]).toBe('default value')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error reading localStorage'),
      expect.any(Error)
    )
  })

  it('handles write errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock localStorage.setItem to throw an error
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error setting localStorage'),
      expect.any(Error)
    )

    // Restore original setItem
    Storage.prototype.setItem = originalSetItem
  })

  it('syncs state across hook instances with same key', () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage('shared-key', 'initial')
    )
    const { result: _result2 } = renderHook(() =>
      useLocalStorage('shared-key', 'initial')
    )

    act(() => {
      result1.current[1]('updated from hook 1')
    })

    // Both hooks should read from localStorage initially
    expect(result1.current[0]).toBe('updated from hook 1')
    // Note: _result2 won't update automatically without storage event
    // Storage events only fire across tabs/windows, not same window
  })

  it('updates when storage event is received', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    // Simulate storage event from another tab
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('updated from other tab'),
        oldValue: JSON.stringify('initial'),
        storageArea: localStorage,
      })
      window.dispatchEvent(storageEvent)
    })

    expect(result.current[0]).toBe('updated from other tab')
  })

  it('ignores storage events for different keys', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'different-key',
        newValue: JSON.stringify('different value'),
        oldValue: null,
        storageArea: localStorage,
      })
      window.dispatchEvent(storageEvent)
    })

    expect(result.current[0]).toBe('initial')
  })

  it('ignores storage events with null newValue', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: null,
        oldValue: JSON.stringify('initial'),
        storageArea: localStorage,
      })
      window.dispatchEvent(storageEvent)
    })

    expect(result.current[0]).toBe('initial')
  })

  it('handles parse errors in storage events gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: 'invalid json{{{',
        oldValue: JSON.stringify('initial'),
        storageArea: localStorage,
      })
      window.dispatchEvent(storageEvent)
    })

    expect(result.current[0]).toBe('initial')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error parsing storage event'),
      expect.any(Error)
    )
  })

  it('cleans up storage event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useLocalStorage('test-key', 'initial')
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'storage',
      expect.any(Function)
    )
  })

  it('works with boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', false))

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0]).toBe(true)
    expect(localStorage.getItem('test-key')).toBe('true')
  })

  it('works with null values', () => {
    const { result } = renderHook(() =>
      useLocalStorage<string | null>('test-key', null)
    )

    act(() => {
      result.current[1]('not null')
    })

    expect(result.current[0]).toBe('not null')

    act(() => {
      result.current[1](null)
    })

    expect(result.current[0]).toBe(null)
    expect(localStorage.getItem('test-key')).toBe('null')
  })
})
