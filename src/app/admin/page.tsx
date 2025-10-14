'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Users,
  Clock,
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp
} from 'lucide-react'

interface DashboardMetrics {
  totalOrders: number
  pendingOrders: number
  completedToday: number
  revenue: number
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalOrders: 0,
    pendingOrders: 0,
    completedToday: 0,
    revenue: 0
  })

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics')
      const data = await response.json()

      if (data.success) {
        setMetrics(data.metrics)
      } else {
        console.error('Failed to load metrics:', data.error)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatGrowth = (growth: number) => {
    if (growth === 0) return 'Sem alteração'
    const sign = growth > 0 ? '+' : ''
    return `${sign}${growth}% este mês`
  }

  const stats = [
    {
      name: 'Total de Pedidos',
      value: metrics.totalOrders.toLocaleString('pt-BR'),
      icon: Package,
      color: 'blue',
      change: formatGrowth(metrics.ordersGrowth || 0)
    },
    {
      name: 'Pedidos Pendentes',
      value: metrics.pendingOrders.toString(),
      icon: Clock,
      color: 'yellow',
      change: 'Requer atenção'
    },
    {
      name: 'Concluídos Hoje',
      value: metrics.completedToday.toString(),
      icon: FileText,
      color: 'green',
      change: 'Últimas 24h'
    },
    {
      name: 'Receita Total',
      value: formatCurrency(metrics.revenue),
      icon: DollarSign,
      color: 'purple',
      change: formatGrowth(metrics.revenueGrowth || 0)
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900">
          Dashboard Administrativo
        </h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Visão geral dos pedidos e métricas do sistema
        </p>
      </div>
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                yellow: 'from-yellow-500 to-yellow-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600'
              }
              const bgClasses = {
                blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
                yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50',
                green: 'bg-gradient-to-br from-green-50 to-green-100/50',
                purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50'
              }

              return (
                <div key={index} className={`card-modern hover-lift group cursor-pointer ${bgClasses[stat.color as keyof typeof bgClasses]}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-600 mb-1">{stat.name}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1 group-hover:scale-105 transition-transform duration-200">{stat.value}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Enhanced Quick Actions */}
          <div className="card-modern bg-gradient-to-br from-white to-neutral-50/30">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-neutral-900 to-red-700 bg-clip-text text-transparent mb-6 sm:mb-8">Ações Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Link
                href="/admin/pedidos"
                className="group p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left block relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-base group-hover:text-blue-700 transition-colors duration-200">Ver Pedidos</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">Visualizar e gerenciar todos os pedidos</p>
                </div>
              </Link>

              <Link
                href="/admin/pedidos?status=PENDING"
                className="group p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200/50 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left block relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-base group-hover:text-yellow-700 transition-colors duration-200">Processar Pendentes</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">Ver e processar pedidos pendentes</p>
                </div>
              </Link>

              <Link
                href="/admin/usuarios"
                className="group p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left block relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-base group-hover:text-purple-700 transition-colors duration-200">Gerenciar Usuários</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">Ver e gerenciar contas de usuários</p>
                </div>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="card-modern bg-gradient-to-br from-white to-neutral-50/30">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-neutral-900 to-red-700 bg-clip-text text-transparent mb-6">Status do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">API Status</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-green-700">Operacional</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Banco de Dados</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-green-700">Operacional</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Pagamentos</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-green-700">Operacional</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
