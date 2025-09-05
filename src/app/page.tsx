'use client'

import { Button } from '@/components/ui/button'
import { InputDocument } from '@/components/ui/input-document'
import { InputPhone } from '@/components/ui/input-phone'
import { Search, FileText, Shield, Clock, Users, Award, CheckCircle2, Phone } from 'lucide-react'
import RegistrySeal from '@/components/ui/RegistrySeal'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    documentNumber: '',
    name: '',
    phone: ''
  })
  const [isDocumentValid, setIsDocumentValid] = useState(false)
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidatingDocument, setIsValidatingDocument] = useState(false)

  // Função para validação customizada no lugar do HTML5 required
  const validateFormFields = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'CPF ou CNPJ é obrigatório'
    } else if (!isDocumentValid) {
      newErrors.documentNumber = 'CPF ou CNPJ inválido'
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!isPhoneValid) {
      newErrors.phone = 'Telefone inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Function to capture lead data for remarketing
  const captureLeadData = async () => {
    try {
      // Get UTM parameters from URL if available
      const urlParams = new URLSearchParams(window.location.search)
      
      const leadData = {
        documentNumber: formData.documentNumber,
        name: formData.name,
        phone: formData.phone || undefined,
        source: 'landing_page',
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        metadata: {
          formSource: 'hero_form',
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
          timestamp: new Date().toISOString()
        }
      }

      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Lead captured successfully:', result)
      
      // Optional: Track the event for analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'lead_capture', {
          event_category: 'engagement',
          event_label: 'hero_form',
          value: 1
        })
      }

      return result
    } catch (error) {
      console.error('Failed to capture lead data:', error)
      // Don't throw error to prevent blocking the main flow
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Não permitir submit se ainda estiver validando
    if (isValidatingDocument) {
      return
    }
    
    // Validar campos usando função customizada
    if (validateFormFields()) {
      setIsSubmitting(true)
      
      try {
        // Capture lead data first
        await captureLeadData()
        
        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Redirect to consultation page with pre-filled data
        const params = new URLSearchParams({
          documentNumber: formData.documentNumber,
          name: formData.name,
          phone: formData.phone
        })
        router.push(`/consulta-protesto?${params.toString()}`)
      } catch (error) {
        console.error('Error in form submission:', error)
        setIsSubmitting(false)
        // Continue with redirect even if lead capture fails
        const params = new URLSearchParams({
          documentNumber: formData.documentNumber,
          name: formData.name,
          phone: formData.phone
        })
        router.push(`/consulta-protesto?${params.toString()}`)
      }
    }
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const scrollToHero = () => {
    const heroSection = document.querySelector('.hero-section')
    if (heroSection) {
      heroSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section - Modern Professional Design */}
      <section className="relative overflow-hidden min-h-[85vh] sm:min-h-[75vh] lg:min-h-[70vh] flex items-center justify-center px-4 py-12 sm:py-16 lg:py-24">
        {/* Enhanced Background with Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl animate-subtle-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-subtle-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-breathe" style={{animationDelay: '2s'}}></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        
        <div className="container-padded relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left Side - Enhanced Content */}
            <div className="text-white space-y-8 lg:space-y-10 order-2 lg:order-1 text-center lg:text-left animate-slide-in-left">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 lg:mb-8 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text">
                  Consulte protestos,
                  <span className="block text-transparent bg-gradient-to-r from-accent-400 via-accent-300 to-accent-400 bg-clip-text animate-gradient-shift" style={{backgroundSize: '200% auto'}}>faça a busca agora!</span>
                </h1>
                <p className="text-xl sm:text-2xl lg:text-3xl text-blue-100/90 font-light leading-relaxed max-w-3xl mx-auto lg:mx-0">
                  Evite surpresas e tenha <strong className="font-semibold text-white">controle total</strong> dos seus dados nos cartórios de todo o Brasil.
                </p>
              </div>
              
              {/* Enhanced Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 sm:gap-8">
                <div className="flex -space-x-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-success-400 to-success-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg hover:scale-110 transition-transform duration-300" style={{transitionDelay: '100ms'}}>
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg hover:scale-110 transition-transform duration-300" style={{transitionDelay: '200ms'}}>
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                </div>
                <div className="text-blue-100 text-center lg:text-left">
                  <div className="flex items-center gap-1 mb-3 justify-center lg:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-sm shadow-sm hover:scale-110 transition-transform duration-200" style={{transitionDelay: `${i * 50}ms`}} />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base font-semibold mb-2 text-white">Atendimento via WhatsApp</p>
                  <p className="text-sm text-blue-200 leading-relaxed">Resposta em até <span className="font-semibold text-accent-300">24h</span> com nossa equipe especializada</p>
                </div>
              </div>
            </div>

            {/* Right Side - Enhanced Form Card */}
            <div className="lg:justify-self-end w-full max-w-lg mx-auto lg:mx-0 relative order-1 lg:order-2 animate-slide-in-right">
              {/* Registry Seal - Enhanced positioning */}
              <div className="absolute -left-32 bottom-44 hidden xl:block z-20 animate-float">
                <div className="relative">
                  <RegistrySeal />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-xl animate-pulse"></div>
                </div>
              </div>
              <div className="card-modern relative z-10 overflow-hidden">
                {/* Card Background Enhancement */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-white opacity-60"></div>
                <div className="relative z-10">
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent mb-4 text-center lg:text-left leading-tight">
                    Consulte protestos em<br className="hidden sm:block" /><span className="text-accent-600"> poucos passos</span>
                  </h3>
                  
                  {/* Enhanced Step Indicators */}
                  <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-6 lg:mb-8">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full text-sm font-bold shadow-md">
                        1
                      </div>
                      <div className="w-8 h-0.5 bg-gradient-to-r from-primary-500 to-neutral-300 hidden sm:block"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-neutral-200 text-neutral-500 rounded-full text-sm font-bold">
                        2
                      </div>
                      <div className="w-8 h-0.5 bg-neutral-200 hidden sm:block"></div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-neutral-200 text-neutral-500 rounded-full text-sm font-bold">
                      3
                    </div>
                  </div>
                </div>

                <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
                <div className="relative">
                    <input 
                      type="text"
                      placeholder="Nome Completo/Razão Social"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
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

                  <InputDocument
                    value={formData.documentNumber}
                    onChange={(value, isValid, _, isValidating) => {
                      updateField('documentNumber', value)
                      setIsDocumentValid(isValid)
                      setIsValidatingDocument(!!isValidating)
                    }}
                    placeholder="CPF ou CNPJ para consulta"
                    error={errors.documentNumber}
                    showValidation={true}
                    validationDelay={600}
                  />
                  
                  <InputPhone
                    value={formData.phone}
                    onChange={(value, isValid) => {
                      updateField('phone', value)
                      setIsPhoneValid(isValid)
                    }}
                    placeholder="Telefone com DDD"
                    error={errors.phone}
                    showValidation={false}
                  />
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting || isValidatingDocument}
                    className="btn-primary w-full text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none min-h-14 sm:min-h-16 py-4 sm:py-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>PROCESSANDO...</span>
                      </>
                    ) : isValidatingDocument ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>VALIDANDO...</span>
                      </>
                    ) : (
                      <>
                        <span>INICIAR CONSULTA</span>
                        {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg> */}
                      </>
                    )}
                  </button>
                  
                  {/* Enhanced LGPD Compliance Text */}
                  <p className="text-sm sm:text-base text-neutral-600 text-center mt-6 sm:mt-8 px-4 leading-relaxed">
                    Ao continuar, você concorda com nossos{" "}
                    <a 
                      href="/termos-de-uso" 
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 hover:underline underline-offset-2"
                      target="_blank"
                    >
                      Termos de Uso
                    </a>{" "}
                    e{" "}
                    <a 
                      href="/politica-de-privacidade" 
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 hover:underline underline-offset-2"
                      target="_blank"
                    >
                      Política de Privacidade
                    </a>
                  </p>
                </form>

                {/* Enhanced Security Badges */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-8 pt-8 border-t border-neutral-200/50">
                  <div className="flex items-center gap-3 px-3 py-2 bg-green-50 rounded-lg border border-green-200/50">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-700">SSL SEGURO</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700">SITE BLINDADO</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200/50">
                    <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-700">100% SEGURO</span>
                  </div>
                </div>
                
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* Enhanced How it Works Section */}
      <section id="como-funciona" className="py-16 sm:py-20 lg:py-28 bg-gradient-subtle relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-100/30 rounded-full blur-3xl"></div>
        
        <div className="container-padded relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-medium text-sm mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Processo Simples
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-900 bg-clip-text text-transparent mb-6 leading-tight">Como Funciona</h2>
            <p className="text-xl sm:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Processo <span className="font-semibold text-primary-700">simples e profissional</span> com resultado garantido em até 24h
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-16">
            <div className="text-center group hover-lift">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-accent-400 to-accent-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
                  1
                </div>
                {/* Connecting line */}
                <div className="hidden md:block absolute top-12 left-full w-16 lg:w-32 h-0.5 bg-gradient-to-r from-primary-300 to-success-300"></div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">Digite seus dados</h3>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-sm mx-auto">
                Informe seu <span className="font-semibold text-primary-700">CPF ou CNPJ</span> no formulário seguro e efetue o pagamento
              </p>
            </div>
            
            <div className="text-center group hover-lift">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-success-500 to-success-700 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-accent-400 to-accent-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
                  2
                </div>
                {/* Connecting line */}
                <div className="hidden md:block absolute top-12 left-full w-16 lg:w-32 h-0.5 bg-gradient-to-r from-success-300 to-accent-300"></div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">Processamento</h3>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-sm mx-auto">
                Nossa equipe inicia a <span className="font-semibold text-success-700">verificação</span> em todos os cartórios do Brasil
              </p>
            </div>
            
            <div className="text-center group hover-lift">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-accent-400 to-accent-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
                  3
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">Receba o resultado</h3>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-sm mx-auto">
                Resultado em <span className="font-semibold text-accent-700">até 24 horas</span> por email com relatório completo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container-padded">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 sm:mb-6">
                100% Seguro e Confiável
              </h2>
              <p className="text-lg sm:text-xl text-neutral-600 mb-6 sm:mb-8 leading-relaxed">
                Seus dados são protegidos com criptografia de ponta a ponta. 
                Estamos em conformidade com a LGPD e todos os documentos são oficiais.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-start gap-3 p-3 sm:p-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-success-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1 text-sm sm:text-base">Criptografia SSL</h4>
                    <p className="text-xs sm:text-sm text-neutral-600">Proteção total dos seus dados</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 sm:p-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1 text-sm sm:text-base">LGPD Compliance</h4>
                    <p className="text-xs sm:text-sm text-neutral-600">Conforme regulamentação</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 sm:p-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1 text-sm sm:text-base">Documentos Oficiais</h4>
                    <p className="text-xs sm:text-sm text-neutral-600">Validade jurídica garantida</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 sm:p-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-success-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1 text-sm sm:text-base">Resposta em até 24h</h4>
                    <p className="text-xs sm:text-sm text-neutral-600">Atendimento via WhatsApp com especialistas</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:justify-self-center order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="relative mx-auto max-w-xs lg:max-w-none">
                <div className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 lg:-top-4 lg:-right-4 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-accent-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="absolute -bottom-3 -left-3 lg:-bottom-4 lg:-left-4 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-success-500 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-primary text-white">
        <div className="container-padded text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comece Agora Mesmo</h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Consulte protestos ou solicite sua certidão oficial de forma rápida e segura
          </p>
          <button 
            onClick={scrollToHero}
            className="btn-primary inline-flex items-center gap-2 sm:gap-3 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 cursor-pointer hover:scale-105 transition-transform duration-200 min-h-12 sm:min-h-14"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            Fazer Primeira Consulta
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-12 sm:py-16 bg-neutral-100">
        <div className="container-padded text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4 sm:mb-6">Fale Conosco</h2>
          <p className="text-base sm:text-lg text-neutral-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Nossa equipe está sempre disponível para ajudar você. Entre em contato conosco!
          </p>
          
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 max-w-2xl mx-auto">
            {/* Telefone 0800 temporariamente oculto
            <div className="flex items-center justify-center gap-3 p-4 sm:p-6 bg-white rounded-lg shadow-sm min-h-20 sm:min-h-24">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-neutral-900 text-sm sm:text-base">Telefone</p>
                <p className="text-neutral-600 text-sm sm:text-base">0800-xxx-xxxx</p>
              </div>
            </div>
            */}
            
            <div className="flex items-center justify-center gap-3 p-4 sm:p-6 bg-white rounded-lg shadow-sm min-h-20 sm:min-h-24">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
              </svg>
              <div className="text-left">
                <p className="font-semibold text-neutral-900 text-sm sm:text-base">WhatsApp</p>
                <p className="text-neutral-600 text-sm sm:text-base">Resposta em até 24h</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}