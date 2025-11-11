import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Send, 
    Clock,
    DollarSign,
    User
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { formatCurrency } from '@/library/utils'

interface Proposal {
    id: string;
    jobId: string;
    coverLetter: string;
    proposedRate: number;
    duration: string;
    milestones: Array<{ title: string; amount: string; description: string }>;
}

interface ProposalFormProps {
  job: {
    id: string
    title: string
    description: string
    budget: number
    isHourly: boolean
    client: {
      firstName: string
      lastName: string
      username: string
    }
  }
  onSubmit: (proposal: Proposal) => void
  onCancel: () => void
}

export default function ProposalForm({ job, onSubmit, onCancel }: ProposalFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedRate: job.isHourly ? '' : job.budget.toString(),
    duration: '',
    milestones: [{ title: '', amount: '', description: '' }]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const proposalData = {
        jobId: job.id,
        coverLetter: formData.coverLetter,
        proposedRate: parseFloat(formData.proposedRate),
        duration: formData.duration,
        milestones: formData.milestones.filter(m => m.title && m.amount)
      }

      // Call API to submit proposal
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposalData)
      })

      if (response.ok) {
        const result = await response.json()
        onSubmit(result.proposal)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting proposal:', error)
      alert('Failed to submit proposal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', amount: '', description: '' }]
    }))
  }

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const updateMilestone = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }))
  }

  const totalMilestoneAmount = formData.milestones.reduce((sum, m) => 
    sum + (parseFloat(m.amount) || 0), 0
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl lg:rounded-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-primary-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary-900">Submit Proposal</h2>
            <button
              onClick={onCancel}
              className="text-primary-400 hover:text-primary-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Info */}
          <Card className="bg-primary-50">
            <div className="space-y-3">
              <h3 className="font-semibold text-primary-900">{job.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-primary-600">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatCurrency(job.budget)} {job.isHourly ? 'per hour' : 'fixed'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{job.client.firstName} {job.client.lastName}</span>
                </div>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Cover Letter *
              </label>
              <textarea
                value={formData.coverLetter}
                onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                placeholder="Explain why you're the perfect fit for this job..."
                rows={6}
                className="w-full px-3 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                required
              />
              <p className="text-xs text-primary-500 mt-1">
                {formData.coverLetter.length}/1000 characters
              </p>
            </div>

            {/* Rate & Duration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label={`Proposed Rate ($) ${job.isHourly ? 'per hour' : 'total'} *`}
                type="number"
                step="0.01"
                value={formData.proposedRate}
                onChange={(e) => setFormData(prev => ({ ...prev, proposedRate: e.target.value }))}
                placeholder="0.00"
                icon={<DollarSign className="w-4 h-4" />}
                required
              />
              <Input
                label="Estimated Duration *"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 2 weeks, 1 month"
                icon={<Clock className="w-4 h-4" />}
                required
              />
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-primary-900">Project Milestones (Optional)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMilestone}
                >
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-4">
                {formData.milestones.map((milestone, index) => (
                  <Card key={index} className="bg-primary-50">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-primary-700">Milestone {index + 1}</h4>
                        {formData.milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMilestone(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <Input
                          placeholder="Milestone title"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        />
                        <Input
                          placeholder="Amount ($)"
                          type="number"
                          step="0.01"
                          value={milestone.amount}
                          onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                        />
                      </div>

                      <textarea
                        placeholder="Milestone description..."
                        rows={2}
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none text-sm"
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {totalMilestoneAmount > 0 && (
                <div className="text-sm text-primary-600">
                  Total milestone amount: {formatCurrency(totalMilestoneAmount)}
                  {parseFloat(formData.proposedRate) !== totalMilestoneAmount && (
                    <span className="text-orange-600 ml-2">
                      (Doesn&apos;t match proposed rate)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Proposal Summary */}
            <Card className="bg-gradient-to-r from-secondary-50 to-primary-50">
              <div className="space-y-2">
                <h3 className="font-medium text-primary-900">Proposal Summary</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-primary-600">Total Amount:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(formData.proposedRate) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Platform Fee (8%):</span>
                    <span className="font-medium">
                      {formatCurrency((parseFloat(formData.proposedRate) || 0) * 0.08)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-primary-200">
                    <span className="font-medium text-primary-900">You&apos;ll Receive:</span>
                    <span className="font-bold text-secondary-700">
                      {formatCurrency((parseFloat(formData.proposedRate) || 0) * 0.92)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                fullWidth
                className="relative"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Proposal
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}