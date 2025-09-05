'use client'

import React from 'react'
import { motion } from 'framer-motion' // Temporarily disabled for React 19 compatibility
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
  animate?: boolean
}

export function Skeleton({ className, children, animate = true }: SkeletonProps) {
  const baseClasses = "rounded-md bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200px_100%]"
  
  return (
    <div 
      className={cn(
        baseClasses,
        animate && "animate-skeleton",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      {children}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Card skeleton with consistent structure
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div 
      className={cn("card-elevated p-6", className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

// List item skeleton
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div 
      className={cn("flex items-center gap-4 p-4 border-b border-neutral-200", className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-20 h-8 rounded-md" />
    </div>
  )
}

// Form field skeleton
export function SkeletonFormField({ className }: { className?: string }) {
  return (
    <div 
      className={cn("space-y-2", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}

// Stats card skeleton
export function SkeletonStats({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className="card-elevated p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-2 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Table row skeleton
export function SkeletonTableRow({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <tr 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Dashboard skeleton with multiple components
export function SkeletonDashboard() {
  return (
    <div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Stats */}
      <SkeletonStats />
      
      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}

// Form skeleton with multiple fields
export function SkeletonForm({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div 
      className={cn("space-y-6", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1, ease: "easeOut" }}
        >
          <SkeletonFormField />
        </div>
      ))}
      
      {/* Action buttons */}
      <div className="flex justify-between pt-6 border-t border-neutral-200">
        <Skeleton className="h-12 w-24 rounded-lg" />
        <Skeleton className="h-12 w-32 rounded-lg" />
      </div>
    </div>
  )
}

// Consultation results skeleton
export function SkeletonResults() {
  return (
    <div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Results header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      
      {/* Results cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i}
            className="card-elevated p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.15, ease: "easeOut" }}
          >
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <Skeleton className="w-24 h-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <Skeleton className="h-12 w-32 rounded-lg" />
        <Skeleton className="h-12 w-40 rounded-lg" />
      </div>
    </div>
  )
}