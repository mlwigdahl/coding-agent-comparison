import { useCallback, useMemo, useRef } from 'react'

type FlipOptions = {
  duration?: number
  easing?: string
}

type NodeMap = Map<string, HTMLElement>

type PositionMap = Map<string, DOMRect>

const defaultOptions: Required<FlipOptions> = {
  duration: 2000,
  easing: 'ease',
}

const createPositionSnapshot = (nodes: NodeMap): PositionMap => {
  const snapshot: PositionMap = new Map()
  nodes.forEach((node, key) => {
    const rect = node.getBoundingClientRect()
    snapshot.set(key, rect)
  })
  return snapshot
}

const cleanupStyles = (node: HTMLElement) => {
  node.style.transition = ''
  node.style.transform = ''
  node.style.width = ''
  node.style.height = ''
  node.style.willChange = ''
}

const useFlipAnimation = (options: FlipOptions = {}) => {
  const config = { ...defaultOptions, ...options }
  const nodesRef = useRef<NodeMap>(new Map())
  const previousPositionsRef = useRef<PositionMap | null>(null)

  const register = useCallback(
    (key: string) =>
      (node: HTMLElement | null) => {
        const nodes = nodesRef.current
        if (node) {
          nodes.set(key, node)
        } else {
          nodes.delete(key)
        }
      },
    [],
  )

  const recordPositions = useCallback(() => {
    previousPositionsRef.current = createPositionSnapshot(nodesRef.current)
  }, [])

  const play = useCallback(() => {
    const previousPositions = previousPositionsRef.current
    if (!previousPositions) {
      return
    }

    nodesRef.current.forEach((node, key) => {
      const previous = previousPositions.get(key)
      if (!previous) {
        return
      }

      const current = node.getBoundingClientRect()
      const deltaX = previous.left - current.left
      const deltaY = previous.top - current.top
      const widthChanged = Math.abs(previous.width - current.width) > 0.5
      const heightChanged = Math.abs(previous.height - current.height) > 0.5

      if (!widthChanged && !heightChanged && deltaX === 0 && deltaY === 0) {
        return
      }

      node.style.transition = 'none'
      node.style.transformOrigin = 'top left'
      node.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      if (widthChanged) {
        node.style.width = `${previous.width}px`
      }
      if (heightChanged) {
        node.style.height = `${previous.height}px`
      }
      node.style.willChange = widthChanged || heightChanged ? 'transform, width, height' : 'transform'

      const cleanup = () => {
        cleanupStyles(node)
        node.removeEventListener('transitionend', cleanup)
      }

      node.addEventListener('transitionend', cleanup, { once: true })

      window.requestAnimationFrame(() => {
        const properties = ['transform']
        if (widthChanged) {
          properties.push('width')
          node.style.width = `${current.width}px`
        }
        if (heightChanged) {
          properties.push('height')
          node.style.height = `${current.height}px`
        }

        node.style.transition = properties
          .map((prop) => `${prop} ${config.duration}ms ${config.easing}`)
          .join(', ')
        node.style.transform = 'translate(0px, 0px)'
      })
    })
  }, [config.duration, config.easing])

  return useMemo(
    () => ({
      register,
      recordPositions,
      play,
    }),
    [register, recordPositions, play],
  )
}

export default useFlipAnimation
