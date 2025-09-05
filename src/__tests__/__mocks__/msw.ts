/**
 * Mock Service Worker (MSW) setup for API mocking
 */

import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  mockProtestQueryResponse,
  mockLoginResponse,
  mockLoginError,
  mockDashboardStats,
  mockApiError,
} from '../fixtures/mockData'

// Define request handlers
export const handlers = [
  // Protest query endpoint
  http.post('/api/protest/query', async ({ request }) => {
    const body = await request.json() as any
    const { documentNumber, name } = body

    // Simulate different scenarios based on input
    if (!documentNumber || !name) {
      return HttpResponse.json(mockApiError, { status: 400 })
    }

    // Simulate invalid document
    if (documentNumber === '12345678900') {
      return HttpResponse.json({
        success: false,
        error: 'CPF ou CNPJ inválido'
      }, { status: 400 })
    }

    // Simulate server error
    if (documentNumber === '99999999999') {
      return HttpResponse.json({
        success: false,
        error: 'Erro interno do servidor. Tente novamente.'
      }, { status: 500 })
    }

    // Return successful response
    return HttpResponse.json(mockProtestQueryResponse)
  }),

  // Auth login endpoint
  http.post('/api/auth/simple-login', async ({ request }) => {
    const body = await request.json() as any
    const { email, password } = body

    // Simulate validation errors
    if (!email || !password) {
      return HttpResponse.json({
        error: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }

    // Simulate invalid credentials
    if (email === 'wrong@example.com' || password === 'wrongpassword') {
      return HttpResponse.json(mockLoginError, { status: 401 })
    }

    // Simulate server error
    if (email === 'error@example.com') {
      return HttpResponse.json({
        error: 'Erro interno do servidor'
      }, { status: 500 })
    }

    // Return successful login
    return HttpResponse.json(mockLoginResponse)
  }),

  // Dashboard stats endpoint
  http.get('/api/dashboard/stats', ({ request }) => {
    const cookie = request.headers.get('cookie')
    
    // Simulate unauthorized access
    if (!cookie?.includes('simple-session')) {
      return HttpResponse.json({
        error: 'Não autorizado'
      }, { status: 401 })
    }

    // Simulate expired session
    if (cookie?.includes('expired-session')) {
      return HttpResponse.json({
        error: 'Sessão expirada'
      }, { status: 401 })
    }

    // Return successful stats
    return HttpResponse.json(mockDashboardStats)
  }),

  // User registration endpoint
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as any
    const { email, password, name, cpf } = body

    // Simulate validation errors
    if (!email || !password || !name || !cpf) {
      return HttpResponse.json({
        error: 'Todos os campos são obrigatórios'
      }, { status: 400 })
    }

    // Simulate user already exists
    if (email === 'existing@example.com') {
      return HttpResponse.json({
        error: 'Usuário já existe'
      }, { status: 409 })
    }

    // Return successful registration
    return HttpResponse.json({
      success: true,
      message: 'Usuário criado com sucesso'
    })
  }),

  // Orders endpoint
  http.get('/api/user/orders', ({ request }) => {
    const cookie = request.headers.get('cookie')
    
    if (!cookie?.includes('simple-session')) {
      return HttpResponse.json({
        error: 'Não autorizado'
      }, { status: 401 })
    }

    return HttpResponse.json({
      success: true,
      orders: []
    })
  }),

  // Generic error handler for unmatched requests
  http.all('*', ({ request }) => {
    console.warn(`Unmatched request: ${request.method} ${request.url}`)
    return HttpResponse.json({
      error: 'Endpoint não encontrado'
    }, { status: 404 })
  }),
]

// Create server instance
export const server = setupServer(...handlers)

// Helper functions for test setup
export const startMockServer = () => {
  server.listen({ onUnhandledRequest: 'warn' })
}

export const stopMockServer = () => {
  server.close()
}

export const resetHandlers = () => {
  server.resetHandlers()
}

export const addHandler = (...newHandlers: any[]) => {
  server.use(...newHandlers)
}