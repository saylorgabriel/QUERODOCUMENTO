'use client'

import { User as UserIcon, Mail, Phone, CreditCard } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  cpf?: string
  cnpj?: string
  phone?: string
  createdAt: string
}

interface OrderDetails {
  id: string
  documentNumber: string
  documentType: 'CPF' | 'CNPJ'
  invoiceName: string
  invoiceDocument: string
  user: User
}

interface ClientInfoProps {
  order: OrderDetails
}

export default function ClientInfo({ order }: ClientInfoProps) {
  const formatDocument = (document: string, type: 'CPF' | 'CNPJ') => {
    if (type === 'CPF') {
      // Format CPF: 000.000.000-00
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      // Format CNPJ: 00.000.000/0000-00
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const maskDocument = (document: string, type: 'CPF' | 'CNPJ') => {
    if (type === 'CPF') {
      // Mask CPF: ***.***.***-**
      const formatted = formatDocument(document, type)
      return formatted.replace(/\d(?=\d{2})/g, '*')
    } else {
      // Mask CNPJ: **.***.***/****-**
      const formatted = formatDocument(document, type)
      return formatted.replace(/\d(?=\d{2})/g, '*')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatPhone = (phone: string) => {
    if (!phone) return ''
    // Format phone: (00) 00000-0000 or (00) 0000-0000
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
  }

  const getUserDocument = () => {
    // Check if user has CPF or CNPJ
    if (order.user.cpf) {
      return { number: order.user.cpf, type: 'CPF' as const }
    } else if (order.user.cnpj) {
      return { number: order.user.cnpj, type: 'CNPJ' as const }
    }
    return null
  }

  const userDoc = getUserDocument()
  const isInvoiceDataDifferent = 
    order.invoiceName !== order.user.name ||
    order.invoiceDocument !== (userDoc?.number || '')

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
          Informações do Cliente
        </h3>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Data */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Dados do Cliente</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="text-sm text-gray-900 font-medium">{order.user.name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 font-mono break-all">{order.user.email}</p>
                </div>
              </div>

              {order.user.phone && (
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="text-sm text-gray-900">{formatPhone(order.user.phone)}</p>
                  </div>
                </div>
              )}

              {userDoc && (
                <div className="flex items-start">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">{userDoc.type}</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {formatDocument(userDoc.number, userDoc.type)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <div className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Cliente desde</p>
                  <p className="text-sm text-gray-900">{formatDate(order.user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Query Data */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Documento Consultado</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Documento da Consulta</p>
                  <p className="text-sm text-gray-900 font-mono">
                    {formatDocument(order.documentNumber, order.documentType)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Mascarado: {maskDocument(order.documentNumber, order.documentType)}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="text-sm text-gray-900">{order.documentType}</p>
                </div>
              </div>
            </div>

            {/* Invoice Data (if different) */}
            {isInvoiceDataDifferent && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados para Nota Fiscal</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Dados para NF são diferentes do cliente
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 space-y-2">
                        <p><strong>Nome:</strong> {order.invoiceName}</p>
                        <p><strong>Documento:</strong> <span className="font-mono">{order.invoiceDocument}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LGPD Compliance Note */}
        {/* <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Conformidade LGPD
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Os dados pessoais são tratados de acordo com a Lei Geral de Proteção de Dados (LGPD). 
                  Acesso restrito apenas a funcionários autorizados para processamento do pedido.
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}