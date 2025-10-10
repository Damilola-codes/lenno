"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User,
  Edit2,
  Settings,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  Shield
} from 'lucide-react'
import MobileLayout from '@/components/layout/MobileLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PiAuth } from '@/library/auth'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
  userType: 'CLIENT' | 'FREELANCER'
  createdAt: string
  profile?: {
    title?: string
    hourlyRate?: number
    availability?: string
    experience?: string
    portfolio?: string[]
    languages?: string[]
    education?: Array<{
      degree: string
      school: string
      year: string
    }>
    certifications?: Array<{
      name: string
      issuer: string
      year: string
    }>
  }
  skills?: Array<{
    id: string
    name: string
    level: string
  }>
  reviews?: Array<{
    id: string
    rating: number
    comment: string
    clientName: string
    jobTitle: string
    createdAt: string
  }>
  stats?: {
    totalJobs: number
    completedJobs: number
    totalEarnings: number
    averageRating: number
    responseTime: number
    successRate: number
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'reviews' | 'settings'>('overview')

  useEffect(() => {
    const user = PiAuth.getCurrentUser()
    if (!user) {
      window.location.href = '/auth/signup'
      return
    }
    fetchProfile()
  }, []) // Remove fetchProfile dependency to avoid hoisting issues

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // For beta, use mock data based on current user
      const user = PiAuth.getCurrentUser()
      if (!user) return
      
      setTimeout(() => {
        setProfile({
          id: user.id,
          firstName: user.username?.split('_')[0] || 'Pioneer',
          lastName: user.username?.split('_')[1] || 'User',
          username: user.username,
          email: user.email || 'pioneer@pi.network',
          userType: user.userType,
          createdAt: new Date().toISOString(),
          location: 'Pi Network',
          bio: `Verified Pi Network pioneer specializing in ${user.userType === 'FREELANCER' ? 'professional services' : 'project management'}`,
          profile: {
            title: user.userType === 'FREELANCER' ? 'Pi Network Freelancer' : 'Pi Network Client',
            hourlyRate: user.userType === 'FREELANCER' ? 25 : undefined,
            availability: 'Available',
            experience: '2+ years in digital marketplace',
          },
          stats: {
            totalJobs: Math.floor(Math.random() * 10) + 1,
            completedJobs: Math.floor(Math.random() * 8) + 1,
            totalEarnings: Math.floor(Math.random() * 1000) + 500,
            averageRating: 4.8,
            responseTime: 2,
            successRate: 95
          }
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEditMode(false)
      // In real app, would make API call to save changes
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  if (loading) {
    return (
      <MobileLayout>
        <div className="px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-primary-200 rounded-xl"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-primary-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (!profile) {
    return (
      <MobileLayout>
        <div className="px-4 py-6">
          <Card>
            <h3 className="text-lg font-medium text-primary-900 mb-2">Profile not found</h3>
            <p className="text-primary-600">Unable to load profile data</p>
          </Card>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="relative">
              {/* Edit Button */}
              <button
                onClick={() => setEditMode(!editMode)}
                className="absolute top-4 right-4 p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 border-2 border-primary-300 flex items-center justify-center group hover:bg-gradient-to-br hover:from-primary-200 hover:to-primary-300 transition-all cursor-pointer">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
                    {/* Upload indicator */}
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all">
                      <span className="text-xs text-primary-700 opacity-0 group-hover:opacity-100 font-medium">Upload</span>
                    </div>
                    {/* Pi Network Verified Badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  {profile.userType === 'FREELANCER' && profile.stats?.averageRating && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 rounded-full">
                        <Star className="w-3 h-3 text-yellow-600 fill-current" />
                        <span className="text-xs font-semibold text-yellow-700">
                          {profile.stats.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
                  {editMode ? (
                    <div className="space-y-2">
                      <Input
                        value={profile.firstName}
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        placeholder="First Name"
                      />
                      <Input
                        value={profile.lastName}
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        placeholder="Last Name"
                      />
                      {profile.userType === 'FREELANCER' && (
                        <Input
                          value={profile.profile?.title || ''}
                          onChange={(e) => setProfile({
                            ...profile, 
                            profile: {...profile.profile, title: e.target.value}
                          })}
                          placeholder="Professional Title"
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <h1 className="text-xl font-bold text-primary-900">
                        {profile.firstName} {profile.lastName}
                      </h1>
                      {profile.profile?.title && (
                        <p className="text-primary-600 font-medium">
                          {profile.profile.title}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-primary-500">@{profile.username}</p>
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                          <Shield className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-green-700">Pi Pioneer</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Quick Stats for Freelancers */}
                {profile.userType === 'FREELANCER' && profile.stats && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-6 text-center w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none">
                      <div className="text-lg font-bold text-primary-900">{profile.stats.completedJobs}</div>
                      <div className="text-xs text-primary-600">Jobs</div>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-primary-200"></div>
                    <div className="flex-1 sm:flex-none">
                      <div className="text-lg font-bold text-primary-900">π{profile.stats.totalEarnings}</div>
                      <div className="text-xs text-primary-600">Earned</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary-900">About</h3>
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="text-xs text-primary-600 hover:text-primary-900 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editMode ? (
                    <div className="space-y-3">
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        placeholder="Tell others about yourself, your skills, and what makes you unique..."
                        className="w-full p-3 border border-primary-300 rounded-lg resize-none h-24 text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all"
                        maxLength={300}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary-500">
                          {(profile.bio || '').length}/300 characters
                        </span>
                        <div className="flex space-x-2">
                          <Button onClick={saveProfile} size="sm">
                            Save
                          </Button>
                          <Button variant="outline" onClick={() => setEditMode(false)} size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setEditMode(true)}
                      className="min-h-[3rem] p-3 rounded-lg border border-primary-200 hover:border-primary-300 cursor-pointer transition-colors group"
                    >
                      <p className="text-sm text-primary-700 leading-relaxed">
                        {profile.bio || (
                          <span className="text-primary-500 italic">
                            Click to add a bio and tell others about yourself...
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="overflow-x-auto">
          <div className="flex space-x-1 bg-primary-100 rounded-xl p-1 min-w-max">
            {[
              { key: 'overview', label: 'Overview', icon: User },
              { key: 'portfolio', label: 'Work', icon: Briefcase },
              { key: 'reviews', label: 'Reviews', icon: Star},
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'overview' | 'portfolio' | 'reviews' | 'settings')}
                  className={`flex-shrink-0 flex items-center justify-center space-x-1 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white text-primary-900 shadow-sm'
                      : 'text-primary-600 hover:text-primary-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stats Cards */}
              {profile.stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary-900">{profile.stats.totalJobs}</div>
                      <div className="text-xs text-primary-600">Total Projects</div>
                    </div>
                  </Card>
                  <Card className="text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600">π{profile.stats.totalEarnings}</div>
                      <div className="text-xs text-primary-600">Total Earned</div>
                    </div>
                  </Card>
                  <Card className="text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-yellow-600">{profile.stats.averageRating.toFixed(1)}</div>
                      <div className="text-xs text-primary-600">Rating</div>
                    </div>
                  </Card>
                  <Card className="text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">{profile.stats.successRate}%</div>
                      <div className="text-xs text-primary-600">Success Rate</div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Contact Info */}
              <Card>
                <h3 className="font-semibold text-primary-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-primary-500" />
                    <span className="text-sm text-primary-700">{profile.email}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-primary-700">{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span className="text-sm text-primary-700">
                      Member since {new Date(profile.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <Card>
              <h3 className="font-semibold text-primary-900 mb-4">Portfolio</h3>
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                <p className="text-primary-600 mb-4">No portfolio items yet</p>
                <Button size="sm">Add Portfolio Item</Button>
              </div>
            </Card>
          )}

          {activeTab === 'reviews' && (
            <Card>
              <h3 className="font-semibold text-primary-900 mb-4">Reviews</h3>
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                <p className="text-primary-600 mb-4">No reviews yet</p>
                <p className="text-sm text-primary-500">Complete your first project to receive reviews</p>
              </div>
            </Card>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-primary-900 mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    Deactivate Account
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </MobileLayout>
  )
}