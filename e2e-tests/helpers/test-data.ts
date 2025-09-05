/**
 * Test Data Helpers for E2E Tests
 * Utilities for creating and managing test data during E2E testing
 */

import { Page } from '@playwright/test'

// Test user credentials
export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'test123',
    name: 'Admin User',
    cpf: '000.111.222-33',
    phone: '(11) 90000-0000'
  },
  user: {
    email: 'test@querodocumento.com',
    password: 'test123',
    name: 'Test User',
    cpf: '111.444.777-35',
    phone: '(11) 99999-9999'
  },
  newUser: () => ({
    email: `testuser.${Date.now()}@test.com`,
    password: 'test123',
    name: 'New Test User',
    cpf: generateValidCPF(),
    phone: '(11) 98888-8888'
  })
}

// Test documents (valid but fictitious)
export const TEST_DOCUMENTS = {
  cpf: {
    valid: ['111.444.777-35', '222.555.888-44', '333.666.999-77'],
    invalid: ['123.456.789-00', '111.111.111-11', '000.000.000-00'],
    withProtests: ['333.666.999-77'], // Mock data will return protests for this
    withoutProtests: ['111.444.777-35', '222.555.888-44']
  },
  cnpj: {
    valid: ['11.222.333/0001-81', '22.333.444/0001-72'],
    invalid: ['11.111.111/1111-11', '00.000.000/0000-00'],
    withProtests: ['22.333.444/0001-72'],
    withoutProtests: ['11.222.333/0001-81']
  }
}

// Test order data
export const TEST_ORDER_DATA = {
  certificateRequest: {
    certificateType: 'NEGATIVE',
    state: 'SP',
    city: 'São Paulo',
    notaryOffice: 'Cartório Central',
    reason: 'Processo licitatório - Teste E2E'
  }
}

/**
 * Authentication helpers
 */
export class AuthHelper {
  constructor(private page: Page) {}

  async loginAs(userType: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userType]
    
    await this.page.goto('/login')
    await this.page.fill('input[name="email"]', user.email)
    await this.page.fill('input[name="password"]', user.password)
    await this.page.click('button[type="submit"]')
    
    // Wait for login to complete
    await this.page.waitForURL('**/dashboard', { timeout: 10000 })
  }

  async logout() {
    await this.page.click('button[aria-label="Menu do usuário"]')
    await this.page.click('button[text="Sair"]')
    await this.page.waitForURL('/')
  }

  async registerNewUser(userData?: Partial<typeof TEST_USERS.newUser>) {
    const user = { ...TEST_USERS.newUser(), ...userData }
    
    await this.page.goto('/register')
    await this.page.fill('input[name="name"]', user.name)
    await this.page.fill('input[name="email"]', user.email)
    await this.page.fill('input[name="cpf"]', user.cpf)
    await this.page.fill('input[name="phone"]', user.phone)
    await this.page.fill('input[name="password"]', user.password)
    await this.page.fill('input[name="confirmPassword"]', user.password)
    await this.page.click('button[type="submit"]')
    
    return user
  }
}

/**
 * Consultation helpers
 */
export class ConsultationHelper {
  constructor(private page: Page) {}

  async performConsultation(document: string, documentType: 'CPF' | 'CNPJ' = 'CPF') {
    await this.page.goto('/consulta')
    await this.page.fill('input[name="document"]', document)
    await this.page.selectOption('select[name="documentType"]', documentType)
    await this.page.click('button[text="Consultar"]')
    
    // Wait for results
    await this.page.waitForSelector('[data-testid="consultation-result"]', { timeout: 15000 })
  }

  async requestCertificate(certificateData = TEST_ORDER_DATA.certificateRequest) {
    await this.page.click('button[text="Solicitar Certidão"]')
    
    await this.page.selectOption('select[name="certificateType"]', certificateData.certificateType)
    await this.page.selectOption('select[name="state"]', certificateData.state)
    await this.page.selectOption('select[name="city"]', certificateData.city)
    await this.page.fill('textarea[name="reason"]', certificateData.reason)
    
    await this.page.click('button[text="Solicitar"]')
    
    // Wait for order confirmation
    await this.page.waitForSelector('[data-testid="order-confirmation"]', { timeout: 10000 })
  }
}

/**
 * Dashboard helpers
 */
export class DashboardHelper {
  constructor(private page: Page) {}

