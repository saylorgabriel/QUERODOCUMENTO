'use client'

import React, { useState, useEffect } from 'react'
// import InputMask from 'react-input-mask' // Temporarily disabled for React 19 compatibility
import { validateDocument, detectDocumentType, formatDocument } from '@/lib/validators'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { LoadingSpinner } from './loading-spinner'

interface InputDocumentProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string, isValid: boolean, type: 'CPF' | 'CNPJ' | null, isValidating?: boolean) => void
  label?: string
  error?: string
  showValidation?: boolean
  validationDelay?: number
}

export function InputDocument({
  value = '',
  onChange,
  label,
  error,
  showValidation = true,
  validationDelay = 800,
  className,
  ...props
}: InputDocumentProps) {
  const [internalValue, setInternalValue] = useState(value)
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ' | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [touched, setTouched] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  
  // Effect para sincronizar com valor externo
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value)
    }
  }, [value])
  
  // Debounce do valor para validação
  const debouncedValue = useDebounce(internalValue, validationDelay)

  // Effect para validação com debounce
  useEffect(() => {
    if (!debouncedValue) {
      setIsValidating(false)
      setIsValid(false)
      setDocumentType(null)
      return
    }

    const type = detectDocumentType(debouncedValue)
    setDocumentType(type)
    
    // Simula um pequeno delay para mostrar o loading
    setIsValidating(true)
    
    const validationTimer = setTimeout(() => {
      const valid = validateDocument(debouncedValue)
      setIsValid(valid)
      setIsValidating(false)
      onChange?.(debouncedValue, valid, type, false)
    }, 200) // Pequeno delay visual para mostrar loading

    return () => clearTimeout(validationTimer)
  }, [debouncedValue])

  // Effect para indicar quando está validando
  useEffect(() => {
    if (internalValue && internalValue !== debouncedValue && touched) {
      setIsValidating(true)
      onChange?.(internalValue, false, null, true)
    }
  }, [internalValue, debouncedValue, touched])

  // getMask function temporarily disabled for React 19 compatibility
  // const getMask = () => {
  //   const clean = internalValue.replace(/[^\d]/g, '')
  //   if (clean.length <= 11) {
  //     return '999.999.999-99'
  //   }
  //   return '99.999.999/9999-99'
  // }

  // Mask helper function
  const applyMask = (value: string): string => {
    const clean = value.replace(/[^\d]/g, '')
    
    if (clean.length <= 11) {
      // CPF mask: 999.999.999-99
      if (clean.length <= 3) return clean
      if (clean.length <= 6) return clean.replace(/(\d{3})(\d{1,3})/, '$1.$2')
      if (clean.length <= 9) return clean.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
    } else {
      // CNPJ mask: 99.999.999/9999-99
      if (clean.length <= 2) return clean
      if (clean.length <= 5) return clean.replace(/(\d{2})(\d{1,3})/, '$1.$2')
      if (clean.length <= 8) return clean.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3')
      if (clean.length <= 12) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4')
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const maskedValue = applyMask(inputValue)
    
    // Always update with masked value
    setInternalValue(maskedValue)
    
    // Reset validation state when value changes
    setIsValid(false)
    setDocumentType(null)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const showError = touched && !isValid && internalValue.length > 0 && !isValidating

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={isValidating ? 'Validando...' : props.placeholder}
          className={cn(
            'w-full h-11 px-4 py-2.5 pr-12 border border-neutral-300 rounded-lg text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            showError && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10',
            isValid && touched && !isValidating && 'border-green-500 focus:border-green-500 focus:ring-green-500/10',
            isValidating && 'border-blue-400 focus:border-blue-400 focus:ring-blue-400/10',
            className
          )}
          {...props}
        />
        {showValidation && touched && internalValue.length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValidating ? (
              <LoadingSpinner size="sm" color="primary" />
            ) : isValid ? (
              <svg className="w-5 h-5 text-green-500 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-500 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        )}
      </div>
      {isValidating && touched && internalValue.length > 0 && (
        <p className="text-sm text-blue-600 animate-pulse">
          Validando {documentType || 'documento'}...
        </p>
      )}
      {showError && (
        <p className="text-sm text-amber-600 transition-opacity duration-200">
          {documentType ? `${documentType} inválido` : 'Documento inválido'}
        </p>
      )}
      {error && (
        <p className="text-sm text-amber-600">{error}</p>
      )}
      {documentType && isValid && touched && !isValidating && (
        <p className="text-sm text-green-600 transition-opacity duration-200">
          {documentType} válido
        </p>
      )}
    </div>
  )
}