// Simple client-side session management (generic auth)
import { prisma } from './prisma'

export interface UserProfile {
  id: string
  userId: string
  title?: string
  description?: string
  hourlyRate?: number
  avatar?: string
  location?: string
  website?: string
}

export interface User {
  id: string
  username: string
  email: string
  userType: 'CLIENT' | 'FREELANCER'
  isVerified: boolean
  firstName: string
  lastName: string
  profile?: UserProfile
}

export interface Session {
  user: User
  expires: string
}

// Generic client-side auth helper
export class Auth {
  private static SESSION_KEY = 'auth-session'
  private static TOKEN_KEY = 'auth-token'

  static setSession(user: User, token?: string): void {
    if (typeof window !== 'undefined') {
      const session: Session = {
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      if (token) localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getSession(): Session | null {
    if (typeof window === 'undefined') return null
    try {
      const data = localStorage.getItem(this.SESSION_KEY)
      if (!data) return null
      const session: Session = JSON.parse(data)
      if (new Date(session.expires) < new Date()) {
        this.clearSession()
        return null
      }
      return session
    } catch (error) {
      console.error('Error reading session:', error)
      this.clearSession()
      return null
    }
  }

  static getCurrentUser(): User | null {
    return this.getSession()?.user ?? null
  }

  static clearSession(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.SESSION_KEY)
    localStorage.removeItem(this.TOKEN_KEY)
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }


  static async switchRole(newRole: 'CLIENT' | 'FREELANCER'): Promise<boolean> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return false
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, currentRole: newRole, isExistingUser: true })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          this.setSession(data.user)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error switching role:', error)
      return false
    }
  }

  static signOut(): void {
    this.clearSession()
    if (typeof window !== 'undefined') window.location.href = '/auth/signup'
  }
}

export const authConfig = {
  pages: { signIn: '/auth/signup', signUp: '/auth/signup' }
}

export async function getServerSession(): Promise<Session | null> {
  // Placeholder for server session strategy
  return null
}
