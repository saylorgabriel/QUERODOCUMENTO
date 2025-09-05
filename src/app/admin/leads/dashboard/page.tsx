'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Users, Target, Mail, Phone, 
  BarChart3, PieChart, Activity, Calendar, Filter, Download
} from 'lucide-react'

interface MetricsData {
  overview: {
    totalLeads: number
    newLeads: number
    convertedLeads: number
    conversionRate: number
    averageScore: number
  }
  sources: Array<{
    name: string
    count: number
  }>
  stages: Array<{
    name: string
    count: number
  }>
  statuses: Array<{
    name: string
    count: number
  }>
  funnel: Array<{
    stage: string
    count: number
    percentage: number
  }>
  activity: Array<{
    date: string
    leads_count: number
  }>
  topSources: Array<{
    source: string
    total_leads: number
    converted_leads: number
    conversion_rate: number
    avg_score: number
  }>
  scoreDistribution: Array<{
    score_range: string
    count: number
  }>
  email: {
    totalSent: number
    totalOpens: number
    totalClicks: number
    engagementRate: number
    clickRate: number
    activeLeads: number
  }
}

const stageLabels = {
  FORM_FILLED: 'Formulário',
  CONSULTATION: 'Consulta',
  QUOTE_REQUESTED: 'Orçamento',
  PAYMENT_STARTED: 'Pagamento',
  CUSTOMER: 'Cliente'
}

const statusLabels = {
  NEW: 'Novo',
  CONTACTED: 'Contatado',
  QUALIFIED: 'Qualificado',
  CONVERTED: 'Convertido',
  LOST: 'Perdido',
  UNSUBSCRIBED: 'Descadastrado'
}

export default function LeadsDashboard() {
  const [data, setData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/leads/metrics?period=${period}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      } else {
        console.error('Failed to fetch metrics:', result.error)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [period])

  const exportReport = () => {
    if (!data) return
    
    const report = {
      generated_at: new Date().toISOString(),
      period_days: period,
      overview: data.overview,
      top_sources: data.topSources,
      conversion_funnel: data.funnel,
      email_metrics: data.email
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <div>Erro ao carregar dados</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Leads</h1>
          <p className="text-gray-600 mt-1">Métricas e análises de conversão</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input-primary"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          <button
            onClick={exportReport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Leads</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalLeads}</p>
              <p className="text-sm text-blue-600">+{data.overview.newLeads} novos</p>
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
              <p className="text-2xl font-bold text-gray-900">{data.overview.conversionRate}%</p>
              <p className="text-sm text-green-600">{data.overview.convertedLeads} convertidas</p>
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
              <p className="text-2xl font-bold text-gray-900">{data.overview.averageScore}/100</p>
              <p className="text-sm text-purple-600">Qualidade das leads</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails Enviados</p>
              <p className="text-2xl font-bold text-gray-900">{data.email.totalSent}</p>
              <p className="text-sm text-orange-600">{data.email.engagementRate}% abertura</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{data.email.activeLeads}</p>
              <p className="text-sm text-indigo-600">Em remarketing</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-full">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Funil de Conversão
          </h3>
          <div className="space-y-3">
            {data.funnel.map((stage, index) => (
              <div key={stage.stage} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {stageLabels[stage.stage as keyof typeof stageLabels]}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stage.count} ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sources */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Principais Fontes
          </h3>
          <div className="space-y-3">
            {data.topSources.slice(0, 5).map((source, index) => (
              <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      {source.source}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      {source.conversion_rate}% conv.
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {source.total_leads} leads • Score: {Math.round(source.avg_score)}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Score
          </h3>
          <div className="space-y-3">
            {data.scoreDistribution.map((range) => (
              <div key={range.score_range} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{range.score_range}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="h-2 bg-gradient-to-r from-red-400 to-green-400 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (range.count * 100) / Math.max(...data.scoreDistribution.map(d => d.count)))}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{range.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status das Leads
          </h3>
          <div className="space-y-3">
            {data.statuses.map((status) => (
              <div key={status.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {statusLabels[status.name as keyof typeof statusLabels]}
                </span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.name === 'CONVERTED' ? 'bg-green-500' :
                        status.name === 'LOST' ? 'bg-red-500' :
                        status.name === 'QUALIFIED' ? 'bg-purple-500' :
                        status.name === 'CONTACTED' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (status.count * 100) / Math.max(...data.statuses.map(d => d.count)))}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{status.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Email Marketing
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emails Enviados</span>
              <span className="text-lg font-bold text-gray-900">{data.email.totalSent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Abertura</span>
              <span className="text-lg font-bold text-green-600">{data.email.engagementRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Clique</span>
              <span className="text-lg font-bold text-blue-600">{data.email.clickRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Leads Ativas</span>
              <span className="text-lg font-bold text-purple-600">{data.email.activeLeads}</span>
            </div>
            
            {/* Email Performance Bar */}
            <div className="pt-2">
              <div className="text-xs text-gray-500 mb-1">Performance Geral</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, data.email.engagementRate)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
          Atividade Recente (Últimos 7 dias)
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {data.activity.slice(0, 7).reverse().map((day) => (
            <div key={day.date} className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
              </div>
              <div className="bg-blue-100 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-600">{day.leads_count}</div>
                <div className="text-xs text-blue-500">leads</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">Ações Recomendadas</h3>
            <div className="text-sm opacity-90">
              Baseado na análise das suas leads, aqui estão algumas sugestões:
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{data.statuses.find(s => s.name === 'NEW')?.count || 0}</div>
              <div className="text-sm">Leads para contatar</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">
                {Math.round((data.overview.convertedLeads * 100) / Math.max(data.overview.totalLeads, 1))}%
              </div>
              <div className="text-sm">Taxa atual</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{data.email.activeLeads}</div>
              <div className="text-sm">Para remarketing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}