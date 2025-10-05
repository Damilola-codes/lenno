'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'accent' | 'info'
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
    loading?: boolean
    disabled?: boolean
    onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
    type?: 'button' | 'submit' | 'reset'
    className?: string
}

const variants = {
  primary: 'bg-primary-900 text-white hover:bg-primary-800 active:bg-primary-950 focus:ring-primary-500',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 focus:ring-secondary-400',
  outline: 'border-2 border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white focus:ring-primary-400',
  ghost: 'text-primary-700 hover:bg-primary-100 active:bg-primary-200 focus:ring-primary-300',
  success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700 focus:ring-success-400',
  warning: 'bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 focus:ring-warning-400',
  accent: 'bg-accent-500 text-primary-900 hover:bg-accent-600 active:bg-accent-700 focus:ring-accent-400',
  info: 'bg-info-500 text-white hover:bg-info-600 active:bg-info-700 focus:ring-info-400'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm font-medium',
  md: 'px-4 py-2.5 text-sm font-semibold',
  lg: 'px-6 py-3.5 text-base font-semibold'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none disabled:transform-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}