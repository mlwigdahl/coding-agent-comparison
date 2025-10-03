import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
]

const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS.join(', ')))
    .filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'))
}

const useFocusTrap = (containerRef: React.RefObject<HTMLElement | null>, active: boolean) => {
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!active || !container) {
      return
    }

    const focusable = getFocusableElements(container)
    if (focusable.length === 0) {
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    previousActiveElementRef.current = document.activeElement as HTMLElement | null

    if (!container.contains(document.activeElement)) {
      first.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return
      }

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      previousActiveElementRef.current?.focus?.()
    }
  }, [containerRef, active])
}

export default useFocusTrap
