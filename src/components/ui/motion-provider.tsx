'use client'

import React from 'react'
// import { MotionConfig } from 'framer-motion' // Temporarily disabled for React 19 compatibility

interface MotionProviderProps {
  children: React.ReactNode
  reducedMotion?: boolean
}

export function MotionProvider({ children, reducedMotion }: MotionProviderProps) {
  // Temporarily disabled motion functionality for React 19 compatibility
  return <>{children}</>
}

// Hook to check for reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Performance-optimized motion components (temporarily disabled)
export const createOptimizedMotion = (Component: any) => {
  return React.forwardRef<any, any>((props, ref) => {
    // Remove animation props and return static component
    const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props
    return <Component ref={ref} {...rest} />
  })
}

// Custom hook for intersection-based animations
export function useInViewAnimation(options = {}) {
  const ref = React.useRef<HTMLElement>(null)
  const [isInView, setIsInView] = React.useState(true) // Always in view for now

  return {
    ref,
    isInView: true, // Always in view when animations disabled
    prefersReducedMotion: true
  }
}

// Optimized scroll-triggered animations (temporarily disabled)
export function useScrollAnimation(threshold = 0.1) {
  const { ref, isInView, prefersReducedMotion } = useInViewAnimation({ threshold })

  const variants = React.useMemo(() => {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 }
    }
  }, [])

  return {
    ref,
    variants,
    animate: 'visible',
    initial: 'visible'
  }
}