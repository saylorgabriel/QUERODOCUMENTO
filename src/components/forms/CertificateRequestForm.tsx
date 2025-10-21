'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { InputPhone } from '@/components/ui/input-phone'
import { InputDocument } from '@/components/ui/input-document'
import { StepIndicator } from './StepIndicator'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { LocationSelector } from './LocationSelector'
import { ReasonSelector } from './ReasonSelector'
import { ArrowRight, ArrowLeft, Loader2, Eye, EyeOff, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  // Step 1: Location selection
  state: string | null
  city: string | null
  notary: string | null
  useAllNotaries: boolean
  statePrice: number

  // Step 2: User authentication (using existing session or login)
  name: string
  email: string
  phone: string
  document: string
  rg: string
  address: string
  addressNumber: string
  addressComplement: string
  neighborhood: string
  userCity: string
  userState: string
  zipCode: string
  password: string
  confirmPassword: string
  isLogin: boolean

  // Step 3: Certificate reason
  reason: string | null
  customReason: string

  // Step 4: Payment method
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | null
}

interface CertificateRequestFormProps {
  initialUserData?: {
    name?: string
    email?: string
    phone?: string
  }
}

export function CertificateRequestForm({ initialUserData }: CertificateRequestFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [isDocumentValid, setIsDocumentValid] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasActiveSession, setHasActiveSession] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    state: null,
    city: null,
    notary: null,
    useAllNotaries: false,
    statePrice: 89.90, // Default base price
    name: initialUserData?.name || '',
    email: initialUserData?.email || '',
    phone: initialUserData?.phone || '',
    document: '',
    rg: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    userCity: '',
    userState: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
    isLogin: false,
    reason: null,
    customReason: '',
    paymentMethod: null
  })

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/simple-session')
        if (response.ok) {
          await response.json()
          setHasActiveSession(true)
          // Don't pre-fill any fields - user should enter the searched person's data
        }
      } catch (error) {
        console.error('Session check failed:', error)
      }
      setSessionChecked(true)
    }
    
    checkSession()
  }, [])

  // Steps configuration
  const steps = [
    {
      number: 1,
      title: 'Localização',
      description: 'Estado, cidade e cartório'
    },
    {
      number: 2,
      title: 'Dados',
      description: hasActiveSession ? 'Confirmar dados' : 'Login ou cadastro'
    },
    {
      number: 3,
      title: 'Motivo',
      description: 'Finalidade da certidão'
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

  const handleLocationChange = (location: {
    state: string | null
    city: string | null
    notary: string | null
    useAllNotaries: boolean
  }) => {
    setFormData(prev => ({ ...prev, ...location }))
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.state) {
      newErrors.state = 'Selecione um estado'
    }
    
    if (!formData.city) {
      newErrors.city = 'Selecione uma cidade'
    }
    
    if (!formData.useAllNotaries && !formData.notary) {
      newErrors.notary = 'Selecione um cartório ou marque "Consultar todos os cartórios"'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (hasActiveSession) {
      // Just validate that we have the required data
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email é obrigatório'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Email inválido'
        }
      }
      if (!formData.document.trim()) {
        newErrors.document = 'CPF/CNPJ é obrigatório'
      } else if (!isDocumentValid) {
        newErrors.document = 'CPF/CNPJ inválido'
      }
      if (!formData.rg.trim()) {
        newErrors.rg = 'RG é obrigatório'
      }
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'CEP é obrigatório'
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Endereço é obrigatório'
      }
      if (!formData.addressNumber.trim()) {
        newErrors.addressNumber = 'Número é obrigatório'
      }
      if (!formData.neighborhood.trim()) {
        newErrors.neighborhood = 'Bairro é obrigatório'
      }
      if (!formData.userCity.trim()) {
        newErrors.userCity = 'Cidade é obrigatória'
      }
      if (!formData.userState.trim()) {
        newErrors.userState = 'Estado é obrigatório'
      } else if (formData.userState.length !== 2) {
        newErrors.userState = 'Estado deve ter 2 letras (UF)'
      }
    } else {
      // Full authentication validation
      if (!formData.isLogin) {
        // Registration validation
        if (!formData.name.trim()) {
          newErrors.name = 'Nome é obrigatório'
        }

        if (!formData.document.trim()) {
          newErrors.document = 'CPF/CNPJ é obrigatório'
        } else if (!isDocumentValid) {
          newErrors.document = 'CPF/CNPJ inválido'
        }

        if (!formData.rg.trim()) {
          newErrors.rg = 'RG é obrigatório'
        }

        if (!formData.zipCode.trim()) {
          newErrors.zipCode = 'CEP é obrigatório'
        }

        if (!formData.address.trim()) {
          newErrors.address = 'Endereço é obrigatório'
        }

        if (!formData.addressNumber.trim()) {
          newErrors.addressNumber = 'Número é obrigatório'
        }

        if (!formData.neighborhood.trim()) {
          newErrors.neighborhood = 'Bairro é obrigatório'
        }

        if (!formData.userCity.trim()) {
          newErrors.userCity = 'Cidade é obrigatória'
        }

        if (!formData.userState.trim()) {
          newErrors.userState = 'Estado é obrigatório'
        } else if (formData.userState.length !== 2) {
          newErrors.userState = 'Estado deve ter 2 letras (UF)'
        }

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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.reason) {
      newErrors.reason = 'Selecione o motivo da solicitação'
    }
    
    if (formData.reason === 'other' && !formData.customReason.trim()) {
      newErrors.customReason = 'Especifique o motivo da solicitação'
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
        break
      case 2:
        isValid = validateStep2()
        if (isValid && !hasActiveSession) {
          // Handle authentication for new users
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
            document: formData.document,
            phone: formData.phone,
            rg: formData.rg,
            address: formData.address,
            addressNumber: formData.addressNumber,
            addressComplement: formData.addressComplement,
            neighborhood: formData.neighborhood,
            city: formData.userCity,
            state: formData.userState,
            zipCode: formData.zipCode
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
          serviceType: 'CERTIFICATE_REQUEST',
          documentNumber: formData.document, // Document being consulted
          amount: formData.statePrice, // Price based on selected state
          paymentMethod: formData.paymentMethod,
          // Certificate specific fields
          state: formData.state,
          city: formData.city,
          notaryOffice: formData.useAllNotaries ? 'ALL' : formData.notary,
          reason: formData.reason === 'other' ? formData.customReason : formData.reason,
          // Searched person data
          name: formData.name,
          email: formData.email,
          rg: formData.rg,
          address: formData.address,
          addressNumber: formData.addressNumber,
          addressComplement: formData.addressComplement,
          neighborhood: formData.neighborhood,
          userCity: formData.userCity,
          userState: formData.userState,
          zipCode: formData.zipCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ submit: data.error || 'Erro ao criar pedido' })
        return
      }

      // Redirect to checkout page to process payment
      router.push(`/certidao-protesto/checkout?orderId=${data.order.id}`)

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
                Certidão de Protesto
              </h2>
              <p className="text-neutral-600 mb-4">
                Selecione onde deseja solicitar a certidão
              </p>
              <div className="p-4 bg-accent-50 rounded-lg border border-accent-200">
                <p className="text-accent-700 font-semibold text-lg">
                  {formData.state
                    ? `R$ ${formData.statePrice.toFixed(2)}`
                    : 'A partir de R$ 48,62'
                  }
                </p>
                <p className="text-sm text-accent-600">
                  {formData.state
                    ? 'Valor base para o estado selecionado'
                    : 'Selecione o estado para ver o valor'
                  }
                </p>
              </div>
            </div>

            <LocationSelector
              selectedState={formData.state}
              selectedCity={formData.city}
              selectedNotary={formData.notary}
              useAllNotaries={formData.useAllNotaries}
              onLocationChange={handleLocationChange}
            />

            {(errors.state || errors.city || errors.notary) && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    {errors.state && <p className="text-sm text-amber-600">{errors.state}</p>}
                    {errors.city && <p className="text-sm text-amber-600">{errors.city}</p>}
                    {errors.notary && <p className="text-sm text-amber-600">{errors.notary}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        if (!sessionChecked) {
          return (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          )
        }

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                {hasActiveSession ? 'Dados do Pesquisado' : 'Seus Dados'}
              </h2>
              <p className="text-neutral-600">
                {hasActiveSession
                  ? 'Informe os dados da pessoa ou empresa que constará na certidão de protesto'
                  : (formData.isLogin ? 'Faça login para continuar' : 'Crie sua conta para prosseguir')
                }
              </p>
            </div>

            {hasActiveSession ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Digite o nome completo do pesquisado"
                    className={cn(
                      'input-primary w-full min-h-12 sm:min-h-14',
                      errors.name && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-amber-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className={cn(
                      'input-primary w-full min-h-12 sm:min-h-14',
                      errors.email && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-amber-600 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    CPF/CNPJ
                  </label>
                  <InputDocument
                    value={formData.document}
                    onChange={(value, isValid) => {
                      updateFormData('document', value)
                      setIsDocumentValid(isValid)
                    }}
                    placeholder="CPF ou CNPJ"
                    error={errors.document}
                    className="min-h-12 sm:min-h-14"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    RG
                  </label>
                  <input
                    type="text"
                    value={formData.rg}
                    onChange={(e) => updateFormData('rg', e.target.value)}
                    placeholder="Número do RG"
                    className={cn(
                      'input-primary w-full min-h-12 sm:min-h-14',
                      errors.rg && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                    )}
                  />
                  {errors.rg && (
                    <p className="text-sm text-amber-600 mt-1">{errors.rg}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    placeholder="00000-000"
                    className={cn(
                      'input-primary w-full min-h-12 sm:min-h-14',
                      errors.zipCode && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                    )}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-amber-600 mt-1">{errors.zipCode}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="Rua, Avenida, etc"
                      className={cn(
                        'input-primary w-full min-h-12 sm:min-h-14',
                        errors.address && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                      )}
                    />
                    {errors.address && (
                      <p className="text-sm text-amber-600 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.addressNumber}
                      onChange={(e) => updateFormData('addressNumber', e.target.value)}
                      placeholder="Nº"
                      className={cn(
                        'input-primary w-full min-h-12 sm:min-h-14',
                        errors.addressNumber && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                      )}
                    />
                    {errors.addressNumber && (
                      <p className="text-sm text-amber-600 mt-1">{errors.addressNumber}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.addressComplement}
                    onChange={(e) => updateFormData('addressComplement', e.target.value)}
                    placeholder="Apt, Bloco, etc (opcional)"
                    className="input-primary w-full min-h-12 sm:min-h-14"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => updateFormData('neighborhood', e.target.value)}
                    placeholder="Bairro"
                    className={cn(
                      'input-primary w-full min-h-12 sm:min-h-14',
                      errors.neighborhood && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                    )}
                  />
                  {errors.neighborhood && (
                    <p className="text-sm text-amber-600 mt-1">{errors.neighborhood}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.userCity}
                      onChange={(e) => updateFormData('userCity', e.target.value)}
                      placeholder="Cidade"
                      className={cn(
                        'input-primary w-full min-h-12 sm:min-h-14',
                        errors.userCity && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                      )}
                    />
                    {errors.userCity && (
                      <p className="text-sm text-amber-600 mt-1">{errors.userCity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.userState}
                      onChange={(e) => updateFormData('userState', e.target.value)}
                      placeholder="UF"
                      maxLength={2}
                      className={cn(
                        'input-primary w-full min-h-12 sm:min-h-14 uppercase',
                        errors.userState && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                      )}
                    />
                    {errors.userState && (
                      <p className="text-sm text-amber-600 mt-1">{errors.userState}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
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

                {!formData.isLogin && (
                  <InputDocument
                    value={formData.document}
                    onChange={(value, isValid) => {
                      updateFormData('document', value)
                      setIsDocumentValid(isValid)
                    }}
                    placeholder="CPF ou CNPJ"
                    error={errors.document}
                    className="min-h-12 sm:min-h-14"
                  />
                )}

                <InputPhone
                  value={formData.phone}
                  onChange={(value, isValid) => {
                    updateFormData('phone', value)
                    setIsPhoneValid(isValid)
                  }}
                  placeholder="(00) 00000-0000"
                  error={errors.phone}
                />

                {!formData.isLogin && (
                  <>
                    <div>
                      <input
                        type="text"
                        value={formData.rg}
                        onChange={(e) => updateFormData('rg', e.target.value)}
                        placeholder="RG"
                        className={cn(
                          'input-primary w-full min-h-12 sm:min-h-14',
                          errors.rg && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                        )}
                      />
                      {errors.rg && (
                        <p className="text-sm text-amber-600 mt-1">{errors.rg}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => updateFormData('zipCode', e.target.value)}
                        placeholder="CEP"
                        className={cn(
                          'input-primary w-full min-h-12 sm:min-h-14',
                          errors.zipCode && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                        )}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-amber-600 mt-1">{errors.zipCode}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => updateFormData('address', e.target.value)}
                          placeholder="Endereço"
                          className={cn(
                            'input-primary w-full min-h-12 sm:min-h-14',
                            errors.address && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                          )}
                        />
                        {errors.address && (
                          <p className="text-sm text-amber-600 mt-1">{errors.address}</p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          value={formData.addressNumber}
                          onChange={(e) => updateFormData('addressNumber', e.target.value)}
                          placeholder="Número"
                          className={cn(
                            'input-primary w-full min-h-12 sm:min-h-14',
                            errors.addressNumber && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                          )}
                        />
                        {errors.addressNumber && (
                          <p className="text-sm text-amber-600 mt-1">{errors.addressNumber}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.addressComplement}
                        onChange={(e) => updateFormData('addressComplement', e.target.value)}
                        placeholder="Complemento (opcional)"
                        className="input-primary w-full min-h-12 sm:min-h-14"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.neighborhood}
                        onChange={(e) => updateFormData('neighborhood', e.target.value)}
                        placeholder="Bairro"
                        className={cn(
                          'input-primary w-full min-h-12 sm:min-h-14',
                          errors.neighborhood && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                        )}
                      />
                      {errors.neighborhood && (
                        <p className="text-sm text-amber-600 mt-1">{errors.neighborhood}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={formData.userCity}
                          onChange={(e) => updateFormData('userCity', e.target.value)}
                          placeholder="Cidade"
                          className={cn(
                            'input-primary w-full min-h-12 sm:min-h-14',
                            errors.userCity && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                          )}
                        />
                        {errors.userCity && (
                          <p className="text-sm text-amber-600 mt-1">{errors.userCity}</p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          value={formData.userState}
                          onChange={(e) => updateFormData('userState', e.target.value)}
                          placeholder="Estado (UF)"
                          maxLength={2}
                          className={cn(
                            'input-primary w-full min-h-12 sm:min-h-14 uppercase',
                            errors.userState && 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10'
                          )}
                        />
                        {errors.userState && (
                          <p className="text-sm text-amber-600 mt-1">{errors.userState}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

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
              </>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Finalidade da Certidão
              </h2>
              <p className="text-neutral-600">
                Informe o motivo para solicitação da certidão
              </p>
            </div>

            <ReasonSelector
              selectedReason={formData.reason}
              customReason={formData.customReason}
              onReasonChange={(reasonId, customReason = '') => {
                updateFormData('reason', reasonId)
                updateFormData('customReason', customReason)
              }}
            />

            {(errors.reason || errors.customReason) && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    {errors.reason && <p className="text-sm text-amber-600">{errors.reason}</p>}
                    {errors.customReason && <p className="text-sm text-amber-600">{errors.customReason}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Pagamento
              </h2>
              <div className="mt-4 p-4 bg-accent-50 rounded-lg border border-accent-200">
                <p className="text-accent-700 font-semibold text-xl">
                  R$ {formData.statePrice.toFixed(2)}
                </p>
                <p className="text-sm text-accent-600">
                  Valor base para {formData.state ? 'o estado selecionado' : 'certidão de protesto'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-neutral-900 mb-2">
                    Como funciona o processo:
                  </h5>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    {/* <li>• Você receberá um orçamento detalhado em até 3 dias úteis</li> */}
                    <li>• Terá 3 dias úteis para efetuar o pagamento</li>
                    <li>• A certidão será emitida em até 5 dias úteis após o pagamento</li>
                    <li>• Você receberá o documento por email e poderá baixar no painel</li>
                    <li>• Se identificado mais de um protesto, poderá ocorrer cobrança adicional</li>
                  </ul>
                </div>
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
      
      <div className="card-floating">
        {renderStepContent()}
        
        <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="flex items-center gap-2 min-h-10 sm:min-h-12 py-2 sm:py-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2 min-w-[140px] min-h-12 sm:min-h-14 py-3 sm:py-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : currentStep === 4 ? (
              'Efetuar Pagamento'
            ) : (
              <>
                Continuar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}