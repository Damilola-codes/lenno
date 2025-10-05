"use client"
import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  User,
  FileText,
  Wallet,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Browse Jobs', href: '/jobs', icon: Search },
  { name: 'My Proposals', href: '/proposals', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
]

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-primary-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-primary-600 hover:text-primary-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/" className="text-xl font-bold text-black">
            Lenno
          </Link>
          
          <Link href="/wallet" className="p-2 text-primary-600 hover:text-primary-900">
            <Wallet className="w-6 h-6" />
          </Link>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-primary-200">
          <div className="flex items-center flex-shrink-0 px-6 py-4">
            <Link href="/" className="text-2xl font-bold text-black">
              Lenno
            </Link>
          </div>
          <nav className="flex-1 px-4 pb-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-black text-white'
                      : 'text-primary-600 hover:bg-primary-100 hover:text-primary-900'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/25"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="relative flex w-full max-w-xs flex-col bg-white"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
              <Link href="/" className="text-xl font-bold text-black">
                Lenno
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-primary-400 hover:text-primary-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-black text-white'
                        : 'text-primary-600 hover:bg-primary-100 hover:text-primary-900'
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="min-h-screen pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-primary-200">
        <div className="flex">
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center px-1 py-3 text-xs font-medium transition-colors duration-200',
                  isActive
                    ? 'text-black'
                    : 'text-primary-400 hover:text-primary-600'
                )}
              >
                <item.icon className="w-6 h-6 mb-1" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}