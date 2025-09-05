'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Erro de configuração no servidor'
      case 'AccessDenied':
        return 'Acesso negado'
      case 'Verification':
        return 'Token inválido ou expirado'
      case 'Default':
      default:
        return 'Ocorreu um erro durante a autenticação'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-floating bg-white text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 13.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Erro de Autenticação
            </h1>
            <p className="text-neutral-600 mb-6">
              {getErrorMessage(error)}
            </p>
            {error && (
              <div className="bg-amber-50 text-amber-600 p-3 rounded-lg text-sm mb-6">
                Código do erro: {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="btn-primary w-full"
            >
              Tentar Novamente
            </Link>
            <Link
              href="/"
              className="btn-outline w-full"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}