import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import useFlipAnimation from './useFlipAnimation'

const createMockElement = () => {
  const element = document.createElement('div')
  let rect = {
    left: 0,
    top: 0,
    width: 100,
    height: 40,
    right: 100,
    bottom: 40,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }

  element.getBoundingClientRect = vi.fn(() => rect as DOMRect)
  return {
    element,
    setRect: (nextRect: Partial<DOMRect>) => {
      rect = { ...rect, ...nextRect }
    },
  }
}

describe('useFlipAnimation', () => {
  it('applies transform transitions when positions change', () => {
    const { element, setRect } = createMockElement()
    document.body.appendChild(element)

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })

    const { result } = renderHook(() => useFlipAnimation())
    const { register, recordPositions, play } = result.current

    register('task-1')(element)

    recordPositions()

    setRect({ left: 120, top: 60 })

    play()

    expect(element.style.transition).toContain('transform')
    expect(element.style.transform).toBe('translate(0px, 0px)')

    rafSpy.mockRestore()
  })

  it('does nothing if no prior positions recorded', () => {
    const { element } = createMockElement()
    document.body.appendChild(element)

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

    const { result } = renderHook(() => useFlipAnimation())
    const { register, play } = result.current

    register('task-1')(element)

    play()

    expect(rafSpy).not.toHaveBeenCalled()

    rafSpy.mockRestore()
  })
})
