import React from 'react'
import { motion } from 'framer-motion' // Temporarily disabled for React 19 compatibility
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle, 
  CreditCard,
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { AnimatedCounter, AnimatedCurrency, AnimatedStatsCard } from '@/components/ui/animated-counter'
import { SkeletonStats } from '@/components/ui/skeleton'

interface OrdersSummary {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  cancelledOrders: number
  totalSpent: number
}

interface QuickStatsProps {
  summary: OrdersSummary
  loading?: boolean
}

const QuickStats: React.FC<QuickStatsProps> = ({ summary, loading = false }) => {
  const stats = [
    {
      title: 'Total de Pedidos',
      value: summary.totalOrders,
      icon: <FileText className="w-6 h-6" />,
      subtitle: 'Pedidos realizados'
    },
    {
      title: 'Pedidos Concluídos', 
      value: summary.completedOrders,
      icon: <CheckCircle className="w-6 h-6" />,
      subtitle: 'Finalizados com sucesso'
    },
    {
      title: 'Em Andamento',
      value: summary.pendingOrders,
      icon: <Clock className="w-6 h-6" />,
      subtitle: 'Aguardando processamento'
    },
    {
      title: 'Total Investido',
      value: summary.totalSpent,
      icon: <DollarSign className="w-6 h-6" />,
      subtitle: 'Valor total pago',
      formatValue: (value: number) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    }
  ]

  if (loading) {
    return <SkeletonStats count={4} />
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Grid with Stagger Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <AnimatedStatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            formatValue={stat.formatValue}
            delay={index * 0.1}
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          />
        ))}
      </div>

      {/* Additional insights with animations */}
      {summary.totalOrders > 0 && (
        <div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div 
            className="card-elevated text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div 
              className="flex items-center justify-center w-12 h-12 bg-success-100 text-success-600 rounded-lg mx-auto mb-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
            >
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-sm text-neutral-600 mb-2">Taxa de Conclusão</p>
            <AnimatedCounter
              value={Math.round((summary.completedOrders / summary.totalOrders) * 100)}
              duration={2}
              delay={0.8}
              suffix="%"
              className="text-xl font-bold text-neutral-900"
            />
          </div>

          <div 
            className="card-elevated text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <div 
              className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-lg mx-auto mb-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
            >
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm text-neutral-600 mb-2">Em Processamento</p>
            <AnimatedCounter
              value={summary.pendingOrders}
              duration={2}
              delay={0.9}
              className="text-xl font-bold text-neutral-900"
            />
          </div>

          <div 
            className="card-elevated text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <div 
              className="flex items-center justify-center w-12 h-12 bg-accent-100 text-accent-600 rounded-lg mx-auto mb-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.9, type: "spring" }}
            >
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-sm text-neutral-600 mb-2">Ticket Médio</p>
            <AnimatedCurrency
              value={summary.totalOrders > 0 ? summary.totalSpent / summary.totalOrders : 0}
              duration={2}
              delay={1.0}
              className="text-xl font-bold text-neutral-900"
            />
          </div>
        </div>
      )}

      {/* Animated Empty state */}
      {summary.totalOrders === 0 && (
        <div 
          className="card-elevated text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
          >
            <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          </div>
          
          <h3 
            className="text-lg font-semibold text-neutral-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            Nenhum pedido ainda
          </h3>
          
          <p 
            className="text-neutral-600 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            Faça sua primeira consulta ou solicite uma certidão para começar
          </p>
          
          <div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <a 
              href="/consulta-protesto" 
              className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-button bg-gradient-to-br from-accent-500 to-accent-600 text-white font-medium hover:-translate-y-0.5 hover:shadow-floating transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-4 h-4" />
              Nova Consulta
            </a>
            <a 
              href="/certidao-protesto" 
              className="btn-secondary flex items-center justify-center gap-2 px-6 py-3 rounded-button border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText className="w-4 h-4" />
              Solicitar Certidão
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickStats