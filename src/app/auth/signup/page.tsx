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
  Loader2,
  Users,
  Briefcase,
  Repeat
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { PiAuth } from '@/library/auth'

interface PiUser {
  uid: string
  username: string
  accessToken: string
}

interface EmailValidation {
  isValid: boolean
  message: string
}

export default function AuthPage() {
  const router = useRouter()
  const [piSDKLoaded, setPiSDKLoaded] = useState(false)
  const [piUser, setPiUser] = useState<PiUser | null>(null)
  const [email, setEmail] = useState('')
  const [emailValidation, setEmailValidation] = useState<EmailValidation>({ isValid: false, message: '' })
  const [currentRole, setCurrentRole] = useState<'CLIENT' | 'FREELANCER'>('FREELANCER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isExistingUser, setIsExistingUser] = useState(false)
  const [step, setStep] = useState(1) // 1: Pi Auth, 2: Role Selection & Email, 3: Complete
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [authCallCount, setAuthCallCount] = useState(0) // Debug counter
  const [lastAuthTime, setLastAuthTime] = useState(0) // Debouncing

  // Real-time email validation
  const validateEmail = (emailValue: string): EmailValidation => {
    if (!emailValue.trim()) {
      return { isValid: false, message: 'Email is required' }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue)) {
      return { isValid: false, message: 'Please enter a valid email address' }
    }
    
    if (emailValue.length > 254) {
      return { isValid: false, message: 'Email address is too long' }
    }
    
    return { isValid: true, message: 'Valid email address' }
  }

  useEffect(() => {
    if (email) {
      const validation = validateEmail(email)
      setEmailValidation(validation)
    } else {
      setEmailValidation({ isValid: false, message: '' })
    }
  }, [email])

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
      // Authenticate with Pi Network - requesting username scope for profile data
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
        const piUserData = {
          uid: authResult.user.uid,
          username: authResult.user.username || authResult.user.uid, // Fallback to uid if username not available
          email: authResult.user.email || '', // Pi Network email if available
          accessToken: authResult.accessToken
        }
        
        console.log('Pi User Data extracted:', {
          uid: piUserData.uid,
          username: piUserData.username,
          email: piUserData.email ? 'present' : 'not available',
          hasAccessToken: !!piUserData.accessToken
        })
        
        setPiUser(piUserData)
        
        // Check if user already exists
        try {
          const checkResponse = await fetch('/api/auth/check-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              piUserId: piUserData.uid
            })
          })
          
          // Ensure we have a JSON response
          const contentType = checkResponse.headers.get('content-type')
          if (checkResponse.ok && contentType && contentType.includes('application/json')) {
            const userData = await checkResponse.json()
            
            if (userData.exists) {
              setIsExistingUser(true)
              setEmail(userData.user.email || '')
              setCurrentRole(userData.user.userType || 'FREELANCER')
              console.log('Existing user found:', {
                username: userData.user.username,
                email: userData.user.email,
                userType: userData.user.userType
              })
            } else {
              // New user - use Pi Network email as default if available
              if (piUserData.email) {
                setEmail(piUserData.email)
                console.log('Using Pi Network email as default:', piUserData.email)
              }
            }
          }
        } catch (error) {
          console.log('User check failed, proceeding as new user:', error)
        }
        
        setStep(2) // Move to role selection step
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

  const handleCompleteAuth = async () => {
    const now = Date.now()
    const callCount = authCallCount + 1
    setAuthCallCount(callCount)
    console.log(`🔄 handleCompleteAuth called - Call #${callCount}`)
    
    // Debounce: prevent calls within 1 second of each other
    if (now - lastAuthTime < 1000) {
      console.log('🚫 Call blocked by debounce (too soon)')
      return
    }
    setLastAuthTime(now)
    
    if (!piUser) {
      setError('Pi Network authentication required.')
      return
    }

    // Only allow calls from step 2
    if (step !== 2) {
      console.log(`❌ Invalid step for auth: ${step}`)
      return
    }

    // Validate email before making API call (only for new users)
    if (!isExistingUser) {
      const validation = validateEmail(email)
      if (!validation.isValid) {
        setError(validation.message)
        return
      }
    }

    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('⏳ Auth already in progress, ignoring call')
      return
    }

    setLoading(true)
    setError('')

    try {
      const endpoint = '/api/auth/signup' // Use single endpoint for both
      const requestBody = isExistingUser 
        ? {
            piUserId: piUser.uid,
            piAccessToken: piUser.accessToken,
            currentRole: currentRole,
            isExistingUser: true // Flag to indicate this is a role switch
          }
        : {
            piUserId: piUser.uid,
            username: piUser.username,
            email: email.trim(),
            userType: currentRole,
            piAccessToken: piUser.accessToken,
            isExistingUser: false // Flag to indicate this is new signup
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: Expected JSON response but got ${contentType}`)
      }

      const data = await response.json()
      console.log('Auth response:', { status: response.status, data })

      if (response.ok) {
        console.log('✅ Auth successful, moving to step 3')
        
        // Store user session using Pi Auth
        if (data.user) {
          PiAuth.setSession(data.user, piUser.accessToken)
          console.log('💾 User session stored successfully')
        }
        
        setStep(3) // Success step
        // Redirect to dashboard after a brief success message
        setTimeout(() => {
          console.log('🚀 Redirecting to dashboard')
          router.push('/dashboard')
        }, 2000)
      } else {
        // Handle specific error cases
        if (data.error && data.error.includes('email already')) {
          setError('This email is already registered with a different Pi Network account.')
        } else if (data.error && data.error.includes('Pi Network account already')) {
          setError('This Pi Network account is already registered.')
        } else {
          const errorMessage = data.details ? `${data.error}. ${data.details}` : (data.error || 'Authentication failed. Please try again.')
          setError(errorMessage)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          setError('Server communication error. Please try again or contact support if the issue persists.')
        } else if (error.message.includes('Expected JSON response')) {
          setError('Authentication service is temporarily unavailable. Please try again in a few moments.')
        } else {
          setError(error.message.includes('Network') ? 
            'Network error. Please check your connection and try again.' : 
            error.message)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pi Network Freelancing</h1>
          <p className="text-gray-600 mb-1">
            Sign in with your Pi Network account and choose your current role
          </p>
          <div className="inline-flex items-center space-x-1 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            <span>Pioneer-only • Secure • Verified</span>
          </div>
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
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                  <p className="text-xs text-amber-800">
                    <strong>🔒 Security Note:</strong> We use Pi Network&apos;s official SDK for authentication. Your Pi credentials remain secure and are never stored on our servers.
                  </p>
                </div>
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
                    <p className="font-medium text-green-800">
                      {isExistingUser ? `Welcome back, @${piUser?.username}!` : `Hello, @${piUser?.username}!`}
                    </p>
                    <p className="text-sm text-green-700">Pi Network Connected ✓</p>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {isExistingUser ? 'Switch to role:' : 'Choose your role:'}
                  </label>
                  {isExistingUser && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Repeat className="w-3 h-3 mr-1" />
                      You can switch roles anytime
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentRole('FREELANCER')}
                    className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                      currentRole === 'FREELANCER'
                        ? 'border-secondary-600 bg-secondary-50 ring-2 ring-secondary-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        currentRole === 'FREELANCER'
                          ? 'border-secondary-600 bg-secondary-600'
                          : 'border-gray-300'
                      }`}>
                        {currentRole === 'FREELANCER' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <Briefcase className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Freelancer</div>
                        <div className="text-sm text-gray-600">Offer skills and services to earn Pi</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setCurrentRole('CLIENT')}
                    className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                      currentRole === 'CLIENT'
                        ? 'border-secondary-600 bg-secondary-50 ring-2 ring-secondary-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        currentRole === 'CLIENT'
                          ? 'border-secondary-600 bg-secondary-600'
                          : 'border-gray-300'
                      }`}>
                        {currentRole === 'CLIENT' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <Users className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Client</div>
                        <div className="text-sm text-gray-600">Hire talented pioneers for projects</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Email Input - Only for new users */}
              {!isExistingUser && (
                <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <div className="flex items-center text-xs text-gray-500">
                      <Shield className="w-3 h-3 mr-1" />
                      Required for security
                    </div>
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                    placeholder="Enter your email address"
                    className={`w-full ${
                      email && !emailValidation.isValid 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : email && emailValidation.isValid 
                          ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                          : ''
                    }`}
                    icon={<Mail />}
                  />
                  {email && emailValidation.message && (
                    <div className={`flex items-center space-x-1 text-xs ${
                      emailValidation.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {emailValidation.isValid ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      <span>{emailValidation.message}</span>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-blue-700">
                      <strong>Why we need this:</strong> Email enables secure account recovery, project notifications, and payment confirmations. We never share it with third parties.
                    </p>
                  </div>
                </form>
              )}

              {/* Existing user email display */}
              {isExistingUser && email && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">{email}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleCompleteAuth}
                  disabled={(!isExistingUser && (!email || !emailValidation.isValid)) || loading}
                  className="flex-1 accent-gradient text-white hover:opacity-90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isExistingUser ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {isExistingUser ? `Continue as ${currentRole.toLowerCase()}` : 'Complete setup'}
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
                  Welcome to Lenno, @{piUser?.username}! 🎉
                </h3>
                <p className="text-gray-600">
                  {isExistingUser 
                    ? `Successfully switched to ${currentRole.toLowerCase()} mode. Redirecting to your dashboard...`
                    : `Your Pi Network pioneer account has been created successfully as a ${currentRole.toLowerCase()}. Redirecting to your dashboard...`
                  }
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
                <span className="text-sm text-gray-500">Loading dashboard...</span>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Footer with Terms Modal */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 mb-2">
            By continuing, you agree to our{' '}
            <button
              onClick={() => setShowTermsModal(true)}
              className="text-secondary-600 hover:text-secondary-700 underline font-medium"
            >
              Terms of Service and Privacy Policy
            </button>
          </p>
          <p className="text-xs text-gray-400">
            🔒 Your data is encrypted and secure. Pi Network authentication ensures pioneer-only access.
          </p>
        </div>

        {/* Terms and Privacy Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Platform Overview & Security</h3>
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4 text-sm text-gray-600 max-h-[50vh] overflow-y-auto">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🎯 Platform Purpose</h4>
                    <p>Lenno is an exclusive freelance marketplace for Pi Network pioneers, enabling secure project collaboration and Pi-based payments within the Pi ecosystem.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🔒 Security & Privacy</h4>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Your Pi Network identity is verified through official Pi SDK</li>
                      <li>All data is encrypted and stored securely</li>
                      <li>We never store your Pi Network credentials</li>
                      <li>Email is used solely for account notifications and security</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">📧 Why We Need Your Email</h4>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Project updates and milestone notifications</li>
                      <li>Security alerts and account protection</li>
                      <li>Payment confirmations and transaction receipts</li>
                      <li>Critical platform announcements</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">We never share your email with third parties or send promotional content.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">⚖️ Fair Usage</h4>
                    <p>By using Lenno, you agree to maintain professional conduct, deliver quality work, and respect the Pi Network community values.</p>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col space-y-3">
                  <Button
                    onClick={() => setShowTermsModal(false)}
                    className="w-full accent-gradient text-white hover:opacity-90"
                  >
                    I Understand & Agree
                  </Button>
                  <div className="text-center">
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-secondary-600 hover:text-secondary-700 underline"
                    >
                      Read Full Terms of Service →
                    </a>
                    <span className="text-xs text-gray-400 mx-2">|</span>
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-secondary-600 hover:text-secondary-700 underline"
                    >
                      Privacy Policy →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}