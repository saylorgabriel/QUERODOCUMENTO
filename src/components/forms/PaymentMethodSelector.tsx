'use client'

import React from 'react'
import { CreditCard, Smartphone, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentMethodSelectorProps {
  selectedMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | null
  onSelect: (method: 'PIX' | 'CREDIT_CARD' | 'BOLETO') => void
}

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'PIX' as const,
      name: 'PIX',
      description: 'Pagamento instantâneo',
      icon: Smartphone,
      badge: 'Mais rápido',
      badgeColor: 'bg-success-100 text-success-700'
    },
    {
      id: 'CREDIT_CARD' as const,
      name: 'Cartão de Crédito',
      description: 'Visa, Mastercard, Elo',
      icon: CreditCard,
      badge: 'Parcelado',
      badgeColor: 'bg-accent-100 text-accent-700'
    },
    {
      id: 'BOLETO' as const,
      name: 'Boleto Bancário',
      description: 'Vencimento em 3 dias úteis',
      icon: FileText,
      badge: null,
      badgeColor: ''
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Escolha a forma de pagamento
      </h3>
      
      <div className="grid gap-3">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id
          const Icon = method.icon
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "w-full p-4 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-sm group",
                isSelected
                  ? "border-primary-600 bg-primary-50"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  isSelected 
                    ? "bg-primary-600 text-white" 
                    : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      "font-semibold",
                      isSelected ? "text-primary-900" : "text-neutral-900"
                    )}>
                      {method.name}
                    </h4>
                    {method.badge && (
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        method.badgeColor
                      )}>
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {method.description}
                  </p>
                </div>
                
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  isSelected 
                    ? "border-primary-600 bg-primary-600" 
                    : "border-neutral-300"
                )}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      
      {/* Payment Security Notice */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h5 className="text-sm font-medium text-neutral-900 mb-1">
              Pagamento 100% Seguro
            </h5>
            <p className="text-xs text-neutral-600">
              Seus dados são protegidos com criptografia SSL e não armazenamos informações do cartão.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}