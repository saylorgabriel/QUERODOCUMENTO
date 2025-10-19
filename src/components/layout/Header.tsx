'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const pathname = usePathname()
  
  // Check if user is on dashboard page
  const isOnDashboard = pathname.startsWith('/dashboard')

  useEffect(() => {
    // Simple check for session
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/simple-session')
        if (response.ok) {
          const session = await response.json()
          setIsLoggedIn(!!session?.user)
          setUserName(session?.user?.name || '')
        }
      } catch (error) {
        console.log('No session found')
        setIsLoggedIn(false)
        setUserName('')
      }
    }
    checkSession()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/simple-logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        setIsLoggedIn(false)
        setUserName('')
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const menuItems = [
    { label: 'Início', href: '/' },
    { label: 'Como funciona', href: '/#como-funciona' },
    { label: 'Fale conosco', href: '/fale-conosco' },
    { label: 'Blog', href: '/blog' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-soft border-b border-neutral-200/50">
      <div className="container-padded">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-base lg:text-lg">Q</span>
              </div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-neutral-900 to-primary-700 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-accent-600 transition-all duration-300">
                QueroDocumento
              </span>
            </a>
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative text-neutral-600 hover:text-primary-600 font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-primary-50/50 group"
              >
                <span className="relative z-10">{item.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-accent-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </a>
            ))}
          </nav>

          {/* Right Side - Contact & CTA */}
          <div className="hidden lg:flex items-center space-x-6">
            {isLoggedIn ? (
              /* User Menu */
              <div className="flex items-center space-x-4">
                <span className="text-sm text-neutral-600">
                  Olá, <span className="font-semibold">{userName}</span>
                </span>
                {!isOnDashboard && (
                  <>
                    <Link 
                      href="/dashboard"
                      className="btn-primary-sm"
                    >
                      Área do cliente
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-neutral-600 hover:text-red-600 font-medium transition-colors duration-200"
                    >
                      Sair
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Guest Menu */
              <>
                {/* Phone Number */}
                {/* <div className="flex items-center text-neutral-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <div className="text-sm">
                    <p className="text-xs text-neutral-500">Fale conosco</p>
                    <p className="font-semibold">0800-xxx-xxxx</p>
                  </div>
                </div> */}

                {/* Enhanced CTA Button */}
                <Link 
                  href="/auth/login"
                  className="btn-primary-sm relative overflow-hidden group"
                >
                  <span className="relative z-10">Área do cliente</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </>
            )}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <button
            className="lg:hidden p-3 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-300 hover:scale-110"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200/50 py-6 bg-gradient-to-br from-white to-neutral-50/50 backdrop-blur-sm">
            <nav className="flex flex-col space-y-3">
              {menuItems.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-neutral-600 hover:text-primary-600 font-medium py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300 group animate-slide-in-left"
                  style={{animationDelay: `${index * 100}ms`}}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{item.label}</span>
                </a>
              ))}
              
              {/* Mobile User/Contact */}
              <div className="border-t border-neutral-200 pt-4 px-4">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="text-center text-neutral-600">
                      <p className="text-sm">Olá, <span className="font-semibold">{userName}</span></p>
                    </div>
                    {!isOnDashboard && (
                      <>
                        <Link 
                          href="/dashboard"
                          className="btn-primary w-full text-center justify-center"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false)
                            handleLogout()
                          }}
                          className="w-full text-center py-3 px-6 text-red-600 font-medium hover:bg-red-50 rounded-button transition-colors duration-200"
                        >
                          Sair
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Telefone 0800 temporariamente oculto
                    <div className="flex items-center text-neutral-600 mb-4">
                      <Phone className="w-4 h-4 mr-2" />
                      <div className="text-sm">
                        <p className="text-xs text-neutral-500">Fale conosco</p>
                        <p className="font-semibold">0800-xxx-xxxx</p>
                      </div>
                    </div>
                    */}
                    
                    <Link 
                      href="/auth/login"
                      className="btn-primary w-full text-center justify-center relative overflow-hidden group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="relative z-10">Área do cliente</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}