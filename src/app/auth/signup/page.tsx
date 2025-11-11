"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, AlertCircle, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Auth } from '@/library/auth'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userType, setUserType] = useState<'CLIENT' | 'FREELANCER'>('FREELANCER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, firstName, lastName, userType })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Store session locally for client
      Auth.setSession({
        id: data.id,
        username: data.username,
        email: data.email,
        userType: data.userType,
        isVerified: false,
        firstName: data.firstName || '',
        lastName: data.lastName || ''
      })

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-secondary-600 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Lenno</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600 mb-1">Sign up with your email to get started</p>
          <div className="inline-flex items-center space-x-1 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            <span>Secure • Verified</span>
          </div>
        </div>

        <Card className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

              <div className="flex items-center space-x-2">
              <label className="text-sm">I am a</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value as 'CLIENT' | 'FREELANCER')} className="ml-2 rounded-md border px-2 py-1">
                <option value="FREELANCER">Freelancer</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>

            <Button onClick={handleRegister} className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Signing up...</> : 'Create account'}
            </Button>

            <div className="text-sm text-center text-primary-600">
              Already have an account? <a href="/auth/signin" className="text-secondary-600">Sign in</a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
