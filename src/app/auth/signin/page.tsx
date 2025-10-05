'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function SignInPage() {
  const router = useRouter()
  const [piSDKLoaded, setPiSDKLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load Pi SDK
    const script = document.createElement('script')
    script.src = 'https://sdk.minepi.com/pi-sdk.js'
    script.onload = () => {
      setPiSDKLoaded(true)
      initializePiSDK()
    }
    script.onerror = () => {
      setError('Failed to load Pi Network SDK. Please check your connection.')
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const initializePiSDK = () => {
    if (window.Pi) {
      console.log('Initializing Pi SDK in signin page with sandbox mode: true')
      
      window.Pi.init({ 
        version: "2.0",
        sandbox: true // Explicitly use sandbox for development
      })
      
      console.log('Pi SDK initialized successfully in signin page')
    }
  }

  const handlePiSignIn = async () => {
    if (!piSDKLoaded || !window.Pi) {
      setError('Pi Network SDK is not loaded. Please refresh and try again.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Authenticate with Pi Network
      const authResult = await window.Pi.authenticate(
        ['username', 'payments'],
        {
          onIncompletePaymentFound: (payment) => {
            console.log('Incomplete payment found:', payment)
          }
        }
      )

      if (authResult.accessToken && authResult.user) {
        // Sign in with your backend
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            piUserId: authResult.user.uid,
            piAccessToken: authResult.accessToken
          })
        })

        const data = await response.json()

        if (response.ok) {
          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          if (data.error.includes('User not found')) {
            setError('Account not found. Please sign up first.')
            setTimeout(() => {
              router.push('/auth/signup')
            }, 2000)
          } else {
            setError(data.error || 'Sign in failed. Please try again.')
          }
        }
      }
    } catch (error: unknown) {
      const piAuthError = error as { message?: string }
      console.error('Pi authentication error:', piAuthError)
      if (error instanceof Error) {
        if (error.message.includes('user_cancelled')) {
          setError('Authentication was cancelled.')
        } else if (error.message.includes('network_error')) {
          setError('Network error. Please check your Pi Network app and try again.')
        } else {
          setError('Sign in failed. Please ensure you have the Pi Network app installed.')
        }
      } else {
        setError('An unknown error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-secondary-600 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">π</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Lenno</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            Sign in with your Pi Network account
          </p>
        </div>

        <Card className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Pi Network Sign In */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-600 to-secondary-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-2xl">π</span>
              </div>
              <h3 className="text-lg font-semibold">Sign In with Pi Network</h3>
              <p className="text-sm text-gray-600">
                Use your Pi Network credentials to access your account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              onClick={handlePiSignIn}
              disabled={!piSDKLoaded || loading}
              className="w-full accent-gradient text-white hover:opacity-90"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In with Pi Network
                </>
              )}
            </Button>

            {!piSDKLoaded && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Pi Network SDK...</span>
                </div>
              </div>
            )}

            {/* Browse as Guest */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Or</p>
              <Button
                variant="outline"
                onClick={() => router.push('/jobs')}
                className="w-full"
              >
                Browse Jobs as Guest
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            New to Lenno?{' '}
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-secondary-600 font-medium hover:text-secondary-700"
            >
              Join as Pioneer
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}