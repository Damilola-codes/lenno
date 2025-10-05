import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText,
  Search
} from 'lucide-react'
import MobileLayout from '@/components/layout/MobileLayout'
import ProposalCard from '@/components/proposals/ProposalCard'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface Proposal {
  id: string
  jobId: string
  coverLetter: string
  proposedRate: number
  duration?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  freelancer: {
    id: string
    firstName: string
    lastName: string
    username: string
    profile?: {
      avatar?: string
      title?: string
      hourlyRate?: number
    }
  }
  job: {
    title: string
    budget: number
    isHourly: boolean
  }
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userType] = useState<'CLIENT' | 'FREELANCER'>('FREELANCER') // This would come from auth context

  useEffect(() => {
    fetchProposals()
  })

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...(filter !== 'all' && { status: filter.toUpperCase() }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/proposals?${queryParams}`)
      const data = await response.json()
      
      if (response.ok) {
        setProposals(data.proposals || [])
      } else {
        console.error('Failed to fetch proposals:', data.error)
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/accept`, {
        method: 'PUT'
      })

      if (response.ok) {
        // Refresh proposals
        fetchProposals()
        alert('Proposal accepted successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error accepting proposal:', error)
      alert('Failed to accept proposal')
    }
  }

  const handleRejectProposal = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/reject`, {
        method: 'PUT'
      })

      if (response.ok) {
        // Refresh proposals
        fetchProposals()
        alert('Proposal rejected')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error)
      alert('Failed to reject proposal')
    }
  }

  const filterCounts = {
    all: proposals.length,
    pending: proposals.filter(p => p.status === 'PENDING').length,
    accepted: proposals.filter(p => p.status === 'ACCEPTED').length,
    rejected: proposals.filter(p => p.status === 'REJECTED').length
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesFilter = filter === 'all' || proposal.status === filter.toUpperCase()
    const matchesSearch = !searchQuery || 
      proposal.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.freelancer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.freelancer.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">
                {userType === 'CLIENT' ? 'Received Proposals' : 'My Proposals'}
              </h1>
              <p className="text-sm text-primary-600 mt-1">
                {userType === 'CLIENT' 
                  ? 'Review and manage proposals from freelancers'
                  : 'Track your submitted proposals and their status'
                }
              </p>
            </div>
            <FileText className="w-8 h-8 text-primary-400" />
          </div>

          {/* Search */}
          <div className="flex space-x-2">
            <Input
              placeholder={`Search ${userType === 'CLIENT' ? 'freelancers' : 'jobs'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button
              variant="outline"
              onClick={fetchProposals}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-primary-100 rounded-xl p-1">
          {[
            { key: 'all', label: 'All', count: filterCounts.all },
            { key: 'pending', label: 'Pending', count: filterCounts.pending },
            { key: 'accepted', label: 'Accepted', count: filterCounts.accepted },
            { key: 'rejected', label: 'Rejected', count: filterCounts.rejected }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'pending' | 'accepted' | 'rejected')}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === tab.key
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-primary-600 hover:text-primary-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.key 
                ? 'bg-primary-100 text-primary-700'
                : 'bg-primary-200 text-primary-600'
              }`}>
                {tab.count}
              </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats Cards (for clients) */}
        {userType === 'CLIENT' && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary-900">{filterCounts.pending}</div>
                <div className="text-sm text-primary-600">Pending Review</div>
              </div>
            </Card>
            <Card className="text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{filterCounts.accepted}</div>
                <div className="text-sm text-primary-600">Accepted</div>
              </div>
            </Card>
          </div>
        )}

        {/* Proposals List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-primary-200 rounded w-3/4"></div>
                        <div className="h-3 bg-primary-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-primary-200 rounded"></div>
                      <div className="h-3 bg-primary-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredProposals.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProposalCard
                    proposal={proposal}
                    isClient={userType === 'CLIENT'}
                    onAccept={handleAcceptProposal}
                    onReject={handleRejectProposal}
                    onClick={() => {
                      // Handle proposal click - could open detailed view
                      console.log('Proposal clicked:', proposal.id)
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="text-center py-12">
              <div className="text-primary-500 mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                {filter === 'all' ? 'No proposals yet' : `No ${filter} proposals`}
              </h3>
              <p className="text-primary-600 mb-4">
                {userType === 'CLIENT' 
                  ? 'Proposals will appear here when freelancers apply to your jobs.'
                  : filter === 'all' 
                    ? 'Start submitting proposals to jobs that interest you.'
                    : `You don't have any ${filter} proposals yet.`
                }
              </p>
              {userType === 'FREELANCER' && (
                <Button
                  onClick={() => window.location.href = '/jobs'}
                  variant="outline"
                >
                  Browse Jobs
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Quick Actions (floating) */}
        {userType === 'CLIENT' && filterCounts.pending > 0 && (
          <div className="fixed bottom-20 lg:bottom-6 right-4 space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-full shadow-lg border border-primary-200 p-3"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{filterCounts.pending}</div>
                <div className="text-xs text-primary-600">Pending</div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}