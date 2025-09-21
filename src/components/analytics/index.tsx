'use client'

export default function AnalyticsWrapper() {
  // Analytics disabled in development to avoid dependency errors
  // Will be enabled in production deployment
  if (process.env.NODE_ENV !== 'production') {
    return null
  }
  
  return null
}