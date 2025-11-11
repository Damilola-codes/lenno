import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  if (currency === 'USD') {
    return `$${amount.toLocaleString()}`
  }
  // Fallback: use currency code then amount
  return `${currency} ${amount.toLocaleString()}`
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatTimeAgo(date: string | Date) {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(date)
}

export function truncateText(text: string, length: number = 100) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function normalizeApiError(error: unknown): string {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (Array.isArray(error)) {
    return error
      .map((e) => {
        if (e && typeof e === 'object' && 'message' in e) {
          const msg = (e as Record<string, unknown>).message
          if (typeof msg === 'string') return msg
        }
        return JSON.stringify(e)
      })
      .join('; ')
  }
  if (typeof error === 'object') {
    const e = error as Record<string, unknown>
    if (typeof e.message === 'string' && e.message) return e.message
    if (typeof e.error === 'string') return e.error
    if (e.details && Array.isArray(e.details)) {
      return (e.details as unknown[])
        .map((d) => {
          if (d && typeof d === 'object' && 'message' in d) {
            const msg = (d as Record<string, unknown>).message
            if (typeof msg === 'string') return msg
          }
          return JSON.stringify(d)
        })
        .join('; ')
    }
    return JSON.stringify(error)
  }
  return String(error)
}