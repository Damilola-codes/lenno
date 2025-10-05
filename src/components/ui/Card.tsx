
import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
}

export default function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick
}: CardProps) {
  const Component = onClick ? motion.div : 'div'
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-primary-200 shadow-sm',
        paddings[padding],
        hover && 'hover:shadow-lg hover:border-secondary-300 transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </Component>
  )
}