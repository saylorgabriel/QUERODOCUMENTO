'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [resetToken, setResetToken] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        if (data.resetToken) {
          setResetToken(data.resetToken)
        }
      } else {
        setError(data.error || 'Erro ao solicitar redefinição de senha')
      }
    } catch (error) {
      setError('Erro ao solicitar redefinição de senha')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-floating bg-white">
          <div className="mb-6">
            <Link 
              href="/auth/login"
              className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao login
            </Link>
            
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Esqueci minha senha
            </h1>
            <p className="text-neutral-600">
              Digite seu email para receber instruções de redefinição
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-primary w-full min-h-12 sm:min-h-14"
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-amber-50 text-amber-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            {resetToken && (
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg text-sm">
                <p className="font-medium mb-2">Token para redefinir senha (apenas para desenvolvimento):</p>
                <code className="bg-blue-100 px-2 py-1 rounded text-xs break-all">{resetToken}</code>
                <p className="mt-2 text-xs">
                  <Link 
                    href={`/auth/reset-password?email=${email}&token=${resetToken}`}
                    className="text-blue-700 underline"
                  >
                    Clique aqui para redefinir sua senha
                  </Link>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center min-h-12 sm:min-h-14 py-3 sm:py-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar instruções'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Lembrou da senha?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}