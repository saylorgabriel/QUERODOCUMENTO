'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const isAdmin = pathname?.startsWith('/admin')

  if (isDashboard || isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <div className="pt-16 lg:pt-20">
        {children}
      </div>
      <Footer />
    </>
  )
}