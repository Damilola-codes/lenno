import { 
    Clock,  
    User,
    MapPin,
    Tag
} from 'lucide-react'
import { cn, formatCurrency, formatTimeAgo, truncateText } from '@/library/utils'
import Card from '@/components/ui/Card'
import Image from 'next/image'

interface JobCardProps {
  job: {
    id: string
    title: string
    description: string
    budget: number
    isHourly: boolean
    duration?: string
    createdAt: string
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
    client: {
      id: string
      firstName: string
      lastName: string
      username: string
      profile?: {
        avatar?: string
        location?: string
      }
    }
    skills: Array<{
      id: string
      name: string
    }>
    _count: {
      proposals: number
    }
  }
  onClick?: () => void
  className?: string
}

export default function JobCard({ job, onClick, className }: JobCardProps) {
  return (
    <Card
      hover
      onClick={onClick}
      className={cn('space-y-4', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between space-x-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-primary-900 leading-tight hover:text-secondary-600 transition-colors duration-200">
            {truncateText(job.title, 60)}
          </h3>
          <div className="flex items-center space-x-4 mt-2 text-sm text-primary-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-info-500" />
              <span>{formatTimeAgo(job.createdAt)}</span>
            </div>
            {job.client.profile?.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-warning-500" />
                <span>{job.client.profile.location}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Budget */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold text-primary-900">
            {formatCurrency(job.budget)}
          </div>
          <div className="text-xs text-primary-600 font-medium">
            {job.isHourly ? 'per hour' : 'fixed price'}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-primary-700 leading-relaxed">
        {truncateText(job.description, 120)}
      </p>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={skill.id}
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105',
                index % 4 === 0 && 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
                index % 4 === 1 && 'bg-warning-100 text-warning-800 hover:bg-warning-200',
                index % 4 === 2 && 'bg-info-100 text-info-800 hover:bg-info-200',
                index % 4 === 3 && 'bg-accent-100 text-accent-800 hover:bg-accent-200'
              )}
            >
              {skill.name}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-100 text-xs font-medium text-primary-600 hover:bg-primary-200 transition-colors duration-200">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-primary-200">
        {/* Client Info */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full flex items-center justify-center">
            {job.client.profile?.avatar ? (
              <Image
                src={job.client.profile.avatar}
                width={48}
                height={48}
                alt={`${job.client.firstName} ${job.client.lastName}`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-secondary-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-primary-900">
              {job.client.firstName} {job.client.lastName}
            </p>
            <p className="text-xs text-primary-600">@{job.client.username}</p>
          </div>
        </div>

        {/* Proposal Count */}
        <div className="flex items-center space-x-1 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
          <Tag className="w-4 h-4 text-info-500" />
          <span className="font-medium">{job._count.proposals} proposals</span>
        </div>
      </div>

      {/* Duration Badge */}
      {job.duration && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-accent-100 text-xs font-medium text-accent-800 border border-accent-200">
            {job.duration}
          </span>
        </div>
      )}
    </Card>
  )
}