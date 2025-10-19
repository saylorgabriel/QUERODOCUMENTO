'use client'

import React, { useState } from 'react'
import { CreditCard, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CreditCardData {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  postalCode: string
  addressNumber: string
}

interface CreditCardFormProps {
  onDataChange: (data: CreditCardData) => void
  className?: string
}

export function CreditCardForm({ onDataChange, className }: CreditCardFormProps) {
  const [cardData, setCardData] = useState<CreditCardData>({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    postalCode: '',
    addressNumber: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreditCardData, string>>>({})

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ').substring(0, 19) // Max 16 digits + 3 spaces
  }

  // Format postal code (XXXXX-XXX)
  const formatPostalCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 5) return cleaned
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 8)}`
  }

  // Validate Luhn algorithm for card number
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '')
    if (cleaned.length < 13 || cleaned.length > 19) return false

    let sum = 0
    let isEven = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10)

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  // Get card brand from number
  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '')

    if (/^4/.test(cleaned)) return 'visa'
    if (/^5[1-5]/.test(cleaned)) return 'mastercard'
    if (/^3[47]/.test(cleaned)) return 'amex'
    if (/^6(?:011|5)/.test(cleaned)) return 'discover'
    if (/^(?:2131|1800|35)/.test(cleaned)) return 'jcb'
    if (/^(636368|438935|504175|451416|636297)/.test(cleaned)) return 'elo'

    return 'unknown'
  }

  const handleChange = (field: keyof CreditCardData, value: string) => {
    let formattedValue = value
    let newErrors = { ...errors }

    // Format based on field
    if (field === 'number') {
      formattedValue = formatCardNumber(value)
      const cleaned = formattedValue.replace(/\s/g, '')
      if (cleaned.length >= 13 && !validateCardNumber(formattedValue)) {
        newErrors.number = 'Número de cartão inválido'
      } else {
        delete newErrors.number
      }
    } else if (field === 'postalCode') {
      formattedValue = formatPostalCode(value)
    } else if (field === 'expiryMonth') {
      formattedValue = value.replace(/\D/g, '').substring(0, 2)
      const month = parseInt(formattedValue, 10)
      if (formattedValue && (month < 1 || month > 12)) {
        newErrors.expiryMonth = 'Mês inválido'
      } else {
        delete newErrors.expiryMonth
      }
    } else if (field === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4)
      const year = parseInt(formattedValue, 10)
      const currentYear = new Date().getFullYear()
      if (formattedValue.length === 4 && year < currentYear) {
        newErrors.expiryYear = 'Ano inválido'
      } else {
        delete newErrors.expiryYear
      }
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4)
    } else if (field === 'holderName') {
      formattedValue = value.toUpperCase()
    }

    const updatedData = {
      ...cardData,
      [field]: formattedValue
    }

    setCardData(updatedData)
    setErrors(newErrors)
    onDataChange(updatedData)
  }

  const cardBrand = getCardBrand(cardData.number)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-6 shadow-xl text-white mb-6">
        <div className="flex justify-between items-start mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="text-right text-xs opacity-80">
            {cardBrand === 'visa' && 'VISA'}
            {cardBrand === 'mastercard' && 'MASTERCARD'}
            {cardBrand === 'elo' && 'ELO'}
            {cardBrand === 'amex' && 'AMEX'}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xl tracking-wider font-mono">
            {cardData.number || '•••• •••• •••• ••••'}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs opacity-70 mb-1">TITULAR DO CARTÃO</div>
            <div className="text-sm font-medium">
              {cardData.holderName || 'NOME COMPLETO'}
            </div>
          </div>
          <div>
            <div className="text-xs opacity-70 mb-1">VALIDADE</div>
            <div className="text-sm font-medium">
              {cardData.expiryMonth && cardData.expiryYear
                ? `${cardData.expiryMonth}/${cardData.expiryYear}`
                : 'MM/AAAA'}
            </div>
          </div>
        </div>
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Número do Cartão *
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardData.number}
            onChange={(e) => handleChange('number', e.target.value)}
            placeholder="0000 0000 0000 0000"
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
              errors.number
                ? "border-red-300 focus:ring-red-500"
                : "border-neutral-300 focus:ring-primary-500"
            )}
            maxLength={19}
          />
          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        </div>
        {errors.number && (
          <p className="mt-1 text-sm text-red-600">{errors.number}</p>
        )}
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Nome do Titular (como está no cartão) *
        </label>
        <input
          type="text"
          value={cardData.holderName}
          onChange={(e) => handleChange('holderName', e.target.value)}
          placeholder="NOME COMPLETO"
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors uppercase"
        />
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Mês *
          </label>
          <input
            type="text"
            value={cardData.expiryMonth}
            onChange={(e) => handleChange('expiryMonth', e.target.value)}
            placeholder="MM"
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
              errors.expiryMonth
                ? "border-red-300 focus:ring-red-500"
                : "border-neutral-300 focus:ring-primary-500"
            )}
            maxLength={2}
          />
          {errors.expiryMonth && (
            <p className="mt-1 text-xs text-red-600">{errors.expiryMonth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Ano *
          </label>
          <input
            type="text"
            value={cardData.expiryYear}
            onChange={(e) => handleChange('expiryYear', e.target.value)}
            placeholder="AAAA"
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
              errors.expiryYear
                ? "border-red-300 focus:ring-red-500"
                : "border-neutral-300 focus:ring-primary-500"
            )}
            maxLength={4}
          />
          {errors.expiryYear && (
            <p className="mt-1 text-xs text-red-600">{errors.expiryYear}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            CVV *
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => handleChange('cvv', e.target.value)}
              placeholder="123"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              maxLength={4}
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            CEP *
          </label>
          <input
            type="text"
            value={cardData.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            placeholder="00000-000"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            maxLength={9}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Número *
          </label>
          <input
            type="text"
            value={cardData.addressNumber}
            onChange={(e) => handleChange('addressNumber', e.target.value)}
            placeholder="123"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-4 bg-success-50 rounded-lg border border-success-200">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-success-900 mb-1">
              Seus dados estão seguros
            </h5>
            <p className="text-xs text-success-700">
              As informações do seu cartão são criptografadas e processadas diretamente pelo gateway de pagamento.
              Não armazenamos dados do cartão em nossos servidores.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
