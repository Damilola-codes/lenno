'use client'
import { useState, useEffect, useCallback } from 'react'
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
import Input from '@/components/ui/Input'
import { Auth } from '@/library/auth'

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

interface User {
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
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'rewards'>('overview')
  const [showSendForm, setShowSendForm] = useState(false)
  const [showReceiveForm, setShowReceiveForm] = useState(false)
  const [sendAmount, setSendAmount] = useState<string>('')
  const [sendTo, setSendTo] = useState<string>('')
  const [receiveAmount, setReceiveAmount] = useState<string>('')
  const [receiveFrom, setReceiveFrom] = useState<string>('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [modalContent, setModalContent] = useState<{ title: string; message: string } | null>(null)
  // Payment flow removed

  useEffect(() => {
    const user = Auth.getCurrentUser()
    if (!user) {
      window.location.href = '/auth/signup'
      return
    }
    setCurrentUser(user)
    // Try to load persisted wallet state for this user
    const statsKey = `wallet_stats_${user.id}`
    const txKey = `wallet_transactions_${user.id}`

    try {
      const rawStats = typeof window !== 'undefined' ? window.localStorage.getItem(statsKey) : null
      const rawTx = typeof window !== 'undefined' ? window.localStorage.getItem(txKey) : null

      if (rawStats) {
        setStats(JSON.parse(rawStats) as WalletStats)
      } else {
        // baseline stats for new users
        setStats({ balance: 0, pendingBalance: 0, totalEarned: 0, totalSpent: 0, rewardPoints: 0, level: 1 })
      }

      if (rawTx) {
        setTransactions(JSON.parse(rawTx) as Transaction[])
      } else {
        // start with empty history for new users
        setTransactions([])
      }
    } catch (err) {
      // fallback to safe defaults
      setStats({ balance: 0, pendingBalance: 0, totalEarned: 0, totalSpent: 0, rewardPoints: 0, level: 1 })
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const persistWallet = useCallback((userId: string | undefined, newStats: WalletStats | null, newTx: Transaction[]) => {
    if (!userId) return
    try {
      const statsKey = `wallet_stats_${userId}`
      const txKey = `wallet_transactions_${userId}`
      if (newStats) window.localStorage.setItem(statsKey, JSON.stringify(newStats))
      window.localStorage.setItem(txKey, JSON.stringify(newTx))
    } catch (e) {
      // ignore localStorage errors
      // eslint-disable-next-line no-console
      console.warn('Could not persist wallet state', e)
    }
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
    const mockAddress = `addr_${currentUser?.id?.slice(0, 8)}...${currentUser?.id?.slice(-8)}`
    navigator.clipboard.writeText(mockAddress)
    // You could add a toast notification here
  }

  // Note: wallet refresh logic removed for now (use API endpoints in future)

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
            <h1 className="text-2xl font-bold text-primary-900">Wallet</h1>
            <p className="text-sm text-primary-600 mt-1">Manage your account balance</p>
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
                    <span className="text-lg font-bold text-white">W</span>
                  </div>
                  <span className="text-sm text-primary-700 font-medium">Wallet</span>
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
                  {showBalance ? `$${stats?.balance?.toFixed(2)}` : '•••••'}
                </p>
              </div>
              
              {stats?.pendingBalance && stats.pendingBalance > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-700">Pending</p>
                  <p className="text-lg font-semibold text-yellow-800">
                    {showBalance ? `$${stats?.pendingBalance?.toFixed(2)}` : '•••••'}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2">
                <button onClick={copyWalletAddress} className="flex items-center space-x-1 text-sm opacity-90 hover:opacity-100">
                  <span className="text-primary-700">addr_{currentUser?.id?.slice(0, 8)}...{currentUser?.id?.slice(-8)}</span>
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
          <Button type="button" onClick={() => { setShowSendForm(true); setActiveTab('transactions') }} className="h-12 bg-secondary-600 hover:bg-secondary-700 text-white">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <Button type="button" variant="outline" onClick={() => { setShowReceiveForm(true); setActiveTab('transactions') }} className="h-12 border-secondary-600 text-secondary-700 hover:bg-secondary-50">
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Receive
          </Button>
        </div>

        {/* Send / Receive Forms (local demo only) */}
        {showSendForm && (
          <Card>
            <h3 className="font-semibold text-primary-900 mb-2">Send Funds</h3>
            <div className="space-y-2">
              <Input placeholder="Recipient (username or address)" value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
              <Input placeholder="Amount" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
              <p className="text-xs text-primary-500">Enter a numeric value. Example: 12.50</p>
              <div className="flex space-x-2">
                <Button onClick={async () => {
                  const amt = Number(sendAmount)
                  // basic validations
                  const isAmountValid = !Number.isNaN(amt) && amt > 0
                  const emailLike = /@/.test(sendTo)
                  const usernameLike = /^[a-zA-Z0-9_]{3,30}$/.test(sendTo)
                  if (!isAmountValid) return
                  if (!sendTo || (!emailLike && !usernameLike)) return
                  // update balances locally
                  setStats((s) => {
                    const current = s || { balance: 0, pendingBalance: 0, totalEarned: 0, totalSpent: 0, rewardPoints: 0, level: 0 }
                    const newBalance = Math.max(0, (current.balance || 0) - amt)
                    return { ...current, balance: newBalance, totalSpent: (current.totalSpent || 0) + amt }
                  })
                  // add transaction
                  const newTx: Transaction = {
                    id: `tx_${Date.now()}`,
                    type: 'sent',
                    amount: amt,
                    description: `Sent to ${sendTo}`,
                    timestamp: new Date().toISOString(),
                    status: 'completed',
                    to: sendTo
                  }
                  setTransactions((t) => {
                    const merged = [newTx, ...t]
                    persistWallet(currentUser?.id, null, merged)
                    return merged
                  })
                  // persist stats as well
                  setStats((s) => {
                    const updated = (s || { balance: 0, pendingBalance: 0, totalEarned: 0, totalSpent: 0, rewardPoints: 0, level: 0 })
                    persistWallet(currentUser?.id, updated, [])
                    return updated
                  })
                  // reset
                  setSendAmount('')
                  setSendTo('')
                  setShowSendForm(false)
                  setModalContent({ title: 'Sent', message: `You sent $${amt.toFixed(2)} to ${sendTo}` })
                  setShowConfirmModal(true)
                }} className="bg-secondary-600 text-white">Confirm</Button>
                <Button variant="outline" onClick={() => setShowSendForm(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {showReceiveForm && (
          <Card>
            <h3 className="font-semibold text-primary-900 mb-2">Receive Funds</h3>
            <div className="space-y-2">
              <Input placeholder="Sender (username or address)" value={receiveFrom} onChange={(e) => setReceiveFrom(e.target.value)} />
              <Input placeholder="Amount" value={receiveAmount} onChange={(e) => setReceiveAmount(e.target.value)} />
              <p className="text-xs text-primary-500">Amounts must be numeric. Sender should be a username or email.</p>
              <div className="flex space-x-2">
                <Button onClick={() => {
                  const amt = Number(receiveAmount)
                  const isAmountValid = !Number.isNaN(amt) && amt > 0
                  const emailLike = /@/.test(receiveFrom)
                  const usernameLike = /^[a-zA-Z0-9_]{3,30}$/.test(receiveFrom)
                  if (!isAmountValid) return
                  if (!receiveFrom || (!emailLike && !usernameLike)) return
                  setStats((s) => {
                    const current = s || { balance: 0, pendingBalance: 0, totalEarned: 0, totalSpent: 0, rewardPoints: 0, level: 0 }
                    const updated = { ...current, balance: (current.balance || 0) + amt, totalEarned: (current.totalEarned || 0) + amt }
                    persistWallet(currentUser?.id, updated, transactions)
                    return updated
                  })
                  const newTx: Transaction = {
                    id: `tx_${Date.now()}`,
                    type: 'received',
                    amount: amt,
                    description: `Received from ${receiveFrom}`,
                    timestamp: new Date().toISOString(),
                    status: 'completed',
                    from: receiveFrom
                  }
                  setTransactions((t) => {
                    const merged = [newTx, ...t]
                    persistWallet(currentUser?.id, null, merged)
                    return merged
                  })
                  setReceiveAmount('')
                  setReceiveFrom('')
                  setShowReceiveForm(false)
                  setModalContent({ title: 'Received', message: `You received $${amt.toFixed(2)} from ${receiveFrom}` })
                  setShowConfirmModal(true)
                }} className="bg-secondary-600 text-white">Confirm</Button>
                <Button variant="outline" onClick={() => setShowReceiveForm(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && modalContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmModal(false)} />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 z-10"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900">{modalContent.title}</h4>
                  <p className="text-sm text-primary-600">{modalContent.message}</p>
                </div>
              </div>
              <div className="mt-4 text-right">
                <Button onClick={() => setShowConfirmModal(false)} className="px-4">Done</Button>
              </div>
            </motion.div>
          </div>
        )}

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
                    ${stats?.totalEarned?.toFixed(2)}
                  </div>
                  <div className="text-xs text-primary-600">Total Earned</div>
                </div>
              </Card>
              
              <Card className="text-center">
                <div className="space-y-2">
                  <ArrowUpRight className="w-6 h-6 text-red-600 mx-auto" />
                  <div className="text-lg font-bold text-primary-900">
                    ${stats?.totalSpent?.toFixed(2)}
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
                        {tx.type === 'sent' ? '-' : '+'}${tx.amount.toFixed(2)}
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
                        {tx.type === 'sent' ? '-' : '+'}${tx.amount.toFixed(2)}
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
                    <h3 className="text-lg font-bold text-primary-900">User Level {stats?.level}</h3>
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
                  { title: 'Top Earner', description: 'Earn your first 100 credits', points: 200, unlocked: true },
                  { title: 'Pro Member', description: 'Complete 10 projects', points: 500, unlocked: false },
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
      
  {/* Payment flow removed. */}
    </MobileLayout>
  )
}