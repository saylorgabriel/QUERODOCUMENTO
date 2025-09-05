'use client'

import React, { useState, useEffect } from 'react'
// import InputMask from 'react-input-mask' // Temporarily disabled for React 19 compatibility
import { validatePhone, formatPhone } from '@/lib/validators'
import { cn } from '@/lib/utils'

interface InputPhoneProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string, isValid: boolean) => void
  label?: string
  error?: string
  showValidation?: boolean
}

export function InputPhone({
  value = '',
  onChange,
  label,
  error,
  showValidation = true,
  className,
  ...props
}: InputPhoneProps) {
  const [internalValue, setInternalValue] = useState(value)
  const [isValid, setIsValid] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const valid = validatePhone(internalValue)
    setIsValid(valid)
    onChange?.(internalValue, valid)
  }, [internalValue])

  // getMask function temporarily disabled for React 19 compatibility
  // const getMask = () => {
  //   const clean = internalValue.replace(/[^\d]/g, '')
  //   if (clean.length <= 10) {
  //     return '(99) 9999-9999'
  //   }
  //   return '(99) 99999-9999'
  // }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const showError = touched && !isValid && internalValue.length > 0

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
          className={cn(
            'input-primary w-full',
            showError && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10',
            isValid && touched && 'border-green-500 focus:border-green-500 focus:ring-green-500/10',
            className
          )}
          {...props}
        />
        {showValidation && touched && internalValue.length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        )}
      </div>
      {showError && (
        <p className="text-sm text-amber-600">Telefone inválido</p>
      )}
      {error && (
        <p className="text-sm text-amber-600">{error}</p>
      )}
      {isValid && touched && (
        <p className="text-sm text-green-600">Telefone válido</p>
      )}
    </div>
  )
}