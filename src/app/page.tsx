'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Users, 
  Shield,
  ArrowRight,
  Globe,
  Sparkles,
  Rocket,
  Lock,
  Zap,
  Star,
  DollarSign,
  ShieldCheck
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import PiDebugInfo from '@/components/debug/PiDebugInfo'

export default function HomePage() {
  const router = useRouter()
  const [piUser, setPiUser] = useState<{ uid: string; username: string } | null>(null)

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('piUser')
    if (savedUser) {
      try {
        setPiUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('piUser')
      }
    }

    // Load Pi SDK
    const script = document.createElement('script')
    script.src = 'https://sdk.minepi.com/pi-sdk.js'
    script.onload = () => {
      if (window.Pi) {
        // Explicitly force sandbox mode for development
        const sandboxMode = true // Always use sandbox during development
        
        console.log('Initializing Pi SDK with sandbox mode:', sandboxMode)
        console.log('Current hostname:', window.location.hostname)
        console.log('Environment:', process.env.NODE_ENV)
        
        window.Pi.init({ 
          version: "2.0",
          sandbox: sandboxMode
        })
        
        console.log('Pi SDK initialized successfully in sandbox mode')
      }
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const handleGetStarted = () => {
    if (piUser) {
      router.push('/dashboard')
    } else {
      router.push('/auth/signup')
    }
  }

  const handleBrowseJobs = () => {
    router.push('/jobs')
  }

  const handleLogout = () => {
    localStorage.removeItem('piUser')
    setPiUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Debug Info - Development Only */}
      <PiDebugInfo />
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-900 to-secondary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">π</span>
              </div>
              <span className="text-xl font-bold text-primary-900">Lenno</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBrowseJobs}
                className="hidden sm:flex"
              >
                Browse Jobs
              </Button>
              {piUser ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 hidden sm:block">
                    Welcome, {piUser.username}
                  </span>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={handleLogout}
                    className="hidden sm:flex"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/auth/signin')}
                  >
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="bg-green-400 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Powered by Pi Network</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-900 mb-6 leading-tight">
              Where Talent Meets{' '}
              <span className="bg-purple-600 bg-clip-text text-transparent">
                Tomorrow&apos;s Currency
              </span>
            </h1>
            
            <p className="text-xl text-primary-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Lenno isn&apos;t just another freelance platform. We&apos;re building the future of work with Pi Network - 
              where your skills directly convert to cryptocurrency that&apos;s already in millions of hands worldwide.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto text-sm">
              <div className="flex items-center justify-center space-x-2 bg-secondary-50 text-secondary-800 px-4 py-2 rounded-lg border border-secondary-200 hover:border-secondary-300 transition-all duration-300">
                <Rocket className="w-4 h-4 font-semibold" />
                <span>Zero traditional fees</span>
              </div>
              <div className="flex items-center justify-center space-x-2 bg-warning-50 text-warning-800 px-4 py-2 rounded-lg border border-warning-200 hover:border-warning-300 transition-all duration-300">
                <Lock className="w-4 h-4 font-semibold" />
                <span>Pioneer-verified talent</span>
              </div>
              <div className="flex items-center justify-center space-x-2 bg-info-50 text-info-800 px-4 py-2 rounded-lg border border-info-200 hover:border-info-300 transition-all duration-300">
                <Zap className="w-4 h-4 font-semibold" />
                <span>Instant Pi payments</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleGetStarted}
                className="text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="w-5 h-5 mr-2" />
                Start Earning Pi
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleBrowseJobs}
                className="hover:bg-primary-900 hover:text-white transition-all duration-300"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Explore Opportunities
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-secondary-50 to-accent-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary-900 mb-4">
              Why Lenno is Different
            </h2>
            <p className="text-lg text-primary-600 max-w-2xl mx-auto">
              Traditional freelance platforms take 20% fees and pay in yesterday&apos;s money. 
              We&apos;re building tomorrow&apos;s economy today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-secondary-200 hover:border-secondary-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-3 text-center">Pioneer Ecosystem</h3>
              <p className="text-primary-600 text-center leading-relaxed">
                Access 47+ million Pi Network pioneers worldwide. Your clients aren&apos;t just customers - 
                they&apos;re fellow builders of the decentralized future.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-warning-200 hover:border-warning-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-warning-100 to-warning-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-3 text-center">Fair Economics</h3>
              <p className="text-primary-600 text-center leading-relaxed">
                No more 20% platform fees eating your earnings. Keep what you earn while building 
                wealth in a cryptocurrency with real utility and growing adoption.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-info-200 hover:border-info-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-info-100 to-info-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-info-600" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-3 text-center">Trust & Security</h3>
              <p className="text-primary-600 text-center leading-relaxed">
                Every user is Pi-verified through KYC. No fake profiles, no payment disputes, 
                no wondering if you&apos;ll get paid. Built on trust from day one.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-primary-900 mb-2">
              Growing Fast, Building Strong
            </h2>
            <p className="text-primary-600">Real numbers from a platform that&apos;s changing how people work</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center bg-gradient-to-br from-secondary-50 to-secondary-100 p-6 rounded-xl border border-secondary-200 hover:border-secondary-300 transition-all duration-300"
            >
              <div className="text-3xl font-bold text-secondary-700 mb-2">47M+</div>
              <div className="text-sm font-medium text-secondary-800">Pi Network Pioneers</div>
              <div className="text-xs text-secondary-600 mt-1">Ready to hire & work</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center bg-gradient-to-br from-warning-50 to-warning-100 p-6 rounded-xl border border-warning-200 hover:border-warning-300 transition-all duration-300"
            >
              <div className="text-3xl font-bold text-warning-700 mb-2">0%</div>
              <div className="text-sm font-medium text-warning-800">Platform Fees</div>
              <div className="text-xs text-warning-600 mt-1">Keep 100% of earnings</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center bg-gradient-to-br from-info-50 to-info-100 p-6 rounded-xl border border-info-200 hover:border-info-300 transition-all duration-300"
            >
              <div className="text-3xl font-bold text-info-700 mb-2">100%</div>
              <div className="text-sm font-medium text-info-800">KYC Verified</div>
              <div className="text-xs text-info-600 mt-1">Every user authenticated</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center bg-gradient-to-br from-accent-50 to-accent-100 p-6 rounded-xl border border-accent-200 hover:border-accent-300 transition-all duration-300"
            >
              <div className="text-3xl font-bold text-accent-700 mb-2">24/7</div>
              <div className="text-sm font-medium text-accent-800">Global Marketplace</div>
              <div className="text-xs text-accent-600 mt-1">Work across time zones</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary-900 mb-4">
              The Future of Freelancing is Here
            </h2>
            <p className="text-primary-600 max-w-3xl mx-auto text-lg">
              While others charge fees and pay in fiat, we&apos;re building an ecosystem where 
              talent is rewarded with tomorrow&apos;s currency - today.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="text-center p-8 h-full border border-secondary-200 hover:border-secondary-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-secondary-50">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-primary-900">Cryptocurrency-First</h3>
                <p className="text-primary-600 leading-relaxed">
                  Get paid in Pi - a cryptocurrency with 47+ million users and growing utility. 
                  Your earnings appreciate as the ecosystem expands.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="text-center p-8 h-full border border-warning-200 hover:border-warning-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-warning-50">
                <div className="w-16 h-16 bg-gradient-to-br from-warning-100 to-warning-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-warning-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-primary-900">Pioneer Community</h3>
                <p className="text-primary-600 leading-relaxed">
                  Connect with verified Pi pioneers who understand the value of decentralized work. 
                  No fake accounts, no payment chargebacks.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="text-center p-8 h-full border border-info-200 hover:border-info-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-info-50">
                <div className="w-16 h-16 bg-gradient-to-br from-info-100 to-info-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-info-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-primary-900">Global & Instant</h3>
                <p className="text-primary-600 leading-relaxed">
                  Work with clients worldwide with instant Pi transactions. No waiting for bank transfers 
                  or worrying about exchange rates.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-primary-900 to-secondary-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Join the Pi Economy?
            </h2>
            <p className="text-primary-300 text-lg mb-8 max-w-2xl mx-auto">
              Whether you&apos;re a skilled freelancer or a client with ambitious projects, 
              Lenno connects you with the Pi pioneer community that&apos;s building tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                className="bg-white text-primary-900 hover:bg-primary-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Pi Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={handleBrowseJobs}
              >
                Explore Opportunities
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">π</span>
            </div>
            <span className="text-lg font-semibold">Lenno</span>
          </div>
          <p className="text-primary-400 mb-4">
            The first freelance marketplace powered by Pi Network
          </p>
          <div className="text-sm text-primary-500">
            © 2025 Lenno. Built for Pi Network Pioneers.
          </div>
        </div>
      </footer>
    </div>
  )
}