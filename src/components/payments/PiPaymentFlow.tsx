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
  initialAmount?: number
  memo: string
  jobId?: string
  type: 'job_payment' | 'milestone_payment' | 'bonus' | 'tip' | 'fee'
  onComplete: (success: boolean, txid?: string) => void
  onCancel: () => void
  allowAmountInput?: boolean
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
  initialAmount, 
  memo, 
  jobId, 
  type, 
  onComplete, 
  onCancel,
  allowAmountInput = true 
}: PaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [rewardPoints, setRewardPoints] = useState(0)
  const [amount, setAmount] = useState(initialAmount || 0)
  const [feeBreakdown, setFeeBreakdown] = useState<{
    userAmount: number
    platformFee: number
    piNetworkFee: number
    totalAmount: number
  } | null>(null)

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
      const response = await fetch('/api/wallet/payments', {
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

      const { payment, feeBreakdown } = await response.json()
      setFeeBreakdown(feeBreakdown)
      
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
            {/* Amount Input Section */}
            {allowAmountInput && currentStep === 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary-900 mb-4">Send Pi</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Amount to Send
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        min="0.01"
                        step="0.01"
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-lg"
                        placeholder="0.00"
                      />
                      <span className="absolute right-3 top-3 text-lg font-semibold text-primary-600">π</span>
                    </div>
                  </div>

                  {/* Fee Breakdown Preview */}
                  {amount > 0 && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-primary-700 mb-3">Fee Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-primary-600">Send Amount:</span>
                          <span className="font-medium text-primary-900">π{amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600">Platform Fee (5%):</span>
                          <span className="font-medium text-primary-900">π{(amount * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600">Pi Network Fee:</span>
                          <span className="font-medium text-primary-900">π0.01</span>
                        </div>
                        <div className="border-t border-primary-300 pt-2 flex justify-between">
                          <span className="font-medium text-primary-700">Total Cost:</span>
                          <span className="font-bold text-secondary-600">π{(amount + (amount * 0.05) + 0.01).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleInitializePayment}
                    disabled={amount <= 0 || isProcessing}
                    className="w-full h-12 bg-secondary-600 hover:bg-secondary-700 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Continue Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Payment Processing Header */}
            {(currentStep > 0 || !allowAmountInput) && (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">π</span>
                </div>
                <h2 className="text-xl font-bold text-primary-900">Pi Network Payment</h2>
                <p className="text-primary-600">Sending π{amount.toFixed(2)}</p>
                
                {/* Fee Breakdown Display */}
                {feeBreakdown && (
                  <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-primary-600">Send Amount:</span>
                        <span className="font-medium text-primary-900">π{feeBreakdown.userAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Platform Fee:</span>
                        <span className="font-medium text-primary-900">π{feeBreakdown.platformFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Pi Network Fee:</span>
                        <span className="font-medium text-primary-900">π{feeBreakdown.piNetworkFee.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-primary-300 pt-2 flex justify-between">
                        <span className="font-medium text-primary-700">Total:</span>
                        <span className="font-bold text-secondary-600">π{feeBreakdown.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-6" style={{display: 'none'}}>
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">π</span>
              </div>
              <h2 className="text-xl font-bold text-primary-900">Pi Network Payment</h2>
              <p className="text-primary-600">Sending π{amount}</p>
            </div>

            {/* Payment Processing Steps */}
            {(currentStep > 0 || !allowAmountInput) && (
              <>
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
          </>
        )}
      </motion.div>
    </div>
  )
}