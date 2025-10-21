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

export default function DashboardClient() {
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
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  useEffect(() => {
    if (dashboardData.protestQueries) {
      filterQueries()
    }
  }, [searchDocument, dashboardData.protestQueries])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/simple-session')
      if (!response.ok) {
        router.push('/auth/login')
        return
      }
      const data = await response.json()
      setSession(data)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
      setTimeout(() => setInitialLoad(false), 100)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/data')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')

      const data = await response.json()

      setDashboardStats({
        consultasRealizadas: data.stats.protestQueriesCount,
        certidoesSolicitadas: data.stats.certificatesCount,
        protestosEncontrados: data.stats.protestsFoundCount,
        documentosProntos: data.stats.completedOrdersCount
      })

      setDashboardData({
        protestQueries: data.protestQueries || [],
        certificates: data.certificates || [],
        orders: data.orders || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const filterQueries = () => {
    if (!searchDocument.trim()) {
      setFilteredQueries(dashboardData.protestQueries)
      return
    }

    const search = searchDocument.toLowerCase().replace(/[^\d]/g, '')
    const filtered = dashboardData.protestQueries.filter((query: any) => {
      const doc = query.document.toLowerCase().replace(/[^\d]/g, '')
      return doc.includes(search)
    })

    setFilteredQueries(filtered)
  }

  const handleChangePassword = () => {
    router.push('/dashboard/change-password')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const statCards = [
    {
      title: 'Consultas Realizadas',
      value: dashboardStats.consultasRealizadas,
      icon: Search,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Certidões Solicitadas',
      value: dashboardStats.certidoesSolicitadas,
      icon: FileText,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Protestos Encontrados',
      value: dashboardStats.protestosEncontrados,
      icon: AlertCircle,
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100'
    },
    {
      title: 'Documentos Prontos',
      value: dashboardStats.documentosProntos,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100'
    }
  ]

  const navigationItems = [
    { id: 'overview', label: 'Visão Geral', icon: FileText },
    // { id: 'consultas', label: 'Consultas de Protesto', icon: Search },
    { id: 'consultas', label: 'Consultas', icon: Search },
    { id: 'certidoes', label: 'Certidões', icon: FileText },
    { id: 'pedidos', label: 'Todos os Pedidos', icon: Clock },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
    { id: 'ajuda', label: 'Ajuda', icon: HelpCircle },
  ]

  return (
    <div className={`min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 transition-opacity duration-500 ${initialLoad ? 'opacity-0' : 'opacity-100'}`}>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-soft">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-64 bg-white border-r border-neutral-200 shadow-soft
          transition-transform duration-300 z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-neutral-200 bg-gradient-to-br from-primary-50 to-accent-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-neutral-900 truncate">{session.user.name}</h2>
                <p className="text-sm text-neutral-600 truncate">{session.user.email}</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group
                  ${activeTab === item.id
                    ? 'bg-gradient-to-r from-primary-500 to-accent-600 text-white shadow-md'
                    : 'text-neutral-600 hover:bg-neutral-100'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${
                  activeTab === item.id
                    ? 'text-white'
                    : 'text-neutral-400 group-hover:text-primary-600'
                }`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 bg-white">
            <LogoutButton className="w-full" />
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Bem-vindo, {session.user.name}!
                </h1>
                <p className="text-neutral-600">
                  Aqui está um resumo das suas atividades
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                  <div
                    key={index}
                    className={`
                      relative overflow-hidden rounded-2xl
                      bg-gradient-to-br ${stat.bgGradient}
                      border border-white/50
                      p-6 shadow-soft hover:shadow-lg
                      transition-all duration-300 hover:scale-105
                      group
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`
                        p-3 rounded-xl bg-gradient-to-br ${stat.gradient}
                        shadow-md group-hover:scale-110 transition-transform duration-300
                      `}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-neutral-900">
                        {dataLoading ? (
                          <span className="inline-block w-16 h-8 bg-neutral-200 rounded animate-pulse" />
                        ) : (
                          stat.value
                        )}
                      </p>
                    </div>
                    <div className={`
                      absolute -bottom-6 -right-6 w-24 h-24
                      bg-gradient-to-br ${stat.gradient}
                      rounded-full opacity-10
                      group-hover:scale-150 transition-transform duration-500
                    `} />
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="/consulta-protesto"
                  className="relative overflow-hidden group
                    bg-gradient-to-br from-primary-500 to-primary-700
                    rounded-2xl p-8 text-white shadow-soft
                    hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
                  "
                >
                  <div className="relative z-10">
                    <Search className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-2xl font-bold mb-2">Nova Consulta</h3>
                    <p className="text-primary-100">
                      Consulte protestos de CPF ou CNPJ
                    </p>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
                </a>

                <a
                  href="/certidao-protesto"
                  className="relative overflow-hidden group
                    bg-gradient-to-br from-accent-500 to-accent-700
                    rounded-2xl p-8 text-white shadow-soft
                    hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
                  "
                >
                  <div className="relative z-10">
                    <FileText className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-2xl font-bold mb-2">Solicitar Certidão</h3>
                    <p className="text-accent-100">
                      Emita certidões de protesto oficiais
                    </p>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
                </a>
              </div>
            </div>
          )}

          {/* Consultas Tab */}
          {activeTab === 'consultas' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Consultas de Protesto
                  </h1>
                  <p className="text-neutral-600">
                    Histórico de consultas realizadas
                  </p>
                </div>
                <a
                  href="/consulta-protesto"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Nova Consulta
                </a>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar por CPF ou CNPJ..."
                  value={searchDocument}
                  onChange={(e) => setSearchDocument(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
              </div>

              {/* Queries List */}
              <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 overflow-hidden">
                {dataLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Carregando consultas...</p>
                  </div>
                ) : filteredQueries.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-2">Nenhuma consulta encontrada</p>
                    <a href="/consulta-protesto" className="text-primary-600 hover:underline">
                      Fazer primeira consulta
                    </a>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200">
                    {filteredQueries.map((query: any, index: number) => (
                      <div
                        key={query.id}
                        className="p-6 hover:bg-neutral-50 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-neutral-900">
                                {query.document}
                              </h3>
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${query.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  query.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'}
                              `}>
                                {query.status === 'COMPLETED' ? 'Concluída' :
                                 query.status === 'PROCESSING' ? 'Processando' :
                                 'Aguardando'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(query.date).toLocaleDateString('pt-BR')}
                              </span>
                              {query.protests !== null && query.protests > 0 && (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <AlertCircle className="w-4 h-4" />
                                  {query.protests} protesto(s) encontrado(s)
                                </span>
                              )}
                            </div>
                          </div>
                          {query.documentUrl && (
                            <a
                              href={query.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary inline-flex items-center justify-center"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certidões Tab */}
          {activeTab === 'certidoes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Certidões
                  </h1>
                  <p className="text-neutral-600">
                    Certidões solicitadas e emitidas
                  </p>
                </div>
                <a
                  href="/certidao-protesto"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Solicitar Certidão
                </a>
              </div>

              <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 overflow-hidden">
                {dataLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Carregando certidões...</p>
                  </div>
                ) : dashboardData.certificates.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-2">Nenhuma certidão solicitada ainda</p>
                    <a href="/certidao-protesto" className="text-primary-600 hover:underline">
                      Solicitar primeira certidão
                    </a>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200">
                    {dashboardData.certificates.map((cert: any, index: number) => (
                      <div
                        key={cert.id}
                        className="p-6 hover:bg-neutral-50 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-neutral-900">
                                {cert.type}
                              </h3>
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${cert.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  cert.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'}
                              `}>
                                {cert.status === 'completed' ? 'Pronta' :
                                 cert.status === 'processing' ? 'Em processamento' :
                                 'Aguardando'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(cert.requestDate).toLocaleDateString('pt-BR')}
                              </span>
                              {cert.document && (
                                <span>
                                  {cert.documentType}: {cert.document}
                                </span>
                              )}
                              {cert.state && cert.city && (
                                <span>
                                  {cert.state} - {cert.city}
                                </span>
                              )}
                            </div>
                          </div>
                          {cert.documentUrl && (
                            <a
                              href={cert.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary inline-flex items-center justify-center"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pedidos Tab */}
          {activeTab === 'pedidos' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Todos os Pedidos
                </h1>
                <p className="text-neutral-600">
                  Histórico completo de pedidos e pagamentos
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 overflow-hidden">
                <OrdersSection orders={dashboardData.orders} loading={dataLoading} />
              </div>
            </div>
          )}

          {/* Perfil Tab */}
          {activeTab === 'perfil' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Meu Perfil
                </h1>
                <p className="text-neutral-600">
                  Gerencie suas informações pessoais
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nome
                  </label>
                  <p className="text-neutral-900">{session.user.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    E-mail
                  </label>
                  <p className="text-neutral-900">{session.user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    CPF/CNPJ
                  </label>
                  <p className="text-neutral-900">{session.user.cpf || session.user.cnpj || 'Não informado'}</p>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <button
                    onClick={handleChangePassword}
                    className="btn-secondary"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ajuda Tab */}
          {activeTab === 'ajuda' && (
            <div className="space-y-6 animate-fade-in max-w-3xl">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Central de Ajuda
                </h1>
                <p className="text-neutral-600">
                  Encontre respostas para suas dúvidas
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: 'Como consultar protestos?',
                    a: 'Acesse "Nova Consulta", informe o CPF ou CNPJ e confirme. Você receberá o resultado em instantes.'
                  },
                  {
                    q: 'Como solicitar uma certidão?',
                    a: 'Clique em "Solicitar Certidão", escolha o tipo (negativa ou positiva), preencha os dados e efetue o pagamento.'
                  },
                  {
                    q: 'Quais formas de pagamento são aceitas?',
                    a: 'Aceitamos PIX, cartão de crédito e boleto bancário.'
                  },
                  {
                    q: 'Quanto tempo leva para receber a certidão?',
                    a: 'Após aprovação do pagamento, a certidão é processada em até 24 horas úteis.'
                  }
                ].map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h3 className="font-semibold text-neutral-900 mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-neutral-600">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 border border-primary-200">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  Ainda precisa de ajuda?
                </h2>
                <p className="text-neutral-600 mb-4">
                  Entre em contato com nossa equipe de suporte
                </p>
                <a
                  href="/fale-conosco"
                  className="btn-primary inline-flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Falar com Suporte
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
