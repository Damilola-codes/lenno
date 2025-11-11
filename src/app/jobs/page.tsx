"use client"
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter,
  X,
  Loader2
} from 'lucide-react'
import MobileLayout from '@/components/layout/MobileLayout'
import JobCard from '@/components/jobs/JobCard'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useSearchCache } from '@/hooks/useSearchCache'


interface Job {
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [budgetWarning, setBudgetWarning] = useState('') // Warning message
  const [filters, setFilters] = useState({
    minBudget: '',
    maxBudget: '',
    jobType: 'all', // 'all', 'fixed', 'hourly'
    skills: [] as string[]
  })

  // Validate budget range and set warning
  const validateBudgetRange = useCallback((minBudget: string, maxBudget: string) => {
    const minValue = parseInt(minBudget) || 0
    const maxValue = parseInt(maxBudget) || 0
    
    if (minValue > 0 && maxValue > 0 && minValue > maxValue) {
      setBudgetWarning('Minimum budget cannot be higher than maximum budget')
      return false
    } else {
      setBudgetWarning('')
      return true
    }
  }, [])

  // Handle budget validation with warning
  const handleMinBudgetChange = (value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, minBudget: value }
      // Validate after state update
      setTimeout(() => validateBudgetRange(value, prev.maxBudget), 0)
      return newFilters
    })
  }

  const handleMaxBudgetChange = (value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, maxBudget: value }
      // Validate after state update
      setTimeout(() => validateBudgetRange(prev.minBudget, value), 0)
      return newFilters
    })
  }

  // Initialize cache for search results
  const { getCached, setCached, clearCache } = useSearchCache<Job[]>()

  // Create cache key for current search parameters
  const createCacheKey = useCallback((searchQuery: string, filtersObj: typeof filters) => {
    return JSON.stringify({ searchQuery, filters: filtersObj })
  }, [])

  // Fetch jobs with caching - only called manually
  const fetchJobs = useCallback(async (searchTerm: string = '', useCache = true) => {
    const cacheKey = createCacheKey(searchTerm, filters)
    
    // Check cache first
    if (useCache) {
      const cachedResults = getCached(cacheKey)
      if (cachedResults) {
        setJobs(cachedResults)
        setLoading(false)
        setSearchLoading(false)
        return
      }
    }

    try {
      setSearchLoading(true)
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filters.minBudget && { minBudget: filters.minBudget }),
        ...(filters.maxBudget && { maxBudget: filters.maxBudget }),
        ...(filters.jobType !== 'all' && { jobType: filters.jobType }),
        ...(filters.skills.length > 0 && { skills: filters.skills.join(',') })
      })

      const response = await fetch(`/api/jobs?${queryParams}`)
      const data = await response.json()
      
      if (response.ok) {
        const jobsData = data.jobs || []
        setJobs(jobsData)
        
        // Cache the results
        setCached(cacheKey, jobsData)
      } else {
        console.error('Failed to fetch jobs:', data.error)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }, [filters, getCached, setCached, createCacheKey])

  // Initial load - fetch without search term to get all jobs
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/jobs?page=1&limit=20')
        const data = await response.json()
        
        if (response.ok) {
          const jobsData = data.jobs || []
          setJobs(jobsData)
        } else {
          console.error('Failed to fetch jobs:', data.error)
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initialFetch()
  }, []) // Empty dependency array for one-time initial load

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate budget range before searching
    const isValidBudget = validateBudgetRange(filters.minBudget, filters.maxBudget)
    if (!isValidBudget) {
      return // Don't search if budget range is invalid
    }
    
    fetchJobs(searchQuery, false) // Force refresh without cache
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    // Remove automatic loading state since we're not auto-searching
  }

  const applyFilters = () => {
    setShowFilters(false)
    // Don't automatically search, just update filters
    // User needs to click search button to execute the search
  }

  const clearFilters = () => {
    setFilters({
      minBudget: '',
      maxBudget: '',
      jobType: 'all',
      skills: []
    })
    setSearchQuery('')
    setBudgetWarning('')
    clearCache()
    // Don't automatically search, user needs to click search
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">Browse Jobs</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Search jobs, skills, or keywords..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                icon={searchLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              />
            </div>
            <Button 
              type="submit" 
              size="md"
              disabled={searchLoading}
            >
              {searchLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </form>

          {/* Active Filters */}
          {(filters.minBudget || filters.maxBudget || filters.jobType !== 'all' || filters.skills.length > 0) && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-primary-600">Filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.minBudget && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg">
                    Min: ${filters.minBudget}
                  </span>
                )}
                {filters.maxBudget && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg">
                    Max: ${filters.maxBudget}
                  </span>
                )}
                {filters.jobType !== 'all' && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg">
                    {filters.jobType === 'fixed' ? 'Fixed Price' : 'Hourly'}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="px-2 py-1 bg-error-100 text-error-700 rounded-lg hover:bg-error-200"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block">
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-primary-900">Filters</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Min Budget ($)"
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => handleMinBudgetChange(e.target.value)}
                  placeholder="1"
                  min="1"
                />
              </div>
              <div>
                <Input
                  label="Max Budget ($)"
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => handleMaxBudgetChange(e.target.value)}
                  placeholder="10000"
                  min="1"
                />
              </div>
            </div>

            {/* Budget Warning */}
            {budgetWarning && (
              <div className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-lg p-2">
                {budgetWarning}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Job Type
              </label>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Types</option>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={applyFilters} size="sm" fullWidth>
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="space-y-3">
                    <div className="h-6 bg-primary-200 rounded w-3/4"></div>
                    <div className="h-4 bg-primary-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-primary-200 rounded"></div>
                      <div className="h-3 bg-primary-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <JobCard 
                    job={job}
                    onClick={() => {
                      // Handle job click - could open modal or navigate to job page
                      console.log('Job clicked:', job.id)
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="text-center py-12">
              <div className="text-primary-500 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                No jobs found
              </h3>
              <p className="text-primary-600 mb-4">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </Card>
          )}
        </div>

        {/* Mobile Filter Modal */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end">
            <div
              className="fixed inset-0 bg-black/25"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-white rounded-t-2xl p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-primary-400 hover:text-primary-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Min Budget ($)"
                      type="number"
                      value={filters.minBudget}
                      onChange={(e) => handleMinBudgetChange(e.target.value)}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                  <div>
                    <Input
                      label="Max Budget ($)"
                      type="number"
                      value={filters.maxBudget}
                      onChange={(e) => handleMaxBudgetChange(e.target.value)}
                      placeholder="10000"
                      min="1"
                    />
                  </div>
                </div>

                {/* Budget Warning */}
                {budgetWarning && (
                  <div className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-lg p-2">
                    {budgetWarning}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                    className="w-full px-3 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="all">All Types</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={applyFilters} fullWidth>
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline" fullWidth>
                  Clear All
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}