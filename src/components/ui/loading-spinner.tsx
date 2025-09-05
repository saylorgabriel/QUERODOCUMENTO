'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'neutral'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    neutral: 'border-neutral-400 border-t-transparent'
  }

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Enhanced Loading Card Component
interface LoadingCardProps {
  className?: string
  lines?: number
}

export function LoadingCard({ className, lines = 3 }: LoadingCardProps) {
  return (
    <div className={cn('card-modern', className)}>
      <div className="space-y-4">
        <div className="skeleton-wave h-6 rounded-lg w-3/4"></div>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className="skeleton-wave h-4 rounded-lg" 
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    </div>
  )
}

// Page Loading Component
interface PageLoadingProps {
  message?: string
  className?: string
}

export function PageLoading({ message = "Carregando...", className }: PageLoadingProps) {
  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center', className)}>
      <div className="text-center space-y-6">
        <div className="relative">
          <LoadingSpinner size="xl" variant="spinner" color="gradient" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-xl animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-neutral-700">{message}</h2>
          <LoadingDots color="gradient" size="md" />
        </div>
      </div>
    </div>
  )
}

interface LoadingDotsProps {
  color?: 'primary' | 'white' | 'neutral'
  className?: string
}

export function LoadingDots({ color = 'primary', className }: LoadingDotsProps) {
  const colorClasses = {
    primary: 'bg-primary-600',
    white: 'bg-white',
    neutral: 'bg-neutral-400'
  }

  return (
    <div className={cn('flex space-x-1', className)}>
      <div className={cn('w-2 h-2 rounded-full animate-bounce', colorClasses[color])} style={{ animationDelay: '0ms' }}></div>
      <div className={cn('w-2 h-2 rounded-full animate-bounce', colorClasses[color])} style={{ animationDelay: '150ms' }}></div>
      <div className={cn('w-2 h-2 rounded-full animate-bounce', colorClasses[color])} style={{ animationDelay: '300ms' }}></div>
    </div>
  )
}