  async navigateToSection(section: 'consultations' | 'orders' | 'profile') {
    await this.page.goto('/dashboard')
    
    switch (section) {
      case 'consultations':
        await this.page.click('button[text="Consultas"]')
        break
      case 'orders':
        await this.page.click('button[text="Pedidos"]')
        break
      case 'profile':
        await this.page.click('button[text="Perfil"]')
        break
    }
    
    await this.page.waitForTimeout(1000) // Wait for content to load
  }

  async downloadPDF(index: number = 0) {
    const downloadPromise = this.page.waitForDownload()
    await this.page.locator('a[data-testid="download-pdf"]').nth(index).click()
    return await downloadPromise
  }
}

/**
 * Payment helpers
 */
export class PaymentHelper {
  constructor(private page: Page) {}

  async selectPaymentMethod(method: 'PIX' | 'CREDIT_CARD' | 'BOLETO') {
    await this.page.click(`button[text="${method}"]`)
    await this.page.waitForTimeout(2000) // Wait for payment details to load
  }

  async copyPixCode() {
    await this.page.click('button[text="Copiar Código PIX"]')
    // Wait for success message
    await this.page.waitForSelector('text=Código copiado', { timeout: 5000 })
  }

  async fillCreditCardForm(cardData = {
    number: '4111 1111 1111 1111',
    name: 'Test User',
    expiry: '12/25',
    cvv: '123'
  }) {
    await this.page.fill('input[name="cardNumber"]', cardData.number)
    await this.page.fill('input[name="cardName"]', cardData.name)
    await this.page.fill('input[name="cardExpiry"]', cardData.expiry)
    await this.page.fill('input[name="cardCvv"]', cardData.cvv)
    
    await this.page.click('button[text="Pagar"]')
  }
}

/**
 * Form helpers
 */
export class FormHelper {
  constructor(private page: Page) {}

  async fillConsultationForm(document: string, documentType: 'CPF' | 'CNPJ' = 'CPF') {
    await this.page.fill('input[name="document"]', document)
    await this.page.selectOption('select[name="documentType"]', documentType)
  }

  async fillRegistrationForm(userData: any) {
    await this.page.fill('input[name="name"]', userData.name)
    await this.page.fill('input[name="email"]', userData.email)
    await this.page.fill('input[name="cpf"]', userData.cpf)
    await this.page.fill('input[name="phone"]', userData.phone)
    await this.page.fill('input[name="password"]', userData.password)
    await this.page.fill('input[name="confirmPassword"]', userData.password)
  }

  async submitForm() {
    await this.page.click('button[type="submit"]')
  }
}

/**
 * Utilities
 */
export function generateValidCPF(): string {
  // Generate a valid CPF number for testing
  const cpfBase = Math.floor(Math.random() * 999999999).toString().padStart(9, '0')
  
  // Calculate first digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpfBase[i]) * (10 - i)
  }
  let firstDigit = 11 - (sum % 11)
  if (firstDigit >= 10) firstDigit = 0
  
  // Calculate second digit
  sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpfBase[i]) * (11 - i)
  }
  sum += firstDigit * 2
  let secondDigit = 11 - (sum % 11)
  if (secondDigit >= 10) secondDigit = 0
  
  const cpf = cpfBase + firstDigit + secondDigit
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function generateValidCNPJ(): string {
  // Generate a valid CNPJ number for testing
  const cnpjBase = Math.floor(Math.random() * 99999999).toString().padStart(8, '0') + '0001'
  
  // Calculate first digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpjBase[i]) * weights1[i]
  }
  let firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  // Calculate second digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpjBase[i]) * weights2[i]
  }
  sum += firstDigit * weights2[12]
  let secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  const cnpj = cnpjBase + firstDigit + secondDigit
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function waitForNetworkIdle(page: Page, timeout = 2000): Promise<void> {
  return new Promise((resolve) => {
    let timeoutId: NodeJS.Timeout
    
    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(resolve, timeout)
    }
    
    page.on('request', resetTimeout)
    page.on('response', resetTimeout)
    
    resetTimeout()
  })
}

export async function mockAPIResponse(page: Page, endpoint: string, response: any) {
  await page.route(`**${endpoint}`, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}

// Export helper classes with page binding
export function createTestHelpers(page: Page) {
  return {
    auth: new AuthHelper(page),
    consultation: new ConsultationHelper(page),
    dashboard: new DashboardHelper(page),
    payment: new PaymentHelper(page),
    form: new FormHelper(page)
  }
}