'use client'

import React, { useEffect, useState } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion' // Temporarily disabled for React 19 compatibility
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  duration?: number
  delay?: number
  className?: string
  prefix?: string
  suffix?: string
  formatValue?: (value: number) => string
  decimals?: number
}

export function AnimatedCounter({
  value,
  duration = 2,
  delay = 0,
  className,
  prefix = '',
  suffix = '',
  formatValue,
  decimals = 0
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.3 })
  
  useEffect(() => {
    if (!isInView) return

    let startTimestamp: number
    let startValue = 0
    const endValue = value

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      const currentValue = startValue + (endValue - startValue) * easeOutQuart
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(step)
    }, delay * 1000)

    return () => clearTimeout(timeoutId)
  }, [value, duration, delay, isInView])

  const formatDisplayValue = (val: number) => {
    if (formatValue) {
      return formatValue(val)
    }
    
    const rounded = Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals)
    return rounded.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
      transition={{ duration: 0.6, delay }}
    >
      {prefix}
      {formatDisplayValue(displayValue)}
      {suffix}
    </span>
  )
}

interface AnimatedPercentageProps {
  value: number
  total: number
  duration?: number
  delay?: number
  className?: string
  showBar?: boolean
  barClassName?: string
}

export function AnimatedPercentage({
  value,
  total,
  duration = 2,
  delay = 0,
  className,
  showBar = true,
  barClassName
}: AnimatedPercentageProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.3 })

  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <AnimatedCounter
          value={percentage}
          duration={duration}
          delay={delay}
          suffix="%"
          decimals={1}
          className="text-lg font-semibold"
        />
      </div>
      
      {showBar && (
        <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
          <div
            className={cn("h-full bg-primary-500 rounded-full", barClassName)}
            initial={{ width: "0%" }}
            animate={{ width: isInView ? `${percentage}%` : "0%" }}
            transition={{ duration, delay, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  )
}

interface AnimatedCurrencyProps {
  value: number
  currency?: string
  duration?: number
  delay?: number
  className?: string
  showSymbol?: boolean
}

export function AnimatedCurrency({
  value,
  currency = 'BRL',
  duration = 2,
  delay = 0,
  className,
  showSymbol = true
}: AnimatedCurrencyProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(val)
  }

  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      delay={delay}
      className={className}
      formatValue={showSymbol ? formatCurrency : (val) => val.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    />
  )
}

interface StatsCardProps {
  title: string
  value: number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  prefix?: string
  suffix?: string
  formatValue?: (value: number) => string
  className?: string
  delay?: number
}

export function AnimatedStatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  prefix,
  suffix,
  formatValue,
  className,
  delay = 0
}: StatsCardProps) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.3 })

  return (
    <div
      ref={ref}
      className={cn("card-elevated p-6", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter
              value={value}
              duration={2}
              delay={delay + 0.2}
              prefix={prefix}
              suffix={suffix}
              formatValue={formatValue}
              className="text-2xl font-bold text-neutral-900"
            />
            {trend && (
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-success-600" : "text-red-600"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.8 }}
                transition={{ duration: 0.3, delay: delay + 0.8 }}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {icon && (
          <div
            className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600"
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ 
              opacity: isInView ? 1 : 0, 
              scale: isInView ? 1 : 0.5, 
              rotate: isInView ? 0 : -180 
            }}
            transition={{ duration: 0.5, delay: delay + 0.4, type: "spring" }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

interface CountUpGridProps {
  stats: Array<{
    title: string
    value: number
    prefix?: string
    suffix?: string
    formatValue?: (value: number) => string
    icon?: React.ReactNode
    color?: string
  }>
  className?: string
  staggerDelay?: number
}

export function CountUpGrid({ stats, className, staggerDelay = 0.1 }: CountUpGridProps) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.1 })

  return (
    <div 
      ref={ref}
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}
    >
      {stats.map((stat, index) => (
        <AnimatedStatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          prefix={stat.prefix}
          suffix={stat.suffix}
          formatValue={stat.formatValue}
          icon={stat.icon}
          delay={index * staggerDelay}
          className={stat.color ? `border-l-4 border-${stat.color}` : ''}
        />
      ))}
    </div>
  )
}

// Progress ring with animated counter
interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  className?: string
  showCounter?: boolean
  duration?: number
  delay?: number
}

export function AnimatedProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  className,
  showCounter = true,
  duration = 2,
  delay = 0
}: ProgressRingProps) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.3 })
  
  const percentage = max > 0 ? (value / max) * 100 : 0
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-neutral-200"
        />
        <divcircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          className="text-primary-600"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isInView ? offset : circumference }}
          transition={{ duration, delay, ease: "easeOut" }}
        />
      </svg>
      
      {showCounter && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter
            value={percentage}
            duration={duration}
            delay={delay}
            suffix="%"
            decimals={0}
            className="text-lg font-bold text-neutral-900"
          />
        </div>
      )}
    </div>
  )
}