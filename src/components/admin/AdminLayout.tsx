'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Menu,
  X,
  ShoppingCart,
  Settings,
  BarChart3,
  Bell,
  LogOut
} from 'lucide-react'

interface Session {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  expires: string
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sessionChecked = useRef(false)

  const checkAdminSession = async () => {
    if (sessionChecked.current) return
    sessionChecked.current = true

    // Don't check session on login page
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/simple-session')
      if (response.ok) {
        const sessionData = await response.json()
        if (sessionData.user?.role !== 'ADMIN') {
          router.push('/dashboard')
          return
        }
        setSession(sessionData)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAdminSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/simple-logout', {
        method: 'POST',
      })

      if (response.ok) {
        window.location.href = '/admin/login'
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando...</p>
        </div>
      </main>
    )
  }

  // For login page, render children without admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navigation = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3, href: '/admin' },
    { id: 'orders', name: 'Pedidos', icon: ShoppingCart, href: '/admin/pedidos' },
    { id: 'users', name: 'Usuários', icon: Users, href: '/admin/usuarios' },
    { id: 'settings', name: 'Configurações', icon: Settings, href: '/admin/configuracoes' },
  ]

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-neutral-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 ease-in-out lg:transform-none lg:static lg:inset-0 lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QD</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-neutral-900">QueroDocumento</h1>
              <p className="text-xs text-red-600">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 sm:p-4">
          <div className="space-y-1 sm:space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <div className="mb-3 p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm font-semibold text-neutral-900 truncate">{session?.user?.name}</p>
            <p className="text-xs text-neutral-600 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors duration-200 w-full justify-center"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button className="p-2 rounded-lg hover:bg-neutral-100 relative">
                <Bell className="w-5 h-5 text-neutral-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
