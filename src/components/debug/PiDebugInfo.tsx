'use client'

import { useEffect, useState } from 'react'

export default function PiDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<{
    hostname: string
    nodeEnv: string
    piSandbox: string | undefined
    userAgent: string
    sdkLoaded: boolean
  } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDebugInfo({
        hostname: window.location.hostname,
        nodeEnv: process.env.NODE_ENV || 'unknown',
        piSandbox: process.env.NEXT_PUBLIC_PI_SANDBOX,
        userAgent: navigator.userAgent,
        sdkLoaded: !!window.Pi
      })
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Pi SDK Debug Info</h3>
      {debugInfo && (
        <div className="space-y-1">
          <div>Hostname: <span className="text-green-400">{debugInfo.hostname}</span></div>
          <div>NODE_ENV: <span className="text-secondary-400">{debugInfo.nodeEnv}</span></div>
          <div>PI_SANDBOX: <span className="text-yellow-400">{debugInfo.piSandbox || 'undefined'}</span></div>
          <div>SDK Loaded: <span className={debugInfo.sdkLoaded ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.sdkLoaded ? 'Yes' : 'No'}
          </span></div>
          <div>User Agent: <span className="text-gray-400 text-xs">
            {debugInfo.userAgent.includes('PiBrowser') ? '✅ Pi Browser' : '❌ Regular Browser'}
          </span></div>
        </div>
      )}
    </div>
  )
}