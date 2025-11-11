// Generic payment configuration placeholder (payment integration removed)
export const PAYMENT_CONFIG = {
  development: { sandbox: true },
  production: { sandbox: false }
}

export const isSandbox = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') return true
  return process.env.NODE_ENV === 'development'
}