'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  CheckCircle, 
  Loader2, 
  Coins, 
  ArrowRight, 
  Star,
  Gift,
  Trophy,
  Sparkles
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface PaymentFlowProps {
  amount: number
  memo: string
  jobId?: string
  type: 'job_payment' | 'milestone_payment' | 'bonus' | 'tip' | 'fee'
  onComplete: (success: boolean, txid?: string) => void
  onCancel: () => void
}

interface PaymentStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'pending' | 'active' | 'completed' | 'error'
}

interface PaymentData {
  id: string
  amount: number
  memo: string
  type: string
  metadata?: Record<string, string | number | boolean>
}

export default function PiPaymentFlow({ 
  amount, 
  memo, 
  jobId, 
  type, 
  onComplete, 
  onCancel 
}: PaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [rewardPoints, setRewardPoints] = useState(0)

  const steps: PaymentStep[] = [
    {
      id: 'create',
      title: 'Preparing Payment',
      description: 'Setting up your Pi Network transaction',
      icon: Zap,
      status: 'active'
    },
    {
      id: 'authorize',
      title: 'Authorize Payment',
      description: 'Confirm the payment in Pi Network',
      icon: Coins,
      status: 'pending'
    },
    {
      id: 'process',
      title: 'Processing',
      description: 'Securing your transaction on the blockchain',
      icon: Loader2,
      status: 'pending'
    },
    {
      id: 'complete',
      title: 'Payment Complete!',
      description: 'Your payment has been successfully processed',
      icon: CheckCircle,
      status: 'pending'
    }
  ]

  const [paymentSteps, setPaymentSteps] = useState(steps)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      // Call function directly to avoid dependency issues
      handleInitializePayment()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInitializePayment = async () => {
    try {
      setIsProcessing(true)
      
      // Create payment record in backend
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          memo,
          jobId,
          type
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment')
      }

      const { payment } = await response.json()
      
      // Update step status
      updateStepStatus(0, 'completed')
      setCurrentStep(1)
      updateStepStatus(1, 'active')

      // Initialize Pi Network payment
      setTimeout(() => {
        createPiPayment(payment)
      }, 1000)

    } catch (error) {
      console.error('Payment initialization error:', error)
      updateStepStatus(0, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const createPiPayment = (payment: PaymentData) => {
    if (!window.Pi) {
      updateStepStatus(1, 'error')
      return
    }

    try {
      window.Pi.createPayment(
        {
          amount: payment.amount,
          memo: payment.memo,
          metadata: payment.metadata || {}
        },
        {
          onReadyForServerApproval: async (piPaymentId: string) => {
            console.log('Payment ready for server approval:', piPaymentId)
            
            // Update step status
            updateStepStatus(1, 'completed')
            setCurrentStep(2)
            updateStepStatus(2, 'active')

            // Server approval
            await approvePayment(payment.id, piPaymentId)
          },
          onReadyForServerCompletion: async (piPaymentId: string, txid: string) => {
            console.log('Payment ready for completion:', piPaymentId, txid)
            
            // Complete payment
            await completePayment(payment.id, txid)
          },
          onCancel: (piPaymentId: string) => {
            console.log('Payment cancelled:', piPaymentId)
            updateStepStatus(currentStep, 'error')
            onCancel()
          },
          onError: (error: Error) => {
            console.error('Payment error:', error)
            updateStepStatus(currentStep, 'error')
            onComplete(false)
          }
        }
      )
    } catch (error) {
      console.error('Pi payment creation error:', error)
      updateStepStatus(1, 'error')
    }
  }

  const approvePayment = async (paymentId: string, piPaymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ piPaymentId })
      })

      if (!response.ok) {
        throw new Error('Server approval failed')
      }
    } catch (error) {
      console.error('Payment approval error:', error)
      updateStepStatus(2, 'error')
    }
  }

  const completePayment = async (paymentId: string, txid: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txid })
      })

      if (!response.ok) {
        throw new Error('Payment completion failed')
      }

      // Success!
      updateStepStatus(2, 'completed')
      setCurrentStep(3)
      updateStepStatus(3, 'completed')
      
      // Calculate reward points
      const points = Math.floor(amount * 10) // 10 points per Pi
      setRewardPoints(points)
      
      // Show celebration
      setShowCelebration(true)
      
      setTimeout(() => {
        onComplete(true, txid)
      }, 3000)

    } catch (error) {
      console.error('Payment completion error:', error)
      updateStepStatus(2, 'error')
      onComplete(false)
    }
  }

  const updateStepStatus = (stepIndex: number, status: PaymentStep['status']) => {
    setPaymentSteps(prev => 
      prev.map((step, index) => 
        index === stepIndex ? { ...step, status } : step
      )
    )
  }

  const getStepIcon = (step: PaymentStep) => {
    const IconComponent = step.icon
    
    if (step.status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-500" />
    }
    if (step.status === 'error') {
      return <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
        <span className="text-white text-xs">!</span>
      </div>
    }
    if (step.status === 'active') {
      return step.id === 'process' ? 
        <Loader2 className="w-6 h-6 text-secondary-600 animate-spin" /> :
        <IconComponent className="w-6 h-6 text-secondary-600" />
    }
    
    return <IconComponent className="w-6 h-6 text-primary-400" />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-8 text-center">
                <div className="relative">
                  <Trophy className="w-16 h-16 mx-auto mb-4" />
                  <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-yellow-200 animate-pulse" />
                  <Sparkles className="w-4 h-4 absolute -bottom-1 -left-1 text-yellow-200 animate-pulse delay-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Complete!</h2>
                <p className="text-yellow-100 mb-3">π{amount} sent successfully</p>
                <div className="flex items-center justify-center space-x-2 bg-white bg-opacity-20 rounded-lg p-2">
                  <Star className="w-4 h-4 text-yellow-200" />
                  <span className="text-sm">+{rewardPoints} Reward Points</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showCelebration && (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">π</span>
              </div>
              <h2 className="text-xl font-bold text-primary-900">Pi Network Payment</h2>
              <p className="text-primary-600">Sending π{amount}</p>
            </div>

            {/* Payment Details */}
            <Card className="mb-6 bg-primary-50 border-primary-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-primary-600">Amount:</span>
                  <span className="text-sm font-semibold text-primary-900">π{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-primary-600">Purpose:</span>
                  <span className="text-sm text-primary-900">{memo}</span>
                </div>
                {type === 'job_payment' && (
                  <div className="flex items-center space-x-1 pt-2 border-t border-primary-200">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700">+{Math.floor(amount * 10)} reward points</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Steps */}
            <div className="space-y-3 mb-6">
              {paymentSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: step.status === 'active' ? 1.02 : 1
                  }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    step.status === 'active' 
                      ? 'bg-secondary-50 border border-secondary-200' 
                      : step.status === 'completed'
                      ? 'bg-green-50 border border-green-200'
                      : step.status === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-primary-50 border border-primary-200'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-green-800' :
                      step.status === 'error' ? 'text-red-800' :
                      step.status === 'active' ? 'text-secondary-800' : 'text-primary-700'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${
                      step.status === 'completed' ? 'text-green-600' :
                      step.status === 'error' ? 'text-red-600' :
                      step.status === 'active' ? 'text-secondary-600' : 'text-primary-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {step.status === 'active' && (
                    <ArrowRight className="w-4 h-4 text-secondary-600 animate-pulse" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              {paymentSteps[0].status === 'error' && (
                <Button 
                  onClick={handleInitializePayment}
                  className="flex-1"
                >
                  Retry Payment
                </Button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}