'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  TrendingUp,
  Gift,
  Star,
  Zap
} from 'lucide-react'
import MobileLayout from '@/components/layout/MobileLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PiPaymentFlow from '@/components/payments/PiPaymentFlow'
import { PiAuth } from '@/library/auth'

interface Transaction {
  id: string
  type: 'received' | 'sent' | 'reward' | 'bonus'
  amount: number
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
  from?: string
  to?: string
  jobId?: string
}

interface PiUser {
  id: string
  username: string
  email: string
  userType: 'CLIENT' | 'FREELANCER'
}

interface WalletStats {
  balance: number
  pendingBalance: number
  totalEarned: number
  totalSpent: number
  rewardPoints: number
  level: number
}

export default function WalletPage() {
  const [currentUser, setCurrentUser] = useState<PiUser | null>(null)
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'rewards'>('overview')
  const [showPaymentFlow, setShowPaymentFlow] = useState(false)

  useEffect(() => {
    const user = PiAuth.getCurrentUser()
    if (!user) {
      window.location.href = '/auth/signup'
      return
    }
    setCurrentUser(user)
    
    // Mock data for beta
    setTimeout(() => {
      setStats({
        balance: 847.25,
        pendingBalance: 120.50,
        totalEarned: 2340.75,
        totalSpent: 1493.50,
        rewardPoints: 1250,
        level: 3
      })
      
      setTransactions([
        {
          id: '1',
          type: 'received',
          amount: 150.00,
          description: 'Payment for Logo Design Project',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          from: '@client_user',
          jobId: 'job_123'
        },
        {
          id: '2',
          type: 'reward',
          amount: 25.00,
          description: 'First Project Completion Bonus',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'received',
          amount: 75.50,
          description: 'Milestone Payment - Website Phase 1',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          from: '@startup_client'
        }
      ])
      
      setLoading(false)
    }, 1000)
  }, [])

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'received':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />
      case 'sent':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />
      case 'reward':
        return <Gift className="w-4 h-4 text-accent-600" />
      case 'bonus':
        return <Star className="w-4 h-4 text-warning-600" />
      default:
        return <Wallet className="w-4 h-4 text-primary-400" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const copyWalletAddress = () => {
    const mockAddress = `pi1${currentUser?.id?.slice(0, 8)}...${currentUser?.id?.slice(-8)}`
    navigator.clipboard.writeText(mockAddress)
    // You could add a toast notification here
  }

  const handleSendPi = () => {
    setShowPaymentFlow(true)
  }

  const handlePaymentComplete = (success: boolean, txid?: string) => {
    setShowPaymentFlow(false)
    if (success && txid) {
      // Refresh wallet data
      fetchWalletData()
      // You could show a success toast here
    }
  }

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false)
  }

  const fetchWalletData = async () => {
    // Refresh user's wallet stats and transactions
    // This would typically make API calls to get fresh data
    if (currentUser) {
      // Mock refresh - in real app would fetch from API
      setStats(prev => prev ? { ...prev, balance: prev.balance - 10 } : null)
    }
  }

  if (loading) {
    return (
      <MobileLayout>
        <div className="px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-primary-200 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-primary-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Pi Wallet</h1>
            <p className="text-sm text-primary-600 mt-1">
              Manage your Pi Network earnings
            </p>
          </div>
          <Wallet className="w-8 h-8 text-secondary-600" />
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">π</span>
                  </div>
                  <span className="text-sm text-primary-700 font-medium">Pi Network</span>
                </div>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  {showBalance ? <EyeOff className="w-5 h-5 text-primary-600" /> : <Eye className="w-5 h-5 text-primary-600" />}
                </button>
              </div>
              
              <div>
                <p className="text-sm text-primary-600">Available Balance</p>
                <p className="text-3xl font-bold text-primary-900">
                  {showBalance ? `π${stats?.balance?.toFixed(2)}` : 'π•••••'}
                </p>
              </div>
              
              {stats?.pendingBalance && stats.pendingBalance > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-700">Pending</p>
                  <p className="text-lg font-semibold text-yellow-800">
                    {showBalance ? `π${stats.pendingBalance.toFixed(2)}` : 'π•••••'}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={copyWalletAddress}
                  className="flex items-center space-x-1 text-sm opacity-90 hover:opacity-100"
                >
                  <span className="text-primary-700">pi1{currentUser?.id?.slice(0, 8)}...{currentUser?.id?.slice(-8)}</span>
                  <Copy className="w-4 h-4 text-primary-600" />
                </button>
                <button className="p-2 hover:bg-primary-100 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4 text-primary-600" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-12 bg-secondary-600 hover:bg-secondary-700 text-white"
            onClick={handleSendPi}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Pi
          </Button>
          <Button variant="outline" className="h-12 border-secondary-600 text-secondary-700 hover:bg-secondary-50">
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Request Pi
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-primary-100 rounded-xl p-1">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'transactions', label: 'History' },
            { key: 'rewards', label: 'Rewards' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'overview' | 'transactions' | 'rewards')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-primary-900 shadow-sm'
                  : 'text-primary-600 hover:text-primary-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <div className="space-y-2">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto" />
                  <div className="text-lg font-bold text-primary-900">
                    π{stats?.totalEarned?.toFixed(2)}
                  </div>
                  <div className="text-xs text-primary-600">Total Earned</div>
                </div>
              </Card>
              
              <Card className="text-center">
                <div className="space-y-2">
                  <ArrowUpRight className="w-6 h-6 text-red-600 mx-auto" />
                  <div className="text-lg font-bold text-primary-900">
                    π{stats?.totalSpent?.toFixed(2)}
                  </div>
                  <div className="text-xs text-primary-600">Total Spent</div>
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-primary-900">Recent Activity</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary-900 truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-primary-600">
                        {formatTimeAgo(tx.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        tx.type === 'received' || tx.type === 'reward' || tx.type === 'bonus'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {tx.type === 'sent' ? '-' : '+'}π{tx.amount.toFixed(2)}
                      </p>
                      <p className={`text-xs ${
                        tx.status === 'completed' ? 'text-green-600' :
                        tx.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-primary-900">
                        {tx.description}
                      </p>
                      <p className={`text-sm font-semibold ${
                        tx.type === 'received' || tx.type === 'reward' || tx.type === 'bonus'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {tx.type === 'sent' ? '-' : '+'}π{tx.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-primary-600">
                        {tx.from && `From ${tx.from}`}
                        {tx.to && `To ${tx.to}`}
                        {!tx.from && !tx.to && 'System Transaction'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-600' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {tx.status}
                        </span>
                        <span className="text-xs text-primary-400">
                          {formatTimeAgo(tx.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'rewards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Gamification Level */}
            <Card className="bg-gradient-to-r from-accent-50 to-warning-50 border-accent-200">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-warning-500 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-yellow-100" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-900">Pioneer Level {stats?.level}</h3>
                  <p className="text-sm text-primary-600">Earning Specialist</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Level {(stats?.level || 0) + 1}</span>
                    <span>{stats?.rewardPoints}/2000 XP</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-accent-500 to-warning-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((stats?.rewardPoints || 0) / 2000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Reward Points */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-primary-900">Reward Points</h3>
                <Zap className="w-5 h-5 text-accent-600" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-600">{stats?.rewardPoints}</div>
                <p className="text-sm text-primary-600">Available Points</p>
              </div>
            </Card>

            {/* Achievements */}
            <Card>
              <h3 className="font-semibold text-primary-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {[
                  { title: 'First Milestone', description: 'Complete your first project', points: 100, unlocked: true },
                  { title: 'Pi Earner', description: 'Earn your first 100 Pi', points: 200, unlocked: true },
                  { title: 'Pioneer Pro', description: 'Complete 10 projects', points: 500, unlocked: false },
                ].map((achievement, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    achievement.unlocked ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.unlocked ? 'bg-green-600' : 'bg-gray-400'
                    }`}>
                      <Star className={`w-4 h-4 ${achievement.unlocked ? 'text-green-100' : 'text-gray-200'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        achievement.unlocked ? 'text-primary-900' : 'text-primary-600'
                      }`}>
                        {achievement.title}
                      </p>
                      <p className="text-xs text-primary-600">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-accent-600">+{achievement.points}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Payment Flow Modal */}
      {showPaymentFlow && (
        <PiPaymentFlow
          amount={10} // Default send amount
          memo={`Send Pi via Lenno Wallet`}
          onComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
          type="fee"
        />
      )}
    </MobileLayout>
  )
}