// Environment Configuration for Pi Network
export const PI_CONFIG = {
  development: {
    sandbox: true,
    environment: 'sandbox'
  },
  production: {
    sandbox: false,
    environment: 'production'
  }
}

export const isPiSandbox = () => {
  // Force sandbox in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return true
  }
  
  // Check environment variables
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_PI_SANDBOX === 'true'
}

export const getPiConfig = () => {
  const sandbox = isPiSandbox()
  
  return {
    version: "2.0",
    sandbox,
    environment: sandbox ? 'sandbox' : 'production'
  }
}