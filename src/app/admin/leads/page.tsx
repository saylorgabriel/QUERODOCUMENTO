'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Plus, Eye, Edit2, BarChart3, TrendingUp, Users, Target, Mail, Phone } from 'lucide-react'

interface Lead {
  id: string
  documentNumber: string
  name: string
  phone?: string
  email?: string
  status: string
  stage: string
  score: number
  source?: string
  consultations: number
  converted: boolean
  createdAt: string
  lastActivity: string
  user?: {
    id: string
    name: string
    email: string
  }
  _count: {
    consultations_records: number
  }
}

interface LeadStats {
  total: number
  averageScore: number
  conversion: {
    converted: number
    notConverted: number
  }
  byStatus: Record<string, number>
  byStage: Record<string, number>
}

interface LeadsResponse {
  leads: Lead[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: LeadStats
}

const statusLabels = {
  NEW: 'Novo',
  CONTACTED: 'Contatado',
  QUALIFIED: 'Qualificado',
  CONVERTED: 'Convertido',
  LOST: 'Perdido',
  UNSUBSCRIBED: 'Descadastrado'
}

const stageLabels = {
  FORM_FILLED: 'Formulário',
  CONSULTATION: 'Consulta',
  QUOTE_REQUESTED: 'Orçamento',
  PAYMENT_STARTED: 'Pagamento',
  CUSTOMER: 'Cliente'
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  CONVERTED: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
  UNSUBSCRIBED: 'bg-gray-100 text-gray-800'
}

const stageColors = {
  FORM_FILLED: 'bg-slate-100 text-slate-800',
  CONSULTATION: 'bg-blue-100 text-blue-800',
  QUOTE_REQUESTED: 'bg-orange-100 text-orange-800',
  PAYMENT_STARTED: 'bg-purple-100 text-purple-800',
  CUSTOMER: 'bg-green-100 text-green-800'
}

export default function LeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [page, setPage] = useState(1)
  
  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (stageFilter) params.set('stage', stageFilter)
      if (sourceFilter) params.set('source', sourceFilter)
      params.set('page', page.toString())
      params.set('limit', '20')

      const response = await fetch(`/api/admin/leads?${params}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      } else {
        console.error('Failed to fetch leads:', result.error)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [search, statusFilter, stageFilter, sourceFilter, page])

  const updateLeadStatus = async (leadId: string, status: string, stage?: string) => {
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          leadId,
          status,
          stage
        })
      })

      if (response.ok) {
        fetchLeads() // Refresh data
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const exportLeads = () => {
    if (!data?.leads) return
    
    const csvContent = [
      ['Nome', 'CPF/CNPJ', 'Telefone', 'Email', 'Status', 'Etapa', 'Score', 'Fonte', 'Criado em'].join(','),
      ...data.leads.map(lead => [
        lead.name,
        lead.documentNumber,
        lead.phone || '',
        lead.email || '',
        statusLabels[lead.status as keyof typeof statusLabels],
        stageLabels[lead.stage as keyof typeof stageLabels],
        lead.score,
        lead.source || '',
        new Date(lead.createdAt).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-blue-600 bg-blue-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Leads</h1>
          <p className="text-gray-600 mt-1">Acompanhe e gerencie suas leads de remarketing</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportLeads}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => setShowLeadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Lead
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.stats.total > 0 
                    ? Math.round((data.stats.conversion.converted * 100) / data.stats.total)
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Médio</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.averageScore}/100</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Convertidas</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.conversion.converted}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-primary pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-primary"
          >
            <option value="">Todos os Status</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="input-primary"
          >
            <option value="">Todas as Etapas</option>
            {Object.entries(stageLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Fonte (ex: landing_page)"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="input-primary"
          />

          <button 
            onClick={() => {
              setSearch('')
              setStatusFilter('')
              setStageFilter('')
              setSourceFilter('')
              setPage(1)
            }}
            className="btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Limpar
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Etapa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.documentNumber}
                      </div>
                      {lead.source && (
                        <div className="text-xs text-gray-400">
                          {lead.source}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {lead.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-1" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {lead.email}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${statusColors[lead.status as keyof typeof statusColors]}`}
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${stageColors[lead.stage as keyof typeof stageColors]}`}>
                      {stageLabels[lead.stage as keyof typeof stageLabels]}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(lead.score)}`}>
                      {lead.score}/100
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>Criado: {new Date(lead.createdAt).toLocaleDateString('pt-BR')}</div>
                      <div>Atividade: {new Date(lead.lastActivity).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs">Consultas: {lead._count.consultations_records}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowLeadModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowLeadModal(true)
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
                disabled={page === data.pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{(page - 1) * 20 + 1}</span>
                  {' '}a{' '}
                  <span className="font-medium">
                    {Math.min(page * 20, data.pagination.total)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{data.pagination.total}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(
                      data.pagination.pages - 4,
                      page - 2
                    )) + i
                    
                    if (pageNum > data.pagination.pages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
                    disabled={page === data.pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}