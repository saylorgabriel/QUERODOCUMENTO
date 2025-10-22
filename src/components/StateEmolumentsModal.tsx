'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, Loader2 } from 'lucide-react'

interface Emolument {
  state: string
  finalValue: number
  value5Years: number
}

interface StateEmolumentsModalProps {
  isOpen: boolean
  onClose: () => void
}

// Map state codes to full names
const STATE_NAMES: Record<string, string> = {
  'AC': 'Acre',
  'AL': 'Alagoas',
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins'
}

export function StateEmolumentsModal({ isOpen, onClose }: StateEmolumentsModalProps) {
  const [emoluments, setEmoluments] = useState<Emolument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchEmoluments()
    }
  }, [isOpen])

  const fetchEmoluments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/emoluments')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar valores')
      }

      setEmoluments(data.emoluments)
    } catch (err) {
      console.error('Error fetching emoluments:', err)
      setError('Não foi possível carregar os valores. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Valores por Estado</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                <p className="text-neutral-600">Carregando valores...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={fetchEmoluments}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-6">
                  <p className="text-sm text-neutral-600 mb-4">
                    Valores finais para emissão de certidão de protesto (5 anos), incluindo todas as taxas e impostos.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Observação:</strong> Valores válidos para certidão negativa ou positiva com até 1 protesto.
                      Valores podem variar de acordo com o cartório e quantidade de protestos.
                    </p>
                  </div>
                </div>

                {/* Grid of states */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emoluments.map((emolument) => (
                    <div
                      key={emolument.state}
                      className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-medium text-purple-600 mb-1">
                            {emolument.state}
                          </p>
                          <p className="text-sm font-semibold text-neutral-900">
                            {STATE_NAMES[emolument.state] || emolument.state}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-purple-100">
                        <p className="text-2xl font-bold text-purple-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(emolument.finalValue)}
                        </p>
                        {/* <p className="text-xs text-neutral-500 mt-1">
                          Valor base: {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(emolument.value5Years)}
                        </p> */}
                      </div>
                    </div>
                  ))}
                </div>

                {emoluments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-neutral-600">Nenhum valor cadastrado no momento.</p>
                  </div>
                )}

                {/* Footer note */}
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500 text-center">
                    * Valores atualizados de acordo com as tabelas oficiais dos cartórios de cada estado.
                    <br />
                    Última atualização: {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
