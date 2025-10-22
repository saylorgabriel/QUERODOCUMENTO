export interface AsaasCustomer {
  id: string
  name: string
  email: string
  cpfCnpj: string
  phone?: string
  mobilePhone?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  postalCode?: string
  externalReference?: string
}

export interface AsaasPayment {
  id: string
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  value: number
  netValue: number
  originalValue: number
  interestValue?: number
  description?: string
  dueDate: string
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH' | 'REFUND_REQUESTED' | 'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE' | 'AWAITING_CHARGEBACK_REVERSAL' | 'DUNNING_REQUESTED' | 'DUNNING_RECEIVED' | 'AWAITING_RISK_ANALYSIS'
  pixTransaction?: {
    id: string
    qrCodeText: string
    qrCodeUrl: string
  }
  invoiceUrl?: string
  bankSlipUrl?: string
  transactionReceiptUrl?: string
  invoiceNumber?: string
  externalReference?: string
}

export interface CreateCustomerData {
  name: string
  email: string
  cpfCnpj: string
  phone?: string
  mobilePhone?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  postalCode?: string
  externalReference?: string
  notificationDisabled?: boolean
}

export interface CreatePaymentData {
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  value: number
  dueDate: string
  description?: string
  externalReference?: string
  installmentCount?: number
  installmentValue?: number
  discount?: {
    value: number
    dueDateLimitDays: number
  }
  fine?: {
    value: number
  }
  interest?: {
    value: number
  }
  postalService?: boolean
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    email: string
    cpfCnpj: string
    postalCode: string
    addressNumber: string
    addressComplement?: string
    phone: string
    mobilePhone?: string
  }
}

class AsaasService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.ASAAS_API_KEY || ''
    const environment = process.env.ASAAS_ENVIRONMENT || 'sandbox'
    this.baseUrl = environment === 'production'
      ? 'https://api.asaas.com/v3'
      : 'https://sandbox.asaas.com/api/v3'

    console.log('🔑 ASAAS Config:', {
      hasApiKey: !!this.apiKey,
      environment,
      baseUrl: this.baseUrl
    })

    if (!this.apiKey) {
      console.warn('ASAAS_API_KEY not configured')
    }
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    console.log('🔍 DEBUG - API Key check:', {
      hasApiKey: !!this.apiKey,
      timestamp: new Date().toISOString()
    })

    if (!this.apiKey) {
      throw new Error('ASAAS API key not configured')
    }

    // Removed mock - testing with real ASAAS API

    const url = `${this.baseUrl}${endpoint}`

    const options: RequestInit = {
      method,
      headers: {
        'access_token': this.apiKey,
        'Content-Type': 'application/json'
      }
    }

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data)
    }

    try {
      console.log(`ASAAS API Request: ${method} ${url}`)

      const response = await fetch(url, options)
      const responseData = await response.json()

      if (!response.ok) {
        console.error('ASAAS API Error:', responseData)
        throw new Error(responseData.errors?.[0]?.description || 'ASAAS API error')
      }

      return responseData
    } catch (error) {
      console.error('ASAAS API Request failed:', error)
      throw error
    }
  }

  async createCustomer(data: CreateCustomerData): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>('/customers', 'POST', data)
  }

  async getCustomer(id: string): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>(`/customers/${id}`, 'GET')
  }

  async findCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomer | null> {
    const response = await this.request<{ data: AsaasCustomer[] }>(
      `/customers?cpfCnpj=${cpfCnpj}`,
      'GET'
    )
    return response.data?.[0] || null
  }

  async createPayment(data: CreatePaymentData): Promise<AsaasPayment> {
    return this.request<AsaasPayment>('/payments', 'POST', data)
  }

  async getPayment(id: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${id}`, 'GET')
  }

  async getPixQrCode(paymentId: string): Promise<{
    encodedImage: string
    payload: string
    expirationDate: string
  }> {
    return this.request(`/payments/${paymentId}/pixQrCode`, 'GET')
  }

  async refundPayment(paymentId: string, value?: number, description?: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(
      `/payments/${paymentId}/refund`,
      'POST',
      { value, description }
    )
  }

  async cancelPayment(paymentId: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(
      `/payments/${paymentId}`,
      'DELETE'
    )
  }

  /**
   * Simula o recebimento de um pagamento PIX no ambiente sandbox
   * @param paymentId ID do pagamento no ASAAS
   */
  async simulatePixPayment(paymentId: string): Promise<AsaasPayment> {
    if (process.env.ASAAS_ENVIRONMENT === 'production') {
      throw new Error('Payment simulation is only available in sandbox environment')
    }

    return this.request<AsaasPayment>(
      `/payments/${paymentId}/receiveInCash`,
      'POST',
      {
        paymentDate: new Date().toISOString().split('T')[0],
        value: undefined // Usa o valor original do pagamento
      }
    )
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  sanitizeCpfCnpj(document: string): string {
    return document.replace(/[^\d]/g, '')
  }

  sanitizePhone(phone: string): string {
    return phone.replace(/[^\d]/g, '')
  }
}

// Lazy instantiation to ensure env vars are loaded
let _asaasServiceInstance: AsaasService | null = null

export function getAsaasService(): AsaasService {
  if (!_asaasServiceInstance) {
    _asaasServiceInstance = new AsaasService()
  }
  return _asaasServiceInstance
}

// For backward compatibility
export const asaasService = new Proxy({} as AsaasService, {
  get(_target, prop) {
    return getAsaasService()[prop as keyof AsaasService]
  }
})