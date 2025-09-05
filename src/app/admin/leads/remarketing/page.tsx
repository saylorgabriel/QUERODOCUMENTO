'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Eye, Users, Clock, Target, AlertCircle, CheckCircle, Filter } from 'lucide-react'

interface Template {
  id: string
  name: string
  subject: string
  body: string
}

interface RemarketingData {
  templates: Template[]
  stats: {
    eligibleLeads: number
    newLeads: number
    consultationDropoffs: number
    emailsPending: number
  }
}

interface CampaignFilters {
  status?: string
  stage?: string
  source?: string
  minScore?: number
  maxScore?: number
  lastEmailDaysAgo?: number
}

export default function RemarketingPage() {
  const [data, setData] = useState<RemarketingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [customSubject, setCustomSubject] = useState('')
  const [customBody, setCustomBody] = useState('')
  const [filters, setFilters] = useState<CampaignFilters>({})
  const [preview, setPreview] = useState<any>(null)
  const [sending, setSending] = useState(false)
  const [campaignResult, setCampaignResult] = useState<any>(null)

  useEffect(() => {
    fetchRemarketingData()
  }, [])

  const fetchRemarketingData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/leads/remarketing')
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
        if (result.templates.length > 0) {
          setSelectedTemplate(result.templates[0])
          setCustomSubject(result.templates[0].subject)
          setCustomBody(result.templates[0].body)
        }
      }
    } catch (error) {
      console.error('Error fetching remarketing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPreview = async () => {
    try {
      const response = await fetch('/api/admin/leads/remarketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_preview',
          filters
        })
      })
      
      const result = await response.json()
      if (response.ok) {
        setPreview(result)
      }
    } catch (error) {
      console.error('Error getting preview:', error)
    }
  }

  const sendCampaign = async () => {
    if (!customSubject || !customBody) {
      alert('Assunto e conteúdo são obrigatórios')
      return
    }

    try {
      setSending(true)
      const response = await fetch('/api/admin/leads/remarketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email',
          filters,
          emailTemplate: customBody,
          subject: customSubject
        })
      })
      
      const result = await response.json()
      setCampaignResult(result)
      
      if (result.success) {
        // Refresh stats
        fetchRemarketingData()
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
    } finally {
      setSending(false)
    }
  }

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setCustomSubject(template.subject)
    setCustomBody(template.body)
    setCampaignResult(null)
  }

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      getPreview()
    }
  }, [filters])

  if (loading) {
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
        </div>
      </div>
    )
  }

  if (!data) return <div>Erro ao carregar dados</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-gray-600 mt-1">Crie e envie campanhas de remarketing para suas leads</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Elegíveis</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.eligibleLeads}</p>
              <p className="text-sm text-green-600">Com email válido</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Novas</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.newLeads}</p>
              <p className="text-sm text-blue-600">Aguardando contato</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abandonaram</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.consultationDropoffs}</p>
              <p className="text-sm text-orange-600">Após consulta</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Na Fila</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.emailsPending}</p>
              <p className="text-sm text-purple-600">Emails pendentes</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates de Email</h3>
          <div className="space-y-3">
            {data.templates.map((template) => (
              <div
                key={template.id}
                onClick={() => selectTemplate(template)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  {selectedTemplate?.id === template.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {template.subject}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros da Campanha
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="input-primary"
              >
                <option value="">Todos</option>
                <option value="NEW">Novo</option>
                <option value="CONTACTED">Contatado</option>
                <option value="QUALIFIED">Qualificado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Etapa</label>
              <select
                value={filters.stage || ''}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value || undefined })}
                className="input-primary"
              >
                <option value="">Todas</option>
                <option value="FORM_FILLED">Formulário</option>
                <option value="CONSULTATION">Consulta</option>
                <option value="QUOTE_REQUESTED">Orçamento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score Mínimo</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minScore || ''}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value ? parseInt(e.target.value) : undefined })}
                className="input-primary"
                placeholder="Ex: 50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Último email (dias atrás)</label>
              <input
                type="number"
                min="1"
                value={filters.lastEmailDaysAgo || ''}
                onChange={(e) => setFilters({ ...filters, lastEmailDaysAgo: e.target.value ? parseInt(e.target.value) : undefined })}
                className="input-primary"
                placeholder="Ex: 7"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fonte</label>
              <input
                type="text"
                value={filters.source || ''}
                onChange={(e) => setFilters({ ...filters, source: e.target.value || undefined })}
                className="input-primary"
                placeholder="Ex: landing_page"
              />
            </div>

            <button
              onClick={() => setFilters({})}
              className="btn-secondary w-full"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Preview da Campanha
          </h3>
          
          {preview ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-lg font-bold text-blue-900">
                  {preview.totalLeads} leads selecionadas
                </div>
                <div className="text-sm text-blue-700">
                  Receberão este email
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Exemplos:</h4>
                <div className="space-y-2">
                  {preview.previewLeads.map((lead: any) => (
                    <div key={lead.id} className="bg-gray-50 p-3 rounded text-sm">
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-gray-600">{lead.email}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {lead.status}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Score: {lead.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Configure os filtros para ver o preview
            </div>
          )}
        </div>
      </div>

      {/* Email Editor */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Editor de Email</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="input-primary"
              placeholder="Digite o assunto do email..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{nome}'} para personalizar com o nome da lead
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
            <textarea
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
              rows={12}
              className="input-primary resize-none"
              placeholder="Digite o conteúdo do email..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Variáveis disponíveis: {'{nome}'}, {'{documento}'}, {'{score}'}
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Result */}
      {campaignResult && (
        <div className={`p-4 rounded-lg ${
          campaignResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {campaignResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <div>
              <div className={`font-medium ${
                campaignResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {campaignResult.message}
              </div>
              {campaignResult.emailsQueued && (
                <div className="text-sm text-green-700 mt-1">
                  {campaignResult.emailsQueued} emails adicionados à fila de envio
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Button */}
      <div className="flex justify-end">
        <button
          onClick={sendCampaign}
          disabled={sending || !preview || preview.totalLeads === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Campanha ({preview?.totalLeads || 0} leads)
            </>
          )}
        </button>
      </div>
    </div>
  )
}