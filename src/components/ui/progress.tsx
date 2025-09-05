'use client'

import React, { useEffect, useState } from 'react'
// import { motion } from 'framer-motion' // Temporarily disabled for React 19 compatibility
import { CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showPercentage?: boolean
  animated?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  showPercentage = true, 
  animated = true,
  color = 'primary'
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(percentage)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayValue(percentage)
    }
  }, [percentage, animated])

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-success-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        {showPercentage && (
          <span 
            className="text-sm font-medium text-neutral-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {Math.round(displayValue)}%
          </span>
        )}
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-full rounded-full", colorClasses[color])}
          initial={{ width: "0%" }}
          animate={{ width: `${displayValue}%` }}
          transition={{ 
            duration: animated ? 1.5 : 0, 
            ease: "easeOut" 
          }}
        />
      </div>
    </div>
  )
}

interface StepProgressProps {
  steps: {
    id: string
    title: string
    description?: string
    status: 'pending' | 'active' | 'completed' | 'error'
  }[]
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function StepProgress({ steps, orientation = 'horizontal', className }: StepProgressProps) {
  const getStepIcon = (status: string, index: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'active':
        return <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
      default:
        return (
          <Circle 
            className={cn(
              "w-5 h-5",
              status === 'pending' ? "text-neutral-300" : "text-primary-600"
            )} 
          />
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600'
      case 'error': return 'text-red-600'
      case 'active': return 'text-primary-600'
      default: return 'text-neutral-400'
    }
  }

  if (orientation === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-start gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <div className="flex flex-col items-center">
              <div
                className="flex items-center justify-center"
                animate={{ scale: step.status === 'active' ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 2, repeat: step.status === 'active' ? Infinity : 0 }}
              >
                {getStepIcon(step.status, index)}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "w-px h-12 mt-2 transition-colors duration-500",
                    step.status === 'completed' ? "bg-success-200" : "bg-neutral-200"
                  )} 
                />
              )}
            </div>
            <div className="flex-1 pb-8">
              <h3 className={cn("font-medium", getStatusColor(step.status))}>
                {step.title}
              </h3>
              {step.description && (
                <p className="text-sm text-neutral-500 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className="flex flex-col items-center text-center max-w-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <div
              className="flex items-center justify-center mb-2"
              animate={{ scale: step.status === 'active' ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 2, repeat: step.status === 'active' ? Infinity : 0 }}
            >
              {getStepIcon(step.status, index)}
            </div>
            <h3 className={cn("text-sm font-medium", getStatusColor(step.status))}>
              {step.title}
            </h3>
            {step.description && (
              <p className="text-xs text-neutral-500 mt-1">
                {step.description}
              </p>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 px-2">
              <div 
                className={cn(
                  "h-px w-full transition-colors duration-500",
                  step.status === 'completed' ? "bg-success-200" : "bg-neutral-200"
                )}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  thickness?: number
  color?: 'primary' | 'success' | 'warning' | 'error'
  showPercentage?: boolean
  className?: string
}

export function CircularProgress({ 
  value, 
  max = 100, 
  size = 'md', 
  thickness = 4, 
  color = 'primary',
  showPercentage = true,
  className 
}: CircularProgressProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const sizes = {
    sm: { size: 40, fontSize: 'text-xs' },
    md: { size: 64, fontSize: 'text-sm' },
    lg: { size: 96, fontSize: 'text-lg' }
  }

  const colors = {
    primary: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  }

  const { size: svgSize, fontSize } = sizes[size]
  const radius = (svgSize - thickness) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (displayValue / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={svgSize}
        height={svgSize}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={thickness}
          fill="transparent"
          className="text-neutral-200"
        />
        {/* Progress circle */}
        <divcircle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={thickness}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      {showPercentage && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center font-semibold",
          fontSize
        )}>
          <span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {Math.round(displayValue)}%
          </span>
        </div>
      )}
    </div>
  )
}

interface ProcessingStepsProps {
  steps: {
    id: string
    title: string
    description?: string
    duration?: number
  }[]
  currentStep: number
  className?: string
}

export function ProcessingSteps({ steps, currentStep, className }: ProcessingStepsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 text-primary-600"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-lg font-semibold">Processando sua solicitação</span>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isPending = index > currentStep

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border transition-all duration-500",
                isActive && "border-primary-200 bg-primary-50",
                isCompleted && "border-success-200 bg-success-50",
                isPending && "border-neutral-200 bg-neutral-50"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex-shrink-0">
                <React.Fragment mode="wait">
                  {isCompleted && (
                    <div
                      key="completed"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-6 h-6 text-success-600" />
                    </div>
                  )}
                  {isActive && (
                    <div
                      key="active"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                    </div>
                  )}
                  {isPending && (
                    <div
                      key="pending"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Circle className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                </React.Fragment>
              </div>
              
              <div className="flex-1">
                <h3 className={cn(
                  "font-medium transition-colors duration-300",
                  isActive && "text-primary-700",
                  isCompleted && "text-success-700",
                  isPending && "text-neutral-500"
                )}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className={cn(
                    "text-sm mt-1 transition-colors duration-300",
                    isActive && "text-primary-600",
                    isCompleted && "text-success-600",
                    isPending && "text-neutral-400"
                  )}>
                    {step.description}
                  </p>
                )}
              </div>

              {step.duration && isActive && (
                <div className="text-xs text-neutral-500">
                  ~{step.duration}s
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// File upload progress component
interface FileUploadProgressProps {
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
  className?: string
}

export function FileUploadProgress({ 
  fileName, 
  progress, 
  status, 
  error, 
  className 
}: FileUploadProgressProps) {
  return (
    <div
      className={cn("p-4 border rounded-lg", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <React.Fragment mode="wait">
            {status === 'uploading' && (
              <div
                key="uploading"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
              </div>
            )}
            {status === 'completed' && (
              <div
                key="completed"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
            )}
            {status === 'error' && (
              <div
                key="error"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            )}
          </React.Fragment>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {fileName}
            </p>
            <span className="text-sm text-neutral-500">
              {progress}%
            </span>
          </div>
          
          {status !== 'error' && (
            <ProgressBar
              value={progress}
              showPercentage={false}
              color={status === 'completed' ? 'success' : 'primary'}
              className="mb-0"
            />
          )}
          
          {error && (
            <p
              className="text-sm text-red-600 mt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}