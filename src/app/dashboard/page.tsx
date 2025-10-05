'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  User,
  TrendingUp,
  Calendar
} from 'lucide-react'
import MobileLayout from '@/components/layout/MobileLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface DashboardStats {
  totalEarnings: number
  pendingPayments: number
  completedJobs: number
  activeProjects: number
  totalJobs: number
  acceptedProposals: number
  monthlyEarnings: number
  weeklyEarnings: number
}

interface RecentActivity {
  id: string
  type: 'job_completed' | 'payment_received' | 'proposal_accepted' | 'job_posted' | 'milestone_completed'
  title: string
  description: string
  amount?: number
  timestamp: string
  status?: string
}

type TimeRange = 'week' | 'month' | 'year'
type UserType = 'CLIENT' | 'FREELANCER'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userType] = useState<UserType>('FREELANCER') // This would come from auth context
  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  useEffect(() => {
    fetchDashboardData()
  }, []) // Only fetch on initial mount

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange)
    // Optionally fetch new data immediately
    // fetchDashboardData() // Uncomment if you want immediate fetch
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch stats
      const statsResponse = await fetch(`/api/dashboard/stats?range=${timeRange}`)
      
      if (!statsResponse.ok) {
        if (statsResponse.status === 400) {
          throw new Error('Invalid request. Please check your account status.')
        } else if (statsResponse.status === 401) {
          throw new Error('Authentication required. Please log in again.')
        } else if (statsResponse.status === 403) {
          throw new Error('Access denied. You may not have permission to view this data.')
        } else if (statsResponse.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(`Error: ${statsResponse.status}`)
        }
      }
      
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch recent activity (mock data for now)
      setRecentActivity([
        {
          id: '1',
          type: 'payment_received',
          title: 'Payment Received',
          description: 'Logo Design Project - Final Payment',
          amount: 150,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'proposal_accepted',
          title: 'Proposal Accepted',
          description: 'Mobile App Development - iOS & Android',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'milestone_completed',
          title: 'Milestone Completed',
          description: 'Website Redesign - Phase 1',
          amount: 75,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-green-600" />
      case 'proposal_accepted':
        return <CheckCircle className="w-4 h-4 text-secondary-600" />
      case 'job_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'job_posted':
        return <FileText className="w-4 h-4 text-primary-600" />
      case 'milestone_completed':
        return <CheckCircle className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-primary-400" />
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

  if (loading) {
    return (
      <MobileLayout>
        <div className="px-4 py-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-primary-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-primary-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-primary-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MobileLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <MobileLayout>
        <div className="px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center p-8">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-error-600" />
            </div>
            <h2 className="text-xl font-semibold text-primary-900 mb-2">
              Dashboard Error
            </h2>
            <p className="text-primary-600 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={fetchDashboardData} 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
          </Card>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Dashboard</h1>
              <p className="text-sm text-primary-600 mt-1">
                {userType === 'CLIENT' ? 'Manage your projects and team' : 'Track your freelance activity'}
              </p>
            </div>
            <LayoutDashboard className="w-8 h-8 text-primary-400" />
          </div>

          {/* Time Range Selector */}
          <div className="flex space-x-1 bg-primary-100 rounded-xl p-1">
            {[
              { key: 'week' as TimeRange, label: 'Week' },
              { key: 'month' as TimeRange, label: 'Month' },
              { key: 'year' as TimeRange, label: 'Year' }
            ].map((range) => (
              <button
                key={range.key}
                onClick={() => handleTimeRangeChange(range.key)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timeRange === range.key
                    ? 'bg-white text-primary-900 shadow-sm'
                    : 'text-primary-600 hover:text-primary-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {userType === 'FREELANCER' ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <Card className="text-center">
                  <div className="space-y-2">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto" />
                    <div className="text-2xl font-bold text-primary-900">
                      π{stats?.totalEarnings?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-primary-600">Total Earnings</div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="text-center">
                  <div className="space-y-2">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto" />
                    <div className="text-2xl font-bold text-primary-900">
                      π{stats?.pendingPayments?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-primary-600">Pending</div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="text-center">
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-secondary-600 mx-auto" />
                    <div className="text-2xl font-bold text-primary-900">
                      {stats?.completedJobs || 0}
                    </div>
                    <div className="text-sm text-primary-600">Completed</div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="text-center">
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-primary-600 mx-auto" />
                    <div className="text-2xl font-bold text-primary-900">
                      {stats?.activeProjects || 0}
                    </div>
                    <div className="text-sm text-primary-600">Active</div>
                  </div>
                </Card>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <Card className="text-center">
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-secondary-600 mx-auto" />
                    <div className="text-2xl font-bold text-primary-900">
                      {stats?.totalJobs || 0}
                    </div>
                    <div className="text-sm text-primary-600">Jobs Posted</div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="text-center">
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                    <div className="text-2xl font-bold text-primary-900">
                      {stats?.acceptedProposals || 0}
                    </div>
                    <div className="text-sm text-primary-600">Proposals</div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="text-center">
                  <div className="space-y-2">
                    <User className="w-8 h-8 text-primary-600 mx-auto" />
                    <div className="text-2xl font-bold text-primary-900">
                      {stats?.activeProjects || 0}
                    </div>
                    <div className="text-sm text-primary-600">Active</div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="text-center">
                  <div className="space-y-2">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto" />
                    <div className="text-2xl font-bold text-primary-900">
                      π{stats?.totalEarnings?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-primary-600">Spent</div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        {/* Earnings Chart (Simplified) */}
        {userType === 'FREELANCER' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900">Earnings Overview</h3>
                  <p className="text-sm text-primary-600">Your performance this {timeRange}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600">This Week</span>
                  <span className="font-semibold text-primary-900">π{stats?.weeklyEarnings?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600">This Month</span>
                  <span className="font-semibold text-primary-900">π{stats?.monthlyEarnings?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="pt-2 border-t border-primary-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary-900">Growth Rate</span>
                    <span className="text-sm font-semibold text-green-600">+12.5%</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-900">Recent Activity</h3>
              <Calendar className="w-6 h-6 text-primary-400" />
            </div>

            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary-900 truncate">
                          {activity.title}
                        </p>
                        {activity.amount && (
                          <span className="text-sm font-semibold text-green-600">
                            π{activity.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-primary-600 truncate">
                          {activity.description}
                        </p>
                        <span className="text-xs text-primary-400">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                  <p className="text-sm text-primary-600">No recent activity</p>
                </div>
              )}
            </div>

            {recentActivity.length > 0 && (
              <div className="mt-4 pt-4 border-t border-primary-200">
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          {userType === 'FREELANCER' ? (
            <>
              <Button 
                onClick={() => window.location.href = '/jobs'}
                className="h-12"
              >
                Browse Jobs
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/proposals'}
                className="h-12"
              >
                My Proposals
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => window.location.href = '/jobs/post'}
                className="h-12"
              >
                Post a Job
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/proposals'}
                className="h-12"
              >
                View Proposals
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </MobileLayout>
  )
}