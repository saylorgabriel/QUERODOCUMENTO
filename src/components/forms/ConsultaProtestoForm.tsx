'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { InputDocument } from '@/components/ui/input-document'
import { InputPhone } from '@/components/ui/input-phone'
import { StepIndicator } from './StepIndicator'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { ArrowRight, ArrowLeft, Loader2, Eye, EyeOff, Smartphone, CreditCard, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  // Step 1: Document consultation & user data
  documentNumber: string
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  isLogin: boolean
  
  // Step 2: Payment
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | null
  
  // Step 3: Invoice data (Nota Fiscal)
  invoiceName: string
  invoiceDocument: string
}

interface ConsultaProtestoFormProps {
  initialData?: {
    documentNumber?: string
    name?: string
    phone?: string
  }
  onQuerySubmit?: (documentNumber: string, name: string, phone?: string) => void
}

export function ConsultaProtestoForm({ initialData, onQuerySubmit }: ConsultaProtestoFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [userSession, setUserSession] = useState<any>(null)

  // Initialize form data from URL params or props
  const getInitialFormData = (): FormData => {
    const urlDocument = searchParams?.get('documentNumber') || ''
    const urlName = searchParams?.get('name') || ''
    const urlPhone = searchParams?.get('phone') || ''

    return {
      documentNumber: initialData?.documentNumber || urlDocument,
      name: initialData?.name || urlName,
      email: '',
      phone: initialData?.phone || urlPhone,
      password: '',
      confirmPassword: '',
      isLogin: false,
      invoiceName: initialData?.name || urlName,
      invoiceDocument: initialData?.documentNumber || urlDocument,
      paymentMethod: null
    }
  }
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDocumentValid, setIsDocumentValid] = useState(false)
  const [isInvoiceDocumentValid, setIsInvoiceDocumentValid] = useState(false)
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [isValidatingDocument, setIsValidatingDocument] = useState(false)

  const [formData, setFormData] = useState<FormData>(getInitialFormData())

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/simple-session')
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setIsLoggedIn(true)
            setUserSession(data.user)
            // Pre-fill form with user data (except document - allow new consultations)
            setFormData(prev => ({
              ...prev,
              name: data.user.name || prev.name,
              email: data.user.email || prev.email,
              phone: data.user.phone || prev.phone,
              // Don't pre-fill documentNumber - user may want to consult a different document
              invoiceName: data.user.name || prev.invoiceName,
              invoiceDocument: data.user.cpf || data.user.cnpj || prev.invoiceDocument
            }))
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setSessionLoading(false)
      }
    }
    checkSession()
  }, [])

  // Effect to validate initial data
  useEffect(() => {
    if (formData.documentNumber) {
      setIsDocumentValid(true) // Assuming it's valid from URL params
    }
    if (formData.phone) {
      setIsPhoneValid(true) // Assuming it's valid from URL params
    }
    if (formData.invoiceDocument) {
      setIsInvoiceDocumentValid(true) // Assuming it's valid from URL params
    }
  }, [])

  // Steps configuration
  const steps = [
    {
      number: 1,
      title: 'Dados',
      description: 'Documento e cadastro'
    },
    {
      number: 2,
      title: 'Pagamento',
      description: 'Forma de pagamento'
    },
    {
      number: 3,
      title: 'Checkout',
      description: 'Finalizar pagamento'
    }
  ]

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }

      // Auto-fill invoice fields when main fields are updated
      if (field === 'name' && !prev.invoiceName) {
        updated.invoiceName = value
      }
      if (field === 'documentNumber' && !prev.invoiceDocument) {
        updated.invoiceDocument = value
      }

      return updated
    })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    // Document validation
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'CPF ou CNPJ é obrigatório'
    } else if (!isDocumentValid) {
      newErrors.documentNumber = 'CPF ou CNPJ inválido'
    }

    // If onQuerySubmit is provided, only validate for direct query
    if (onQuerySubmit) {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório'
      }

      if (formData.phone && !isPhoneValid) {
        newErrors.phone = 'Telefone inválido'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    // Basic validation for step 1 - only basic fields
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!isPhoneValid) {
      newErrors.phone = 'Telefone inválido'
    }

    // If user is already logged in, skip auth validation
    if (isLoggedIn) {
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    // Email validation - only if not logged in
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Only validate auth fields if user is not logged in
    if (!formData.isLogin) {
      // Registration validation
      if (!formData.password.trim()) {
        newErrors.password = 'Senha é obrigatória'
      } else if (formData.password.length < 4) {
        newErrors.password = 'Senha deve ter pelo menos 4 caracteres'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não conferem'
      }
    } else {
      // Login validation
      if (!formData.password.trim()) {
        newErrors.password = 'Senha é obrigatória'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Escolha uma forma de pagamento'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.invoiceName.trim()) {
      newErrors.invoiceName = 'Nome para nota fiscal é obrigatório'
    }
    
    if (!formData.invoiceDocument.trim()) {
      newErrors.invoiceDocument = 'CPF/CNPJ para nota fiscal é obrigatório'
    } else if (!isInvoiceDocumentValid) {
      newErrors.invoiceDocument = 'CPF/CNPJ inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    let isValid = false

    switch (currentStep) {
      case 1:
        isValid = validateStep1()
        if (isValid) {
          // Handle authentication
          isValid = await handleAuthentication()
        }
        break
      case 2:
        isValid = validateStep2()
        break
      case 3:
        // Checkout step - validate invoice data and submit
        isValid = validateStep3()
        if (isValid) {
          await handleSubmit()
          return
        }
        break
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleAuthentication = async () => {
    setIsLoading(true)

    try {
      // If onQuerySubmit is provided OR user is already logged in, skip authentication
      if (onQuerySubmit || isLoggedIn) {
        return true
      }

      if (formData.isLogin) {
        // Login
        const response = await fetch('/api/auth/simple-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })

        const data = await response.json()
        
        if (!response.ok) {
          setErrors({ email: data.error || 'Erro ao fazer login' })
          return false
        }
      } else {
        // Registration
        const registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          document: formData.documentNumber,
          phone: formData.phone
        }

        console.log('Sending registration data:', registrationData)

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData)
        })

        const data = await response.json()
        
        if (!response.ok) {
          setErrors({ email: data.error || 'Erro ao criar conta' })
          return false
        }

        // After registration, auto-login
        const loginResponse = await fetch('/api/auth/simple-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })

        if (!loginResponse.ok) {
          setErrors({ email: 'Conta criada, mas erro ao fazer login automaticamente' })
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Authentication error:', error)
      setErrors({ email: 'Erro de conexão' })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // If onQuerySubmit is provided, use it instead of the order creation API
      if (onQuerySubmit) {
        onQuerySubmit(formData.documentNumber, formData.name, formData.phone)
        return
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'PROTEST_QUERY',
          documentNumber: formData.documentNumber,
          invoiceName: formData.invoiceName,
          invoiceDocument: formData.invoiceDocument,
          amount: 29.90,
          paymentMethod: formData.paymentMethod
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ submit: data.error || 'Erro ao criar pedido' })
        return
      }

      // Redirect to checkout page
      router.push(`/consulta-protesto/checkout?orderId=${data.order.id}`)

    } catch (error) {
      console.error('Order creation error:', error)
      setErrors({ submit: 'Erro de conexão' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Consulta de Protesto
              </h2>
              <p className="text-neutral-600">
                Informe seus dados para consulta
              </p>
              <div className="mt-4 p-4 bg-accent-50 rounded-lg border border-accent-200">
                <p className="text-accent-700 font-semibold text-lg">R$ 29,90</p>
                <p className="text-sm text-accent-600">Consulta completa em todo o Brasil</p>
              </div>
            </div>

            {/* Document field */}
            <InputDocument
              value={formData.documentNumber}
              onChange={(value, isValid, _, isValidating) => {
                updateFormData('documentNumber', value)
                setIsDocumentValid(isValid)
                setIsValidatingDocument(!!isValidating)
              }}
              placeholder="CPF ou CNPJ para consulta"
              error={errors.documentNumber}
              showValidation={true}
              validationDelay={600}
            />

            {/* Name field */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Nome completo/Razão Social"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className={cn(
                  "input-primary w-full min-h-12 sm:min-h-14",
                  errors.name && "border-amber-500 focus:border-amber-500 focus:ring-amber-500/10"
                )}
                aria-required="true"
              />
              {errors.name && (
                <p className="text-xs text-amber-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone field */}
            <InputPhone
              value={formData.phone}
              onChange={(value, isValid) => {
                updateFormData('phone', value)
                setIsPhoneValid(isValid)
              }}
              placeholder="Telefone com DDD (opcional)"
              error={errors.phone}
              showValidation={false}
            />

            {/* Show auth fields only if user is NOT logged in */}
            {!isLoggedIn && (
              <>
                {/* Email field */}
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={cn(
                      'input-primary w-full min-h-12 sm:min-h-14',
                      errors.email && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-amber-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Login/Register Toggle */}
                <div className="flex bg-neutral-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => updateFormData('isLogin', false)}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200',
                      !formData.isLogin
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    )}
                  >
                    Criar Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData('isLogin', true)}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200',
                      formData.isLogin
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    )}
                  >
                    Já tenho conta
                  </button>
                </div>

                {/* Password field */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className={cn(
                      'input-primary w-full pr-10 min-h-12 sm:min-h-14',
                      errors.password && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && (
                    <p className="text-sm text-amber-600 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm password field - only for registration */}
                {!formData.isLogin && (
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirmar senha"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      className={cn(
                        'input-primary w-full pr-10 min-h-12 sm:min-h-14',
                        errors.confirmPassword && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.confirmPassword && (
                      <p className="text-sm text-amber-600 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Show logged in message */}
            {isLoggedIn && userSession && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium text-success-800">Você já está logado</p>
                </div>
                <p className="text-sm text-success-700">
                  Logado como: <strong>{userSession.email}</strong>
                </p>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Pagamento
              </h2>
              <p className="text-neutral-600">
                Escolha como deseja pagar pela consulta
              </p>
              <div className="mt-4 p-4 bg-accent-50 rounded-lg border border-accent-200">
                <p className="text-accent-700 font-semibold text-xl">R$ 29,90</p>
                <p className="text-sm text-accent-600">Consulta de protesto completa</p>
              </div>
            </div>

            <PaymentMethodSelector
              selectedMethod={formData.paymentMethod}
              onSelect={(method) => updateFormData('paymentMethod', method)}
            />

            {errors.paymentMethod && (
              <p className="text-sm text-amber-600">{errors.paymentMethod}</p>
            )}

            {errors.submit && (
              <p className="text-sm text-amber-600">{errors.submit}</p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Finalizar Pagamento
              </h2>
              <p className="text-neutral-600">
                Confirme os dados do seu pedido e finalize o pagamento
              </p>
            </div>

            {/* Order Summary */}
            <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Resumo do Pedido</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Consulta de Protesto</span>
                  <span className="font-semibold text-neutral-900">R$ 29,90</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Documento:</span>
                  <span className="text-neutral-700">{formData.documentNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Nome:</span>
                  <span className="text-neutral-700">{formData.name}</span>
                </div>
                <div className="pt-3 border-t border-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-neutral-900">Total</span>
                    <span className="text-lg font-bold text-accent-600">R$ 29,90</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            {formData.paymentMethod === 'PIX' && (
              <div className="p-6 bg-white rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Pagamento via PIX</h4>
                    <p className="text-sm text-neutral-600">Pagamento instantâneo e seguro</p>
                  </div>
                </div>
                
                <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
                  <p className="text-sm text-accent-700 text-center">
                    <strong>Após clicar em "Finalizar", você será redirecionado para realizar o pagamento via PIX.</strong>
                  </p>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'CREDIT_CARD' && (
              <div className="p-6 bg-white rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Cartão de Crédito</h4>
                    <p className="text-sm text-neutral-600">Visa, Mastercard, Elo</p>
                  </div>
                </div>
                
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                  <p className="text-sm text-primary-700 text-center">
                    <strong>Após clicar em "Finalizar", você será redirecionado para inserir os dados do cartão.</strong>
                  </p>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'BOLETO' && (
              <div className="p-6 bg-white rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Boleto Bancário</h4>
                    <p className="text-sm text-neutral-600">Vencimento em 3 dias úteis</p>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700 text-center">
                    <strong>Após clicar em "Finalizar", o boleto será gerado para pagamento.</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Invoice Data */}
            <div className="p-6 bg-white rounded-lg border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Dados para Nota Fiscal</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nome/Razão Social para NF
                  </label>
                  <input
                    type="text"
                    placeholder="Nome ou Razão Social para NF"
                    value={formData.invoiceName}
                    onChange={(e) => updateFormData('invoiceName', e.target.value)}
                    className={cn(
                      'input-primary w-full min-h-12 sm:min-h-14',
                      errors.invoiceName && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                    )}
                  />
                  {errors.invoiceName && (
                    <p className="text-sm text-amber-600 mt-1">{errors.invoiceName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    CPF/CNPJ para NF
                  </label>
                  <InputDocument
                    value={formData.invoiceDocument}
                    onChange={(value, isValid) => {
                      updateFormData('invoiceDocument', value)
                      setIsInvoiceDocumentValid(isValid)
                    }}
                    placeholder="CPF ou CNPJ para NF"
                    error={errors.invoiceDocument}
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-success-50 rounded-lg border border-success-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-success-900 mb-1">
                    Ambiente 100% Seguro
                  </h5>
                  <p className="text-xs text-success-700">
                    Suas informações são protegidas com criptografia SSL de ponta a ponta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator currentStep={currentStep} steps={steps} />
      
      <div className="p-6 sm:p-8 bg-white rounded-card shadow-card">
        {renderStepContent()}
        
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="flex items-center justify-center gap-2 min-h-12 py-3 w-full sm:w-auto order-2 sm:order-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isLoading || isValidatingDocument}
            className="flex items-center justify-center gap-2 min-h-12 py-3 w-full sm:w-auto sm:min-w-[140px] order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm sm:text-base">Processando...</span>
              </>
            ) : isValidatingDocument ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm sm:text-base">Validando...</span>
              </>
            ) : currentStep === 3 ? (
              <span className="text-sm sm:text-base">Finalizar Pagamento</span>
            ) : (
              <>
                <span className="text-sm sm:text-base">Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}