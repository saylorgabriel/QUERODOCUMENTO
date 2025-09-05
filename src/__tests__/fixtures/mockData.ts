/**
 * Mock data fixtures for testing
 */

// User fixtures
export const mockUser = {
  id: 'test-user-123',
  email: 'test@querodocumento.com',
  name: 'João Silva',
  cpf: '11144477735',
  cnpj: null,
  phone: '11999999999',
  password: '$2a$12$hashed.password.here',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
}

export const mockCompanyUser = {
  ...mockUser,
  id: 'test-company-123',
  name: 'Empresa LTDA',
  cpf: null,
  cnpj: '11222333000181',
}

// Protest query fixtures
export const mockProtestQuery = {
  id: 'query-123',
  userId: mockUser.id,
  document: '11144477735',
  documentType: 'CPF' as const,
  name: 'João Silva',
  phone: '11999999999',
  status: 'COMPLETED' as const,
  result: {
    queryId: 'QRY-1234567890',
    documentSearched: '11144477735',
    documentType: 'CPF',
    name: 'João Silva',
    searchDate: '2024-01-15T10:00:00Z',
    status: 'COMPLETED',
    totalProtests: 2,
    protests: [
      {
        id: 'PROT-001',
        date: '2024-01-10T00:00:00Z',
        value: 1250.50,
        creditor: 'Banco Exemplo S.A.',
        notaryOffice: '1º Cartório de Protestos',
        city: 'São Paulo',
        state: 'SP',
        protocol: 'PR2024001234',
        status: 'ACTIVE',
      },
      {
        id: 'PROT-002',
        date: '2023-12-15T00:00:00Z',
        value: 890.00,
        creditor: 'Financeira XYZ Ltda.',
        notaryOffice: '2º Cartório de Protestos',
        city: 'Rio de Janeiro',
        state: 'RJ',
        protocol: 'PR2023005678',
        status: 'ACTIVE',
      },
    ],
    summary: 'Encontrado(s) 2 protesto(s) para o documento consultado.',
    canRequestCertificate: true,
    certificateType: 'POSITIVE',
    isPaidConsultation: true,
    consultationType: 'DETAILED',
  },
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
}

export const mockCleanProtestQuery = {
  ...mockProtestQuery,
  id: 'clean-query-123',
  result: {
    ...mockProtestQuery.result,
    totalProtests: 0,
    protests: [],
    summary: 'Nenhum protesto encontrado para o documento consultado.',
    certificateType: 'NEGATIVE',
  },
}

// Order fixtures
export const mockOrder = {
  id: 'order-123',
  orderNumber: 'ORD-2024-001',
  userId: mockUser.id,
  documentNumber: '11144477735',
  serviceType: 'PROTEST_CERTIFICATE' as const,
  status: 'PENDING_PAYMENT' as const,
  paymentStatus: 'PENDING' as const,
  amount: 25.00,
  description: 'Certidão de Protesto - CPF 111.444.777-35',
  customerData: {
    name: 'João Silva',
    email: 'test@querodocumento.com',
    cpf: '11144477735',
    phone: '11999999999',
  },
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
}

export const mockCompletedOrder = {
  ...mockOrder,
  id: 'completed-order-123',
  status: 'COMPLETED' as const,
  paymentStatus: 'COMPLETED' as const,
  completedAt: new Date('2024-01-15T12:00:00Z'),
}

// Certificate fixtures
export const mockCertificate = {
  id: 'cert-123',
  userId: mockUser.id,
  orderId: mockOrder.id,
  type: 'POSITIVE' as const,
  status: 'READY' as const,
  documentNumber: '11144477735',
  documentType: 'CPF' as const,
  protestsFound: 2,
  fileUrl: '/certificates/cert-123.pdf',
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T11:00:00Z'),
}

// Lead fixtures
export const mockLead = {
  id: 'lead-123',
  documentNumber: '11144477735',
  name: 'João Silva',
  phone: '11999999999',
  email: null,
  consultations: 3,
  stage: 'CONSULTATION' as const,
  status: 'NEW' as const,
  lastActivity: new Date('2024-01-15T10:00:00Z'),
  createdAt: new Date('2024-01-10T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
}

// Dashboard stats fixtures
export const mockDashboardStats = {
  consultasRealizadas: 5,
  certidoesSolicitadas: 2,
  protestosEncontrados: 3,
  documentosProntos: 1,
  pedidosTotal: 3,
  pedidosCompletos: 1,
}

// API response fixtures
export const mockApiSuccess = {
  success: true,
  data: mockProtestQuery.result,
}

export const mockApiError = {
  success: false,
  error: 'Documento inválido',
}

// Form data fixtures
export const mockConsultaFormData = {
  documentNumber: '11144477735',
  name: 'João Silva',
  phone: '11999999999',
}

export const mockInvalidConsultaFormData = {
  documentNumber: '12345678900', // Invalid CPF
  name: '',
  phone: '123',
}

// MSW response fixtures
export const mockProtestQueryResponse = {
  success: true,
  data: {
    queryId: 'mock-1234567890',
    orderId: null,
    orderNumber: null,
    ...mockProtestQuery.result,
  },
}

export const mockLoginResponse = {
  success: true,
  user: mockUser,
  message: 'Login realizado com sucesso',
}

export const mockLoginError = {
  error: 'Email ou senha incorretos',
}

// Test utilities for creating variations
export const createMockUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  ...mockOrder,
  ...overrides,
})

export const createMockProtestQuery = (overrides = {}) => ({
  ...mockProtestQuery,
  ...overrides,
})

// Database mock helpers
export const mockPrismaUser = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
}

export const mockPrismaOrder = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
}

export const mockPrismaProtestQuery = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
}

export const mockPrismaCertificate = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
}

export const mockPrismaLead = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  upsert: jest.fn(),
}

export const mockPrisma = {
  user: mockPrismaUser,
  order: mockPrismaOrder,
  protestQuery: mockPrismaProtestQuery,
  certificate: mockPrismaCertificate,
  lead: mockPrismaLead,
}