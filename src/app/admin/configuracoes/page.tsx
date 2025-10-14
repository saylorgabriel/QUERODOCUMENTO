'use client'

import { useState, useEffect } from 'react'
import { Save, Mail, CreditCard, Bell, Shield, Database, RefreshCw } from 'lucide-react'

interface SystemConfig {
  emailProvider: string
  emailApiKey: string
  paymentProvider: string
  paymentApiKey: string
  webhookSecret: string
  notificationsEnabled: boolean
  maintenanceMode: boolean
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

  useEffect(() => {
    loadConfig()
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

      {/* Email Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Configurações de Email</h2>
            <p className="text-sm text-neutral-600">Configure o serviço de envio de emails</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Provedor de Email
            </label>
            <select
              value={config.emailProvider}
              onChange={(e) => setConfig({ ...config, emailProvider: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              onChange={(e) => setConfig({ ...config, emailApiKey: e.target.value })}
              placeholder="••••••••••••••••"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Payment Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
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
      </div>

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
