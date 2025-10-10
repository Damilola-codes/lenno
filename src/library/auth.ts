// Pi Network Authentication Library
import { prisma } from "./prisma";

export interface PiUserProfile {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  hourlyRate?: number;
  avatar?: string;
  location?: string;
  website?: string;
}

export interface PiUser {
  id: string;
  username: string;
  email: string;
  userType: 'CLIENT' | 'FREELANCER';
  piWalletId: string;
  isVerified: boolean;
  firstName: string;
  lastName: string;
  profile?: PiUserProfile;
}

export interface PiSession {
  user: PiUser;
  expires: string;
}

// Pi Network session management
export class PiAuth {
  private static SESSION_KEY = 'pi-session';
  private static TOKEN_KEY = 'pi-token';

  // Store user session in localStorage/sessionStorage
  static setSession(user: PiUser, token?: string): void {
    if (typeof window !== 'undefined') {
      const session: PiSession = {
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
      }
    }
  }

  // Get current user session
  static getSession(): PiSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session: PiSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date(session.expires) < new Date()) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting Pi session:', error);
      this.clearSession();
      return null;
    }
  }

  // Get current user
  static getCurrentUser(): PiUser | null {
    const session = this.getSession();
    return session?.user || null;
  }

  // Clear session
  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  // Get Pi Network token
  static getPiToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Validate Pi Network user
  static async validatePiUser(piUserId: string): Promise<PiUser | null> {
    try {
      const user = await prisma.user.findFirst({
        where: { piWalletId: piUserId },
        include: { profile: true }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType as 'CLIENT' | 'FREELANCER',
        piWalletId: user.piWalletId || '',
        isVerified: user.isVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        profile: user.profile ? {
          id: user.profile.id,
          userId: user.profile.userId,
          title: user.profile.title ?? undefined,
          description: user.profile.description ?? undefined,
          hourlyRate: user.profile.hourlyRate ?? undefined,
          avatar: user.profile.avatar ?? undefined,
          location: user.profile.location ?? undefined,
          website: user.profile.website ?? undefined
        } : undefined
      };
    } catch (error) {
      console.error('Error validating Pi user:', error);
      return null;
    }
  }

  // Switch user role
  static async switchRole(newRole: 'CLIENT' | 'FREELANCER'): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          piUserId: currentUser.piWalletId,
          currentRole: newRole,
          isExistingUser: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          this.setSession(data.user);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error switching role:', error);
      return false;
    }
  }

  // Sign out
  static signOut(): void {
    this.clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signup';
    }
  }
}

// Authentication configuration for the app
export const authConfig = {
  pages: {
    signIn: "/auth/signup",
    signUp: "/auth/signup"
  }
};

// Utility functions for server-side authentication
export async function getServerSession(): Promise<PiSession | null> {
  // This would be implemented based on your server-side session strategy
  // For now, return null as we're using client-side sessions
  return null;
}
