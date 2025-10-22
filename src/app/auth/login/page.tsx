'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, HelpCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<'credentials' | 'network' | 'general'>('general')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setErrorType('general')

    try {
      console.log('Attempting login with:', { email: formData.email })
      
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (response.ok && data.success) {
        console.log('Login successful, redirecting...')
        window.location.href = '/dashboard'
      } else {
        // Determinar o tipo de erro baseado na resposta
        if (response.status === 401 || data.error?.includes('incorretos')) {
          setErrorType('credentials')
          setError('Não conseguimos encontrar uma conta com essas credenciais')
        } else if (response.status >= 500) {
          setErrorType('network')
          setError('Estamos com problemas técnicos no momento')
        } else {
          setErrorType('general')
          setError(data.error || 'Algo deu errado ao tentar fazer login')
        }
      }
    } catch (error) {
      console.error('Login exception:', error)
      setErrorType('network')
      setError('Não conseguimos conectar com nossos servidores')
    } finally {
      setIsLoading(false)
    }
  }

  const renderErrorMessage = () => {
    if (!error) return null

    const getErrorContent = () => {
      switch (errorType) {
        case 'credentials':
          return {
            icon: <AlertCircle className="w-4 h-4" />,
            title: 'Dados não encontrados',
            message: error,
            suggestions: (
              <div className="mt-2 text-sm space-y-1">
                <p>• Verifique se o email está correto</p>
                <p>• Certifique-se de que a senha está correta</p>
                <p>• 
                  <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-500 underline">
                    Esqueceu sua senha? Clique aqui para recuperar
                  </Link>
                </p>
              </div>
            )
          }
        case 'network':
          return {
            icon: <HelpCircle className="w-4 h-4" />,
            title: 'Problema de conexão',
            message: error,
            suggestions: (
              <div className="mt-2 text-sm space-y-1">
                <p>• Verifique sua conexão com a internet</p>
                <p>• Tente novamente em alguns minutos</p>
                <p>• Se o problema persistir, entre em contato conosco</p>
              </div>
            )
          }
        default:
          return {
            icon: <AlertCircle className="w-4 h-4" />,
            title: 'Oops! Algo não deu certo',
            message: error,
            suggestions: (
              <div className="mt-2 text-sm">
                <p>Tente novamente ou <Link href="/fale-conosco" className="text-blue-600 hover:text-blue-500 underline">entre em contato</Link> se o problema persistir.</p>
              </div>
            )
          }
      }
    }

    const errorContent = getErrorContent()

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 text-amber-600 mt-0.5">
            {errorContent.icon}
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-sm font-medium text-amber-800 mb-1">
              {errorContent.title}
            </h4>
            <p className="text-sm text-amber-700 mb-2">
              {errorContent.message}
            </p>
            <div className="text-amber-600">
              {errorContent.suggestions}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-floating bg-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-neutral-600">
              Faça login para acessar sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-primary w-full min-h-12 sm:min-h-14"
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="input-primary w-full min-h-12 sm:min-h-14"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-neutral-600">Lembrar de mim</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {renderErrorMessage()}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center min-h-12 sm:min-h-14 py-3 sm:py-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Não tem uma conta?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}