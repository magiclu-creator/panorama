export function safeJsonParse<T = unknown>(str: unknown, fallback: T): T {
  if (typeof str !== 'string') return (str ?? fallback) as T
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
