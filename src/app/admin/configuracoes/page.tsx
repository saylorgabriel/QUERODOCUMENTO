'use client'

import { useState, useEffect } from 'react'
import { Save, Mail, Bell, Shield, Database, RefreshCw, DollarSign, Edit2, X } from 'lucide-react'

interface SystemConfig {
  emailProvider: string
  emailApiKey: string
  paymentProvider: string
  paymentApiKey: string
  webhookSecret: string
  notificationsEnabled: boolean
  maintenanceMode: boolean
}

interface Emolument {
  state: string
  value5Years: number
  finalValue: number
}

const STATE_NAMES: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
  'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
  'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
  'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
  'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
}

export default function AdminConfiguracoes() {
  const [config, setConfig] = useState<SystemConfig>({
    emailProvider: 'sendgrid',
    emailApiKey: '',
    paymentProvider: 'asaas',
    paymentApiKey: '',
    webhookSecret: '',
    notificationsEnabled: true,
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Emoluments state
  const [emoluments, setEmoluments] = useState<Emolument[]>([])
  const [loadingEmoluments, setLoadingEmoluments] = useState(true)
  const [savingEmoluments, setSavingEmoluments] = useState(false)
  const [editingStates, setEditingStates] = useState<Set<string>>(new Set())
  const [emolumentsMessage, setEmolumentsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadConfig()
    loadEmoluments()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/config')
      const data = await response.json()

      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar configurações' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  const loadEmoluments = async () => {
    try {
      setLoadingEmoluments(true)
      const response = await fetch('/api/emoluments')
      const data = await response.json()

      if (data.success) {
        setEmoluments(data.emoluments)
      }
    } catch (error) {
      console.error('Failed to load emoluments:', error)
    } finally {
      setLoadingEmoluments(false)
    }
  }

  const handleEmolumentChange = (state: string, value: string) => {
    setEmoluments(prev =>
      prev.map(e =>
        e.state === state
          ? { ...e, value5Years: parseFloat(value) || 0 }
          : e
      )
    )
  }

  const toggleEdit = (state: string) => {
    setEditingStates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(state)) {
        newSet.delete(state)
      } else {
        newSet.add(state)
      }
      return newSet
    })
  }

  const saveEmoluments = async () => {
    try {
      setSavingEmoluments(true)
      setEmolumentsMessage(null)

      const response = await fetch('/api/emoluments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoluments }),
      })

      const data = await response.json()

      if (data.success) {
        setEmolumentsMessage({ type: 'success', text: 'Emolumentos salvos com sucesso!' })
        setEditingStates(new Set())
        loadEmoluments() // Reload to get calculated values
      } else {
        setEmolumentsMessage({ type: 'error', text: data.error || 'Erro ao salvar emolumentos' })
      }
    } catch (error) {
      setEmolumentsMessage({ type: 'error', text: 'Erro ao salvar emolumentos' })
    } finally {
      setSavingEmoluments(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Configurações</h1>
          <p className="text-sm text-neutral-600">Gerencie as configurações do sistema</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary inline-flex items-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Email Configuration - Disabled */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 opacity-60 relative overflow-hidden">
        {/* Coming Soon Badge */}
        <div className="absolute top-4 right-4 bg-amber-100 border border-amber-300 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
          Em Desenvolvimento
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Configurações de Email</h2>
            <p className="text-sm text-neutral-600">Configure o serviço de envio de emails</p>
          </div>
        </div>

        <div className="space-y-4 pointer-events-none">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Provedor de Email
            </label>
            <select
              value={config.emailProvider}
              disabled
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 cursor-not-allowed"
            >
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
              <option value="smtp">SMTP</option>
              <option value="resend">Resend</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              API Key / Token
            </label>
            <input
              type="password"
              value={config.emailApiKey}
              disabled
              placeholder="••••••••••••••••"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Info message */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Informação:</strong> Esta funcionalidade será implementada em breve.
            As configurações de email são atualmente gerenciadas via variáveis de ambiente.
          </p>
        </div>
      </div>

      {/* Payment Configuration */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Configurações de Pagamento</h2>
            <p className="text-sm text-neutral-600">Configure o gateway de pagamento</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Gateway de Pagamento
            </label>
            <select
              value={config.paymentProvider}
              onChange={(e) => setConfig({ ...config, paymentProvider: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="asaas">ASAAS</option>
              <option value="pagarme">Pagar.me</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={config.paymentApiKey}
              onChange={(e) => setConfig({ ...config, paymentApiKey: e.target.value })}
              placeholder="••••••••••••••••"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Webhook Secret
            </label>
            <input
              type="password"
              value={config.webhookSecret}
              onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
              placeholder="••••••••••••••••"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      </div> */}

      {/* System Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Configurações do Sistema</h2>
            <p className="text-sm text-neutral-600">Configure o comportamento do sistema</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-neutral-600" />
              <div>
                <p className="font-medium text-neutral-900">Notificações Ativas</p>
                <p className="text-sm text-neutral-600">Enviar emails e notificações aos usuários</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.notificationsEnabled}
                onChange={(e) => setConfig({ ...config, notificationsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-neutral-600" />
              <div>
                <p className="font-medium text-neutral-900">Modo Manutenção</p>
                <p className="text-sm text-neutral-600">Desabilitar acesso público ao sistema</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Certificate Emoluments */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Valores de Emolumentos</h2>
              <p className="text-sm text-neutral-600">Gerencie os valores base por estado (5 anos)</p>
            </div>
          </div>
          <button
            onClick={saveEmoluments}
            disabled={savingEmoluments || editingStates.size === 0}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingEmoluments ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Emolumentos
              </>
            )}
          </button>
        </div>

        {emolumentsMessage && (
          <div
            className={`p-4 rounded-lg mb-4 ${
              emolumentsMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {emolumentsMessage.text}
          </div>
        )}

        {loadingEmoluments ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Carregando emolumentos...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Observação:</strong> O valor final é calculado automaticamente incluindo:
                Taxa do boleto (R$ 0,87) + Taxa de lucro (R$ 30,00) + Taxa de serviço (R$ 5,09) + Imposto (6%).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emoluments.map((emolument) => (
                <div
                  key={emolument.state}
                  className="border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-medium text-emerald-600">{emolument.state}</p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {STATE_NAMES[emolument.state]}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleEdit(emolument.state)}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      title={editingStates.has(emolument.state) ? 'Cancelar edição' : 'Editar'}
                    >
                      {editingStates.has(emolument.state) ? (
                        <X className="w-4 h-4 text-red-600" />
                      ) : (
                        <Edit2 className="w-4 h-4 text-neutral-600" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-neutral-600">Valor Base (5 anos)</label>
                      {editingStates.has(emolument.state) ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-neutral-600">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={emolument.value5Years}
                            onChange={(e) => handleEmolumentChange(emolument.state, e.target.value)}
                            className="flex-1 px-2 py-1 border border-emerald-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          />
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-emerald-600 mt-1">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(emolument.value5Years)}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-neutral-100">
                      <label className="text-xs text-neutral-500">Valor Final (calculado)</label>
                      <p className="text-sm font-semibold text-neutral-900 mt-1">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(emolument.finalValue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {emoluments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-600">Nenhum emolumento cadastrado.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900">Zona de Perigo</h2>
        </div>
        <p className="text-sm text-red-700 mb-4">
          Ações irreversíveis que podem afetar o funcionamento do sistema
        </p>
        <div className="space-y-3">
          <button className="w-full sm:w-auto px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
            Limpar Cache do Sistema
          </button>
          <button className="w-full sm:w-auto px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors ml-0 sm:ml-3">
            Resetar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}
