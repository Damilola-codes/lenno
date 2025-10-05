'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Mail,
  Shield, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface PiUser {
  uid: string
  username: string
  accessToken: string
}

export default function SignUpPage() {
  const router = useRouter()
  const [piSDKLoaded, setPiSDKLoaded] = useState(false)
  const [piUser, setPiUser] = useState<PiUser | null>(null)
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState<'CLIENT' | 'FREELANCER'>('FREELANCER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Pi Auth, 2: Email, 3: Complete

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
      console.log('Initializing Pi SDK in signup page with sandbox mode: true')
      
      window.Pi.init({ 
        version: "2.0",
        sandbox: true // Explicitly use sandbox for development
      })
      
      console.log('Pi SDK initialized successfully in signup page')
    }
  }

  const handlePiAuthentication = async () => {
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
          onIncompletePaymentFound: (payment: unknown) => {
            console.log('Incomplete payment found:', payment)
          }
        }
      )

      console.log('Pi Authentication successful:', authResult)
      
      if (authResult.accessToken && authResult.user) {
        setPiUser({
          uid: authResult.user.uid,
          username: authResult.user.uid, // Use uid as username since Pi API doesn't return username in this version
          accessToken: authResult.accessToken
        })
        setStep(2) // Move to email step
      } else {
        setError('Pi Network authentication failed. Please try again.')
      }
    } catch (error: unknown) {
      console.error('Pi authentication error:', error)
      
      // Handle error message
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Normalize errorMessage to handle structured errors (JSON or objects) and make checks more specific
      const normalized = (() => {
        try {
          const parsed = JSON.parse(errorMessage)
          if (parsed && typeof parsed === 'object') {
            // prefer explicit code fields if present
            return String(parsed.code ?? parsed.error ?? parsed.message ?? errorMessage)
          }
        } catch {
          // Not JSON, fall back to raw message
        }
        return errorMessage
      })()
  
      if (
        normalized.toLowerCase().includes('cancel') ||
        normalized.toLowerCase().includes('user_cancelled') ||
        normalized.includes('authentication_cancelled')
      ) {
        setError('Authentication was cancelled. Please try again.')
      } else if (
        normalized.includes('network_error') ||
        normalized.toLowerCase().includes('network')
      ) {
        setError('Network error. Please check your Pi Network app and try again.')
      } else {
        setError('Pi Network authentication failed. Please ensure you have the Pi Network app installed and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSignup = async () => {
    if (!piUser || !email) {
      setError('Please complete all required fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create user account with your backend
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          piUserId: piUser.uid,
          username: piUser.username,
          email: email,
          userType: userType,
          piAccessToken: piUser.accessToken
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStep(3) // Success step
        // Redirect to dashboard after a brief success message
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        if (data.error.includes('email already exists')) {
          setError('This email is already registered. Please sign in instead.')
        } else if (data.error.includes('pi user already exists')) {
          setError('This Pi Network account is already registered. Please sign in instead.')
        } else {
          setError(data.error || 'Failed to create account. Please try again.')
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('Network error. Please try again.')
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join as Pi Pioneer</h1>
          <p className="text-gray-600">
            Connect your Pi Network account and choose your role to get started
          </p>
        </div>

        <Card className="p-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Pi Network Authentication */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-600 to-secondary-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-2xl">π</span>
                </div>
                <h3 className="text-lg font-semibold">Connect Pi Network Account</h3>
                <p className="text-sm text-gray-600">
                  Verify your Pi Network pioneer status to join our exclusive freelance marketplace
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                onClick={handlePiAuthentication}
                disabled={!piSDKLoaded || loading}
                className="w-full accent-gradient text-white hover:opacity-90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Authenticate with Pi Network
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
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Pi User Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Pi Network Connected</p>
                    <p className="text-sm text-green-700">@{piUser?.username}</p>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full"
                    icon={<Mail />}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We&apos;ll only use this for important account notifications
                  </p>
                </div>

                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How do you want to use Lenno?
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() => setUserType('FREELANCER')}
                      className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                        userType === 'FREELANCER'
                          ? 'border-secondary-600 bg-secondary-50 ring-2 ring-secondary-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          userType === 'FREELANCER'
                            ? 'border-secondary-600 bg-secondary-600'
                            : 'border-gray-300'
                        }`}>
                          {userType === 'FREELANCER' && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">I&apos;m a Freelancer</div>
                          <div className="text-sm text-gray-600">Offer my skills and services to earn Pi</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setUserType('CLIENT')}
                      className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                        userType === 'CLIENT'
                          ? 'border-secondary-600 bg-secondary-50 ring-2 ring-secondary-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          userType === 'CLIENT'
                            ? 'border-secondary-600 bg-secondary-600'
                            : 'border-gray-300'
                        }`}>
                          {userType === 'CLIENT' && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">I&apos;m a Client</div>
                          <div className="text-sm text-gray-600">Hire talented pioneers for my projects</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCompleteSignup}
                  disabled={!email || loading}
                  className="flex-1 accent-gradient text-white hover:opacity-90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Lenno! 🎉
                </h3>
                <p className="text-gray-600">
                  Your Pi Network pioneer account has been created successfully as a {userType.toLowerCase()}. 
                  Redirecting to your dashboard...
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
                <span className="text-sm text-gray-500">Loading dashboard...</span>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-secondary-600 font-medium hover:text-secondary-700"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}