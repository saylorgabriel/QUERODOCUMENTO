'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { InputDocument } from '@/components/ui/input-document'
import { InputPhone } from '@/components/ui/input-phone'
import { StepIndicator } from './StepIndicator'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { ArrowRight, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  // Step 1: Document consultation
  documentNumber: string
  
  // Step 2: User data (registration/login)
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  isLogin: boolean
  
  // Step 3: Invoice data
  invoiceName: string
  invoiceDocument: string
  
  // Step 4: Payment
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | null
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
      title: 'Consulta',
      description: 'Documento para consulta'
    },
    {
      number: 2,
      title: 'Dados',
      description: 'Login ou cadastro'
    },
    {
      number: 3,
      title: 'Nota Fiscal',
      description: 'Dados para NF'
    },
    {
      number: 4,
      title: 'Pagamento',
      description: 'Forma de pagamento'
    }
  ]

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'CPF ou CNPJ é obrigatório'
    } else if (!isDocumentValid) {
      newErrors.documentNumber = 'CPF ou CNPJ inválido'
    }

    // If onQuerySubmit is provided, also validate name for direct query
    if (onQuerySubmit) {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório'
      }
      
      if (formData.phone && !isPhoneValid) {
        newErrors.phone = 'Telefone inválido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.isLogin) {
      // Registration validation
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório'
      }
      
      if (!formData.password.trim()) {
        newErrors.password = 'Senha é obrigatória'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!isPhoneValid) {
      newErrors.phone = 'Telefone inválido'
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

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Escolha uma forma de pagamento'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    let isValid = false

    switch (currentStep) {
      case 1:
        isValid = validateStep1()
        // If onQuerySubmit is provided, handle direct query
        if (isValid && onQuerySubmit) {
          onQuerySubmit(formData.documentNumber, formData.name, formData.phone)
          return
        }
        break
      case 2:
        isValid = validateStep2()
        if (isValid) {
          // Handle authentication
          isValid = await handleAuthentication()
        }
        break
      case 3:
        isValid = validateStep3()
        break
      case 4:
        isValid = validateStep4()
        if (isValid) {
          await handleSubmit()
          return
        }
        break
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleAuthentication = async () => {
    setIsLoading(true)
    
    try {
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
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            document: formData.documentNumber,
            phone: formData.phone
          })
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

      // Redirect to success page
      router.push(`/consulta-protesto/sucesso?orderId=${data.order.id}`)
      
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
                {onQuerySubmit 
                  ? 'Preencha os dados abaixo para iniciar sua consulta'
                  : 'Digite o CPF ou CNPJ que deseja consultar'
                }
              </p>
              {!onQuerySubmit && (
                <div className="mt-4 p-4 bg-accent-50 rounded-lg border border-accent-200">
                  <p className="text-accent-700 font-semibold text-lg">R$ 29,90</p>
                  <p className="text-sm text-accent-600">Consulta completa em todo o Brasil</p>
                </div>
              )}
            </div>

            {/* Name field - always show when in direct query mode */}
            {onQuerySubmit && (
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
            )}

            <InputDocument
              value={formData.documentNumber}
              onChange={(value, isValid, type, isValidating) => {
                updateFormData('documentNumber', value)
                setIsDocumentValid(isValid)
                setIsValidatingDocument(!!isValidating)
              }}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              error={errors.documentNumber}
              showValidation={true}
              validationDelay={600}
            />

            {/* Phone field - show when in direct query mode */}
            {onQuerySubmit && (
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
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Seus Dados
              </h2>
              <p className="text-neutral-600">
                {formData.isLogin ? 'Faça login para continuar' : 'Crie sua conta para prosseguir'}
              </p>
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

            {!formData.isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={cn(
                    'input-primary w-full min-h-12 sm:min-h-14',
                    errors.name && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-amber-600 mt-1">{errors.name}</p>
                )}
              </div>
            )}

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

            <InputPhone
              value={formData.phone}
              onChange={(value, isValid) => {
                updateFormData('phone', value)
                setIsPhoneValid(isValid)
              }}
              placeholder="(00) 00000-0000"
              error={errors.phone}
            />

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
          </div>
        )

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Dados da Nota Fiscal
              </h2>
              <p className="text-neutral-600">
                Informe os dados para emissão da nota fiscal
              </p>
            </div>

            <div>
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

            <InputDocument
              value={formData.invoiceDocument}
              onChange={(value, isValid) => {
                updateFormData('invoiceDocument', value)
                setIsInvoiceDocumentValid(isValid)
              }}
              placeholder="CPF ou CNPJ para NF"
              error={errors.invoiceDocument}
            />

            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-600">
                <strong>Importante:</strong> Os dados informados serão utilizados para emissão da nota fiscal. 
                Certifique-se de que estão corretos.
              </p>
            </div>
          </div>
        )

      case 4:
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
            ) : currentStep === 4 ? (
              <span className="text-sm sm:text-base">Finalizar Pedido</span>
            ) : currentStep === 1 && onQuerySubmit ? (
              <span className="text-sm sm:text-base">Consultar Protestos</span>
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