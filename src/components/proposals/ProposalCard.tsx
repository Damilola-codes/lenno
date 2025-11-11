import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Check, X, Clock, Wallet, User, Calendar, FileText } from 'lucide-react'
import { formatCurrency, formatTimeAgo, truncateText } from '@/library/utils'
import Image from 'next/image'

interface ProposalCardProps {
  proposal: {
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
    job?: {
      title: string
      budget: number
      isHourly: boolean
    }
  }
  isClient?: boolean
  onAccept?: (proposalId: string) => void
  onReject?: (proposalId: string) => void
  onClick?: () => void
}

export default function ProposalCard({ 
  proposal, 
  isClient = false, 
  onAccept, 
  onReject, 
  onClick 
}: ProposalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <Check className="w-3 h-3" />
      case 'REJECTED': return <X className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  return (
    <Card hover onClick={onClick} className="space-y-4 relative">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
          {getStatusIcon(proposal.status)}
          <span className="capitalize">{proposal.status.toLowerCase()}</span>
        </span>
      </div>

      {/* Header */}
      <div className="space-y-3 pr-20">
        {/* Job Title (if showing freelancer's proposals) */}
        {!isClient && proposal.job && (
          <div>
            <h3 className="font-semibold text-primary-900 leading-tight">
              {proposal.job.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1 text-sm text-primary-500">
              <Wallet className="w-4 h-4" />
              <span>
                Budget: {formatCurrency(proposal.job.budget)}
                {proposal.job.isHourly ? ' per hour' : ' fixed'}
              </span>
            </div>
          </div>
        )}

        {/* Freelancer Info (if showing client's received proposals) */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
            {proposal.freelancer.profile?.avatar ? (
              <Image
                src={proposal.freelancer.profile.avatar}
                alt={`${proposal.freelancer.firstName} ${proposal.freelancer.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-primary-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-primary-900">
              {proposal.freelancer.firstName} {proposal.freelancer.lastName}
            </h4>
            <div className="flex items-center space-x-3 text-sm text-primary-500">
              <span>@{proposal.freelancer.username}</span>
              {proposal.freelancer.profile?.title && (
                <>
                  <span>•</span>
                  <span>{proposal.freelancer.profile.title}</span>
                </>
              )}
            </div>
            {proposal.freelancer.profile?.hourlyRate && (
              <div className="text-xs text-primary-500">
                Usually {formatCurrency(proposal.freelancer.profile.hourlyRate)}/hr
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proposal Details */}
      <div className="space-y-3">
        {/* Rate and Duration */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <Wallet className="w-4 h-4 text-primary-500" />
            <span className="font-medium text-primary-900">
              {formatCurrency(proposal.proposedRate)}
            </span>
            <span className="text-primary-500">
              {proposal.job?.isHourly ? 'per hour' : 'total'}
            </span>
          </div>
          
          {proposal.duration && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span className="text-primary-600">{proposal.duration}</span>
            </div>
          )}
        </div>

        {/* Cover Letter Preview */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700">Cover Letter</span>
          </div>
          <p className="text-sm text-primary-600 leading-relaxed">
            {truncateText(proposal.coverLetter, 150)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-primary-100">
        <div className="flex items-center space-x-1 text-xs text-primary-500">
          <Clock className="w-4 h-4" />
          <span>Submitted {formatTimeAgo(proposal.createdAt)}</span>
        </div>

        {/* Action Buttons (for clients) */}
        {isClient && proposal.status === 'PENDING' && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onReject?.(proposal.id)
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onAccept?.(proposal.id)
              }}
            >
              Accept
            </Button>
          </div>
        )}
      </div>

      {/* Net Earnings Info */}
      {!isClient && (
        <div className="bg-gradient-to-r from-secondary-50 to-primary-50 p-3 rounded-xl">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-primary-600">Proposed Amount:</span>
              <span>{formatCurrency(proposal.proposedRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-600">Platform Fee (8%):</span>
              <span>-{formatCurrency(proposal.proposedRate * 0.08)}</span>
            </div>
            <div className="flex justify-between font-medium text-secondary-700 pt-1 border-t border-primary-200">
              <span> You&apos;ll Receive: </span>
              <span>{formatCurrency(proposal.proposedRate * 0.92)}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}