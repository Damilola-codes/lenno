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
} from 'lucide-react'
import MobileLayout from '@/components/layout/MobileLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Image from 'next/image'

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
    category: string
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  }>
  reviews?: Array<{
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
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (response.ok) {
        setProfile(data.user)
      } else {
        console.error('Failed to fetch profile:', data.error)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        setEditMode(false)
        alert('Profile updated successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    }
  }

  if (loading) {
    return (
      <MobileLayout>
        <div className="px-4 py-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-primary-200 rounded-lg"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
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
          <Card className="text-center py-12">
            <User className="w-12 h-12 mx-auto text-primary-400 mb-4" />
            <h3 className="text-lg font-medium text-primary-900 mb-2">Profile not found</h3>
            <p className="text-primary-600">Unable to load profile data</p>
          </Card>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
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
                className="absolute top-0 right-0 p-2 text-primary-600 hover:text-primary-900 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary-600 to-secondary-500 flex items-center justify-center">
                    {profile.avatar ? (
                      <Image 
                        src={profile.avatar} 
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </span>
                    )}
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
                <div className="space-y-2">
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
                      <p className="text-sm text-primary-500">@{profile.username}</p>
                    </>
                  )}
                </div>

                {/* Quick Stats for Freelancers */}
                {profile.userType === 'FREELANCER' && profile.stats && (
                  <div className="flex items-center justify-center space-x-6 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary-900">{profile.stats.completedJobs}</div>
                      <div className="text-xs text-primary-600">Jobs</div>
                    </div>
                    <div className="w-px h-8 bg-primary-200"></div>
                    <div>
                      <div className="text-lg font-bold text-green-600">π{profile.stats.totalEarnings?.toFixed(0) || 0}</div>
                      <div className="text-xs text-primary-600">Earned</div>
                    </div>
                    <div className="w-px h-8 bg-primary-200"></div>
                    <div>
                      <div className="text-lg font-bold text-primary-900">{profile.stats.successRate}%</div>
                      <div className="text-xs text-primary-600">Success</div>
                    </div>
                  </div>
                )}

                {editMode && (
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-primary-100 rounded-xl p-1">
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
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                  ? 'bg-white text-primary-900 shadow-sm'
                  : 'text-primary-600 hover:text-primary-900'
                }`}
                >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
                </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {activeTab === 'overview' && (
            <>
              {/* Bio */}
              <Card>
                <h3 className="text-lg font-semibold text-primary-900 mb-3">About</h3>
                {editMode ? (
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell clients about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg resize-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-primary-700 leading-relaxed">
                    {profile.bio || 'No bio available. Add a bio to tell clients about yourself.'}
                  </p>
                )}
              </Card>

              {/* Contact Info */}
              <Card>
                <h3 className="text-lg font-semibold text-primary-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary-900">{profile.email}</div>
                      <div className="text-xs text-primary-600">Email</div>
                    </div>
                  </div>

                  {profile.location && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-primary-900">{profile.location}</div>
                        <div className="text-xs text-primary-600">Location</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary-900">
                        Member since {new Date(profile.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-primary-600">Join Date</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Skills for Freelancers */}
              {profile.userType === 'FREELANCER' && profile.skills && profile.skills.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-primary-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          skill.level === 'EXPERT' 
                            ? 'bg-secondary-100 text-secondary-800 border-secondary-300'
                            : skill.level === 'ADVANCED'
                            ? 'bg-primary-100 text-primary-800 border-primary-300'
                            : skill.level === 'INTERMEDIATE'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-primary-100 text-primary-800 border-primary-300'
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Hourly Rate for Freelancers */}
              {profile.userType === 'FREELANCER' && profile.profile?.hourlyRate && (
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900">Hourly Rate</h3>
                      <p className="text-sm text-primary-600">Your standard rate</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        π{profile.profile.hourlyRate}/hr
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {activeTab === 'portfolio' && (
            <Card className="text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto text-primary-400 mb-4" />
              <h3 className="text-lg font-medium text-primary-900 mb-2">Portfolio Coming Soon</h3>
              <p className="text-primary-600 mb-4">
                Showcase your best work to attract clients
              </p>
              <Button variant="outline">
                Add Portfolio Items
              </Button>
            </Card>
          )}

          {activeTab === 'reviews' && (
            <Card className="text-center py-12">
              <Star className="w-12 h-12 mx-auto text-primary-400 mb-4" />
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                {profile.userType === 'FREELANCER' ? 'No reviews yet' : 'Reviews you\'ve given'}
              </h3>
              <p className="text-primary-600">
                {profile.userType === 'FREELANCER' 
                  ? 'Reviews will appear here after completing jobs'
                  : 'Your reviews for freelancers will appear here'
                }
              </p>
            </Card>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <Card>
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-primary-900">Email Notifications</div>
                      <div className="text-sm text-primary-600">Receive updates about your jobs</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-primary-200 peer-focus:ring-4 peer-focus:ring-secondary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-primary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-primary-900">SMS Notifications</div>
                      <div className="text-sm text-primary-600">Get notified via text message</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-primary-200 peer-focus:ring-4 peer-focus:ring-secondary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-primary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-600"></div>
                    </label>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Privacy</h3>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full text-left justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full text-left justify-start">
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full text-left justify-start">
                    Download My Data
                  </Button>
                </div>
              </Card>

              <Card>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
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