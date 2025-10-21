'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  FileText, 
  Search, 
  Clock, 
  CreditCard, 
  User, 
  Settings, 
  HelpCircle,
  Bell,
  Menu,
  X,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react'
import LogoutButton from '@/components/ui/logout-button'
import OrdersSection from '@/components/dashboard/OrdersSection'

// Real data will be fetched from API

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<any>({
    consultasRealizadas: 0,
    certidoesSolicitadas: 0,
    protestosEncontrados: 0,
    documentosProntos: 0
  })
  const [dashboardData, setDashboardData] = useState<any>({
    protestQueries: [],
    certificates: [],
    orders: []
  })
  const [dataLoading, setDataLoading] = useState(true)
  const [searchDocument, setSearchDocument] = useState('')
  const [filteredQueries, setFilteredQueries] = useState<any[]>([])


  useEffect(() => {
    // Check session on client side only on initial load
    const checkSession = async () => {
      try {
        // Try to get cached session first
        const cachedSession = localStorage.getItem('dashboard-session')
        if (cachedSession) {
          const parsedSession = JSON.parse(cachedSession)
          // Redirect admins to admin panel
          if (parsedSession.user?.role === 'ADMIN') {
            router.push('/admin')
            return
          }
          // Check if cached session is still valid (within 1 hour)
          const cacheTime = localStorage.getItem('dashboard-session-time')
          if (cacheTime && Date.now() - parseInt(cacheTime) < 3600000) {
            // Check if session has phone/cpf data, if not refresh it
            if (!parsedSession.user?.phone && !parsedSession.user?.cpf && !parsedSession.user?.cnpj) {
              console.log('Session missing user data, refreshing...')
              await refreshSession()
              return
            }
            setSession(parsedSession)
            setLoading(false)
            setInitialLoad(false)
            return
          }
        }

        // If no valid cache, fetch from server
        const response = await fetch('/api/auth/simple-session')
        if (response.ok) {
          const sessionData = await response.json()
          // Redirect admins to admin panel
          if (sessionData.user?.role === 'ADMIN') {
            router.push('/admin')
            return
          }
          // If session is missing user data, refresh it
          if (sessionData.user && (!sessionData.user.phone && !sessionData.user.cpf && !sessionData.user.cnpj)) {
            console.log('Session missing user data, refreshing...')
            await refreshSession()
            return
          }
          setSession(sessionData)
          // Cache the session
          localStorage.setItem('dashboard-session', JSON.stringify(sessionData))
          localStorage.setItem('dashboard-session-time', Date.now().toString())
        }
      } catch (error) {
        console.error('Session check failed:', error)
      }
      setLoading(false)
      setInitialLoad(false)
    }

    const refreshSession = async () => {
      try {
        const response = await fetch('/api/auth/refresh-session', {
          method: 'POST'
        })
        if (response.ok) {
          const refreshedSession = await response.json()
          setSession(refreshedSession)
          // Clear old cache and set new one
          localStorage.removeItem('dashboard-session')
          localStorage.removeItem('dashboard-session-time')
          localStorage.setItem('dashboard-session', JSON.stringify(refreshedSession))
          localStorage.setItem('dashboard-session-time', Date.now().toString())
          console.log('Session refreshed successfully')
        }
      } catch (error) {
        console.error('Session refresh failed:', error)
      }
      setLoading(false)
      setInitialLoad(false)
    }
    
    if (initialLoad) {
      checkSession()
    }
  }, [initialLoad])

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const stats = await response.json()
        setDashboardStats(stats)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  // Fetch dashboard data (queries, certificates, orders)
  const fetchDashboardData = async () => {
    try {
      setDataLoading(true)
      const response = await fetch('/api/dashboard/data')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Load data after session is confirmed
  useEffect(() => {
    if (session && !loading) {
      fetchDashboardStats()
      fetchDashboardData()
    }
  }, [session, loading])

  // Filter queries when search or data changes
  useEffect(() => {
    if (searchDocument.trim() === '') {
      setFilteredQueries(dashboardData.protestQueries)
    } else {
      const cleanSearch = searchDocument.replace(/\D/g, '')
      const filtered = dashboardData.protestQueries.filter((query: any) => {
        const cleanDocument = query.document.replace(/\D/g, '')
        return cleanDocument.includes(cleanSearch)
      })
      setFilteredQueries(filtered)
    }
  }, [searchDocument, dashboardData.protestQueries])

  const handleSearchDocument = () => {
    // Filter is already applied via useEffect
    // This function just provides feedback
    if (searchDocument.trim() === '') {
      setFilteredQueries(dashboardData.protestQueries)
    }
  }

  // Format CPF/CNPJ for display
  const formatDocument = (doc: string) => {
    const cleanDoc = doc.replace(/\D/g, '')

    if (cleanDoc.length === 11) {
      // CPF: 000.000.000-00
      return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (cleanDoc.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }

    return doc // Return original if not CPF or CNPJ
  }

  // Initialize tab from URL on first load only
  useEffect(() => {
    if (initialLoad) {
      const tab = searchParams.get('tab')
      if (tab && ['overview', 'orders', 'profile'].includes(tab)) {
        setActiveTab(tab)
      }
    }
  }, [searchParams, initialLoad])


  if (loading && initialLoad) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando...</p>
        </div>
      </main>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  const navigation = [
    { id: 'overview', name: 'Visão Geral', icon: User },
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'orders', name: 'Meus Pedidos', icon: FileText },
    { id: 'queries', name: 'Consultas de Protesto', icon: Search },
    { id: 'certificates', name: 'Certidões', icon: FileText },
    // { id: 'history', name: 'Histórico', icon: Clock },
  ]

  const stats = [
    { name: 'Consultas Realizadas', value: dashboardStats.consultasRealizadas, icon: Search, color: 'blue' },
    { name: 'Certidões Solicitadas', value: dashboardStats.certidoesSolicitadas, icon: FileText, color: 'green' },
    { name: 'Protestos Encontrados', value: dashboardStats.protestosEncontrados, icon: AlertCircle, color: 'orange' },
    { name: 'Documentos Prontos', value: dashboardStats.documentosProntos, icon: CheckCircle, color: 'purple' },
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
          <h1 className="text-lg sm:text-xl font-bold text-primary-600">QueroDocumento</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 min-w-10 min-h-10"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-3 sm:p-4">
          <div className="space-y-1 sm:space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3 rounded-lg text-sm sm:text-sm font-medium transition-colors text-left min-h-12
                    ${
                      activeTab === item.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              )
            })}
          </div>
        </nav>
        
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
          <LogoutButton />
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
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 min-w-10 min-h-10 flex items-center justify-center"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 truncate">
                  Olá, {session?.user?.name || 'Usuário'}!
                </h1>
                <p className="text-sm sm:text-base text-neutral-600 hidden sm:block">Bem-vindo ao seu painel de controle</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button className="p-2 rounded-lg hover:bg-neutral-100 relative min-w-10 min-h-10">
                <Bell className="w-5 h-5 text-neutral-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  const colorClasses = {
                    blue: 'from-blue-500 to-blue-600',
                    green: 'from-green-500 to-green-600',
                    orange: 'from-orange-500 to-orange-600',
                    purple: 'from-purple-500 to-purple-600'
                  }
                  const bgClasses = {
                    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
                    green: 'bg-gradient-to-br from-green-50 to-green-100/50',
                    orange: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
                    purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50'
                  }
                  
                  return (
                    <div key={index} className={`card-modern hover-lift group cursor-pointer ${bgClasses[stat.color as keyof typeof bgClasses]}`}>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-neutral-600 truncate mb-1">{stat.name}</p>
                          <p className="text-2xl sm:text-3xl font-bold text-neutral-900 group-hover:scale-105 transition-transform duration-200">{stat.value}</p>
                        </div>
                      </div>
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )
                })}
              </div>

              {/* Enhanced Quick Actions */}
              <div className="card-modern bg-gradient-to-br from-white to-neutral-50/30">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-neutral-900 to-primary-700 bg-clip-text text-transparent mb-6 sm:mb-8">Ações Rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <a
                    href="/consulta-protesto"
                    className="group p-4 sm:p-6 bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left block min-h-28 sm:min-h-32 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-neutral-900 mb-2 text-sm sm:text-base group-hover:text-primary-700 transition-colors duration-200">Nova Consulta</h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">Consultar protestos por CPF/CNPJ</p>
                    </div>
                  </a>
                  
                  <a 
                    href="/certidao-protesto"
                    className="group p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left block min-h-28 sm:min-h-32 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-neutral-900 mb-2 text-sm sm:text-base group-hover:text-green-700 transition-colors duration-200">Solicitar Certidão</h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">Emitir certidão oficial de protesto</p>
                    </div>
                  </a>
                  
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="group p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left min-h-28 sm:min-h-32 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-neutral-900 mb-2 text-sm sm:text-base group-hover:text-orange-700 transition-colors duration-200">Ver Histórico</h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">Consultas anteriores</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="group p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left min-h-28 sm:min-h-32 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-neutral-900 mb-2 text-sm sm:text-base group-hover:text-purple-700 transition-colors duration-200">Meu Perfil</h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">Gerenciar conta</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Enhanced Recent Activity */}
              <div className="card-modern bg-gradient-to-br from-white to-neutral-50/30">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-neutral-900 to-primary-700 bg-clip-text text-transparent mb-6 sm:mb-8">Atividade Recente</h2>
                {dataLoading ? (
                  <div className="space-y-4 sm:space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-5 sm:p-6 bg-gradient-to-r from-neutral-50 to-neutral-100/50 rounded-2xl">
                        <div className="flex items-center gap-4 sm:gap-5">
                          <div className="skeleton-wave w-12 h-12 sm:w-14 sm:h-14 rounded-xl"></div>
                          <div className="space-y-3">
                            <div className="skeleton-wave h-4 rounded-lg w-36"></div>
                            <div className="skeleton-wave h-3 rounded-lg w-28"></div>
                          </div>
                        </div>
                        <div className="skeleton-wave w-20 h-8 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData.protestQueries.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {dashboardData.protestQueries.slice(0, 3).map((query, index) => (
                      <div key={query.id} className="group p-5 sm:p-6 bg-gradient-to-r from-white to-neutral-50/50 border border-neutral-200/50 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300" style={{animationDelay: `${index * 100}ms`}}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 sm:gap-5">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Search className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900 text-sm sm:text-base mb-1">Consulta de Protesto</p>
                              <p className="text-sm text-neutral-600">{query.documentType}: {formatDocument(query.document)} • {new Date(query.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`status-indicator ${
                              query.protests === null || query.protests === undefined
                                ? 'status-info'
                                : query.protests === 0
                                ? 'status-success'
                                : 'status-warning'
                            }`}>
                              {query.protests === null || query.protests === undefined
                                ? 'Em andamento'
                                : query.protests === 0
                                ? 'Sem protestos'
                                : `${query.protests} protesto(s)`}
                            </span>
                            {query.protests !== null && query.protests !== undefined && (
                              <button className="p-2 sm:p-3 hover:bg-neutral-100 rounded-xl transition-colors duration-200 group-hover:scale-110">
                                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 sm:py-20">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                      <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400" />
                    </div>
                    <p className="text-lg font-medium text-neutral-500 mb-2">Nenhuma atividade recente</p>
                    <p className="text-neutral-400 mb-6">Faça sua primeira consulta para começar</p>
                    <a
                      href="/consulta-protesto"
                      className="btn-primary-sm inline-flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Nova Consulta
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="card-elevated">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Informações da Conta</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                    <div className="input-primary bg-neutral-50 cursor-not-allowed">
                      {session?.user?.name || 'Usuário Demo'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">E-mail</label>
                    <div className="input-primary bg-neutral-50 cursor-not-allowed">
                      {session?.user?.email || 'demo@querodocumento.com'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Telefone</label>
                    <div className="input-primary bg-neutral-50 cursor-not-allowed">
                      {session?.user?.phone || 'Não informado'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">CPF/CNPJ Principal</label>
                    <div className="input-primary bg-neutral-50 cursor-not-allowed">
                      {session?.user?.cpf || session?.user?.cnpj || 'Não informado'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button className="btn-primary">Salvar Alterações</button>
                  <button
                    className="btn-secondary"
                    onClick={() => router.push('/auth/forgot-password')}
                  >
                    Alterar Senha
                  </button>
                </div>
              </div>

              <div className="card-elevated">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Preferências</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-neutral-900">Notificações por E-mail</h3>
                      <p className="text-sm text-neutral-600">Receber atualizações sobre consultas e certidões</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  {/* <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-neutral-900">Notificações por WhatsApp</h3>
                      <p className="text-sm text-neutral-600">Receber atualizações via WhatsApp</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div> */}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">Consultas de Protesto</h2>
                <a href="/consulta-protesto" className="btn-primary">Nova Consulta</a>
              </div>

              <div className="card-elevated">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Filtrar por CPF/CNPJ</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      className="input-primary w-full"
                      placeholder="Digite o CPF ou CNPJ para filtrar"
                      value={searchDocument}
                      onChange={(e) => setSearchDocument(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn-primary"
                    onClick={handleSearchDocument}
                  >
                    Filtrar
                  </button>
                </div>
                {searchDocument && filteredQueries.length === 0 && dashboardData.protestQueries.length > 0 && (
                  <p className="text-sm text-orange-600 mt-2">Nenhuma consulta encontrada para este documento</p>
                )}
                {searchDocument && filteredQueries.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    {filteredQueries.length} consulta{filteredQueries.length > 1 ? 's' : ''} encontrada{filteredQueries.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="card-elevated">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900">Consultas Realizadas</h3>
                  {searchDocument && (
                    <button
                      onClick={() => setSearchDocument('')}
                      className="text-sm text-neutral-600 hover:text-neutral-900"
                    >
                      Limpar filtro
                    </button>
                  )}
                </div>
                {filteredQueries.length > 0 ? (
                  <div className="space-y-4">
                    {filteredQueries.map((query: any) => (
                      <div key={query.id} className="p-4 border border-neutral-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-neutral-900">{query.documentType}: {formatDocument(query.document)}</h4>
                            <p className="text-sm text-neutral-600">{new Date(query.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              query.protests === null || query.protests === undefined
                                ? 'bg-blue-100 text-blue-800'
                                : query.protests === 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {query.protests === null || query.protests === undefined
                                ? 'Em andamento'
                                : query.protests === 0
                                ? 'Sem protestos'
                                : `${query.protests} protesto(s) encontrado(s)`}
                            </span>
                            {query.protests !== null && query.protests !== undefined && (
                              <>
                                <button className="p-2 hover:bg-neutral-100 rounded-lg" title="Ver detalhes">
                                  <Eye className="w-4 h-4 text-neutral-600" />
                                </button>
                                <button className="p-2 hover:bg-neutral-100 rounded-lg" title="Baixar PDF">
                                  <Download className="w-4 h-4 text-neutral-600" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {query.protests > 0 && (
                          <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                            <p className="text-sm text-orange-700 font-medium">Protestos encontrados:</p>
                            <p className="text-sm text-orange-600 mt-1">Detalhes disponíveis no documento PDF</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p>Nenhuma consulta realizada</p>
                    <p className="text-sm mt-2">Faça sua primeira consulta acima</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">Certidões</h2>
                <a href="/certidao-protesto" className="btn-primary">Solicitar Certidão</a>
              </div>

              <div className="grid md:grid-cols-1 gap-6">
                <div className="card-elevated text-center">
                  <FileText className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Certidão de Protesto</h3>
                  <p className="text-neutral-600 mb-4">Certidão oficial que comprova existência ou inexistência de protestos</p>
                  <p className="text-2xl font-bold text-primary-600 mb-4">A partir de R$ 89,90</p>
                  <p className="text-sm text-neutral-500 mb-4">Preço final após orçamento do cartório</p>
                  <a href="/certidao-protesto" className="btn-primary w-full inline-block">Solicitar Certidão</a>
                </div>
              </div>

              <div className="card-elevated">
                <h3 className="text-lg font-semibold text-neutral-900 mb-6">Certidões Solicitadas</h3>
                {dashboardData.certificates.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.certificates.map((cert) => (
                      <div key={cert.id} className="p-4 border border-neutral-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-neutral-900">{cert.type}</h4>
                            <p className="text-sm text-neutral-600">{cert.documentType}: {cert.document} • Solicitado em {new Date(cert.requestDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              cert.status === 'ready'
                                ? 'bg-green-100 text-green-800'
                                : cert.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : cert.status === 'PENDING'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-neutral-100 text-neutral-800'
                            }`}>
                              {cert.status === 'ready' && 'Pronto para download'}
                              {cert.status === 'processing' && 'Em processamento'}
                              {cert.status === 'PENDING' && 'Pendente'}
                            </span>
                            {cert.status === 'ready' && (
                              <button className="p-2 hover:bg-neutral-100 rounded-lg" title="Baixar certidão">
                                <Download className="w-4 h-4 text-neutral-600" />
                              </button>
                            )}
                          </div>
                        </div>
                        {cert.status === 'processing' && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-700">Sua certidão está sendo processada e ficará pronta em até 2 horas úteis.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p>Nenhuma certidão solicitada</p>
                    <p className="text-sm mt-2">Solicite sua primeira certidão acima</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && <OrdersSection />}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-neutral-900">Histórico Completo</h2>

              <div className="card-elevated">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      className="input-primary w-full" 
                      placeholder="Buscar por CPF, CNPJ ou data..." 
                    />
                  </div>
                  <select className="input-primary">
                    <option>Todos os tipos</option>
                    <option>Consultas</option>
                    <option>Certidões</option>
                  </select>
                  <select className="input-primary">
                    <option>Último mês</option>
                    <option>Últimos 3 meses</option>
                    <option>Último ano</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {/* Combined history - queries and certificates */}
                  {[...dashboardData.protestQueries.map(q => ({...q, type: 'query'})), ...dashboardData.certificates.map(c => ({...c, type: 'certificate'}))]
                    .sort((a, b) => new Date((a as any).date || (a as any).requestDate).getTime() - new Date((b as any).date || (b as any).requestDate).getTime())
                    .map((item, index) => (
                      <div key={`${item.type}-${item.id}`} className="p-4 border border-neutral-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              item.type === 'query' 
                                ? 'bg-primary-100 text-primary-600'
                                : 'bg-green-100 text-green-600'
                            }`}>
                              {item.type === 'query' ? (
                                <Search className="w-5 h-5" />
                              ) : (
                                <FileText className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-neutral-900">
                                {item.type === 'query' ? 'Consulta de Protesto' : (item as any).type}
                              </h4>
                              <p className="text-sm text-neutral-600">
                                {(item as any).documentType}: {formatDocument((item as any).document)} • {new Date((item as any).date || (item as any).requestDate).toLocaleDateString('pt-BR')}
                              </p>
                              {item.type === 'certificate' && (
                                <p className="text-sm font-medium text-neutral-900 mt-1">R$ {(item as any).price.toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.type === 'query' ? (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                (item as any).protests === null || (item as any).protests === undefined
                                  ? 'bg-blue-100 text-blue-800'
                                  : (item as any).protests === 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {(item as any).protests === null || (item as any).protests === undefined
                                  ? 'Em andamento'
                                  : (item as any).protests === 0
                                  ? 'Sem protestos'
                                  : `${(item as any).protests} protesto(s)`}
                              </span>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                (item as any).status === 'ready'
                                  ? 'bg-green-100 text-green-800'
                                  : (item as any).status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}>
                                {(item as any).status === 'ready' && 'Pronto'}
                                {(item as any).status === 'processing' && 'Processando'}
                                {(item as any).status === 'PENDING' && 'Pendente'}
                              </span>
                            )}
                            <button className="p-2 hover:bg-neutral-100 rounded-lg">
                              <Download className="w-4 h-4 text-neutral-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}