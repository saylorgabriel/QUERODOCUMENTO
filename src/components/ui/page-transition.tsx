'use client'

import React from 'react'
import { motion, React.Fragment } from 'framer-motion' // Temporarily disabled for React 19 compatibility
import { usePathname } from 'next/navigation'
import { useReducedMotion } from './motion-provider'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  const variants = React.useMemo(() => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 }
      }
    }

    return {
      initial: { 
        opacity: 0, 
        y: 20,
        scale: 0.98
      },
      animate: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
          when: "beforeChildren",
          staggerChildren: 0.1
        }
      },
      exit: { 
        opacity: 0,
        y: -10,
        scale: 1.02,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      }
    }
  }, [prefersReducedMotion])

  return (
    <React.Fragment mode="wait">
      <div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        style={{
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      >
        {children}
      </div>
    </React.Fragment>
  )
}

// Specialized page transitions
export function FadeTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <React.Fragment mode="wait">
      <div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={className}
      >
        {children}
      </div>
    </React.Fragment>
  )
}

export function SlideTransition({ 
  children, 
  className, 
  direction = 'right' 
}: PageTransitionProps & { direction?: 'left' | 'right' | 'up' | 'down' }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  const getTransform = (dir: string, isInitial: boolean) => {
    const multiplier = isInitial ? 1 : -1
    switch (dir) {
      case 'left': return { x: -100 * multiplier }
      case 'right': return { x: 100 * multiplier }
      case 'up': return { y: -100 * multiplier }
      case 'down': return { y: 100 * multiplier }
      default: return { x: 100 * multiplier }
    }
  }

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <React.Fragment mode="wait">
      <div
        key={pathname}
        initial={{ 
          opacity: 0, 
          ...getTransform(direction, true)
        }}
        animate={{ 
          opacity: 1, 
          x: 0, 
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }
        }}
        exit={{ 
          opacity: 0, 
          ...getTransform(direction, false),
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 1, 1]
          }
        }}
        className={className}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </div>
    </React.Fragment>
  )
}

export function ScaleTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <React.Fragment mode="wait">
      <div
        key={pathname}
        initial={{ 
          opacity: 0, 
          scale: 0.9,
          filter: 'blur(10px)'
        }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }
        }}
        exit={{ 
          opacity: 0, 
          scale: 1.1,
          filter: 'blur(10px)',
          transition: {
            duration: 0.2,
            ease: [0.4, 0, 1, 1]
          }
        }}
        className={className}
        style={{ willChange: 'transform, opacity, filter' }}
      >
        {children}
      </div>
    </React.Fragment>
  )
}

// Loading transition component
export function LoadingTransition({ 
  isLoading, 
  children, 
  fallback,
  className 
}: {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  const variants = React.useMemo(() => {
    if (prefersReducedMotion) {
      return {
        loading: { opacity: 1 },
        loaded: { opacity: 1 }
      }
    }

    return {
      loading: { 
        opacity: 0.6,
        scale: 0.98,
        filter: 'blur(2px)',
        transition: { duration: 0.2 }
      },
      loaded: { 
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: { 
          duration: 0.4,
          ease: "easeOut",
          when: "beforeChildren",
          staggerChildren: 0.1
        }
      }
    }
  }, [prefersReducedMotion])

  return (
    <React.Fragment mode="wait">
      {isLoading ? (
        <div
          key="loading"
          variants={variants}
          initial="loaded"
          animate="loading"
          exit="loaded"
          className={className}
        >
          {fallback || children}
        </div>
      ) : (
        <div
          key="loaded"
          variants={variants}
          initial="loading"
          animate="loaded"
          className={className}
        >
          {children}
        </div>
      )}
    </React.Fragment>
  )
}

// Route-based transition wrapper
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  
  // Different transitions for different routes
  const getTransitionType = (path: string) => {
    if (path.startsWith('/dashboard')) return 'slide'
    if (path.startsWith('/admin')) return 'scale'
    if (path.startsWith('/consulta-protesto')) return 'fade'
    return 'page'
  }

  const transitionType = getTransitionType(pathname)

  const renderTransition = () => {
    switch (transitionType) {
      case 'slide':
        return <SlideTransition>{children}</SlideTransition>
      case 'scale':
        return <ScaleTransition>{children}</ScaleTransition>
      case 'fade':
        return <FadeTransition>{children}</FadeTransition>
      default:
        return <PageTransition>{children}</PageTransition>
    }
  }

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return renderTransition()
}

// Performance-optimized transition for mobile
export function MobileOptimizedTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  
  // Simpler transitions for mobile to improve performance
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (prefersReducedMotion || isMobile) {
    return (
      <React.Fragment mode="wait">
        <div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </div>
      </React.Fragment>
    )
  }

  return <PageTransition className={className}>{children}</PageTransition>
}