const shouldLog = () => import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGS === 'true'

export const logInfo = (...args: unknown[]) => {
  if (shouldLog()) {
    console.info('[DynamicTimeline]', ...args)
  }
}

export const logError = (...args: unknown[]) => {
  if (shouldLog()) {
    console.error('[DynamicTimeline]', ...args)
  }
}
