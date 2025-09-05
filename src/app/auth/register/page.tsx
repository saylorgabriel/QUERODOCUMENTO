'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { InputDocument } from '@/components/ui/input-document'
import { InputPhone } from '@/components/ui/input-phone'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    document: '',
    phone: '',
  })

  const [documentValid, setDocumentValid] = useState(false)
  const [phoneValid, setPhoneValid] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (!documentValid) {
      setError('Por favor, insira um CPF ou CNPJ válido')
      return
    }

    if (!phoneValid) {
      setError('Por favor, insira um telefone válido')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          document: formData.document,
          phone: formData.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      // If auto-login is enabled, redirect to dashboard
      if (data.autoLogin) {
        window.location.href = '/dashboard'
      } else {
        router.push('/auth/login?registered=true')
      }
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro ao criar sua conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card-floating bg-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Crie sua conta
            </h1>
            <p className="text-neutral-600">
              Cadastre-se para consultar protestos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-primary w-full min-h-12 sm:min-h-14"
                placeholder="João Silva"
                disabled={isLoading}
              />
            </div>

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

            <InputDocument
              label="CPF ou CNPJ"
              value={formData.document}
              onChange={(value, isValid) => {
                setFormData(prev => ({ ...prev, document: value }))
                setDocumentValid(isValid)
              }}
              placeholder="000.000.000-00"
              disabled={isLoading}
            />

            <InputPhone
              label="Telefone"
              value={formData.phone}
              onChange={(value, isValid) => {
                setFormData(prev => ({ ...prev, phone: value }))
                setPhoneValid(isValid)
              }}
              placeholder="(11) 99999-9999"
              disabled={isLoading}
            />

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="input-primary w-full min-h-12 sm:min-h-14"
                placeholder="Mínimo 8 caracteres"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="input-primary w-full min-h-12 sm:min-h-14"
                placeholder="Digite a senha novamente"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-amber-50 text-amber-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="text-xs text-neutral-500">
              Ao criar sua conta, você concorda com nossos{' '}
              <Link href="/termos-de-uso" className="text-primary-600 hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/politica-de-privacidade" className="text-primary-600 hover:underline">
                Política de Privacidade
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center min-h-12 sm:min-h-14 py-3 sm:py-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Já tem uma conta?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}