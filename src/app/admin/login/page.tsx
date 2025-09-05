'use client'

// Force dynamic rendering for this page due to searchParams usage
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AdminLoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<'credentials' | 'access' | 'network' | 'general'>('general')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  useEffect(() => {
    // Clear any previous error when user starts typing
    if (error) {
      setError('')
      setErrorType('general')
    }
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setErrorType('general')

    try {
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setErrorType('credentials')
          setError('Credenciais administrativas inválidas')
        } else if (response.status >= 500) {
          setErrorType('network')
          setError('Sistema temporariamente indisponível')
        } else {
          setErrorType('general')
          setError(data.error || 'Falha no processo de autenticação')
        }
        return
      }

      // Check if user is admin
      if (data.user?.role !== 'ADMIN') {
        setErrorType('access')
        setError('Esta conta não possui privilégios administrativos')
        return
      }

      // Redirect to admin area
      router.replace(callbackUrl)
    } catch (err) {
      setErrorType('network')
      setError('Não foi possível conectar ao sistema')
    } finally {
      setLoading(false)
    }
  }

  const renderErrorMessage = () => {
    if (!error) return null

    const getErrorContent = () => {
      switch (errorType) {
        case 'credentials':
          return {
            title: 'Credenciais inválidas',
            message: error,
            suggestions: (
              <div className="mt-2 text-sm space-y-1 text-amber-700">
                <p>• Verifique se o email administrativo está correto</p>
                <p>• Confirme a senha de administrador</p>
                <p>• Entre em contato com o suporte técnico se necessário</p>
              </div>
            )
          }
        case 'access':
          return {
            title: 'Acesso não autorizado',
            message: error,
            suggestions: (
              <div className="mt-2 text-sm text-amber-700">
                <p>Esta área é exclusiva para administradores do sistema. Se você acredita que deveria ter acesso, entre em contato com o administrador principal.</p>
              </div>
            )
          }
        case 'network':
          return {
            title: 'Problema técnico',
            message: error,
            suggestions: (
              <div className="mt-2 text-sm space-y-1 text-amber-700">
                <p>• Aguarde alguns minutos e tente novamente</p>
                <p>• Verifique sua conexão de internet</p>
                <p>• Se o problema persistir, contate o suporte técnico</p>
              </div>
            )
          }
        default:
          return {
            title: 'Erro no sistema',
            message: error,
            suggestions: (
              <div className="mt-2 text-sm text-amber-700">
                <p>Tente novamente ou entre em contato com o suporte técnico se o problema persistir.</p>
              </div>
            )
          }
      }
    }

    const errorContent = getErrorContent()

    return (
      <div className="bg-amber-50 border border-red-300 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              {errorContent.title}
            </h3>
            <div className="mt-1 text-sm text-amber-700">
              <p>{errorContent.message}</p>
              {errorContent.suggestions}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-amber-100">
            <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Área Administrativa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            QueroDocumento - Acesso Restrito
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                placeholder="admin@querodocumento.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {renderErrorMessage()}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar na Administração'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-amber-600 hover:text-red-500 block"
            >
              Esqueceu sua senha administrativa?
            </Link>
            <a 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-800 block"
            >
              ← Voltar ao site principal
            </a>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Esta é uma área restrita para administradores do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Carregando...</p>
        </div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  )
}