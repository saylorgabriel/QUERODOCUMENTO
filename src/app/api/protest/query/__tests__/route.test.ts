/**
 * Unit tests for Protest Query API Route
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST, GET } from '../route'
import { mockPrisma, mockUser, mockOrder, mockProtestQuery } from '@/__tests__/fixtures/mockData'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('/api/protest/query', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful mocks
    mockPrisma.order.findUnique.mockResolvedValue(null)
    mockPrisma.lead.upsert.mockResolvedValue({})
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('POST', () => {
    it('should successfully process basic consultation', async () => {
      const requestBody = {
        documentNumber: '11144477735',
        name: 'João Silva',
        phone: '11999999999',
        consultationType: 'BASIC'
      }

      const request = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.queryId).toBeDefined()
      expect(data.data.documentSearched).toBe('11144477735')
      expect(data.data.name).toBe('João Silva')
      expect(data.data.consultationType).toBe('BASIC')
      expect(mockPrisma.lead.upsert).toHaveBeenCalled()
    })

    it('should successfully process paid consultation with order', async () => {
      const validOrder = {
        ...mockOrder,
        paymentStatus: 'COMPLETED',
        documentNumber: '11144477735'
      }
      
      mockPrisma.order.findUnique.mockResolvedValue(validOrder)

      const requestBody = {
        documentNumber: '11144477735',
        name: 'João Silva',
        consultationType: 'DETAILED',
        orderId: 'order-123'
      }

      const request = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.orderId).toBe('order-123')
      expect(data.data.orderNumber).toBe(validOrder.orderNumber)
      expect(data.data.consultationType).toBe('DETAILED')
      expect(mockPrisma.lead.upsert).not.toHaveBeenCalled() // No lead for paid consultation
    })

    it('should return different results based on document ending digits', async () => {
      // Test document ending in 0 (should have protests)
      const requestWithProtests = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477730', // ends in 0
          name: 'João Silva',
          consultationType: 'BASIC'
        }),
      })

      const responseWithProtests = await POST(requestWithProtests)
      const dataWithProtests = await responseWithProtests.json()

      expect(dataWithProtests.data.totalProtests).toBeGreaterThan(0)
      expect(dataWithProtests.data.certificateType).toBe('POSITIVE')

      // Test document ending in 1 (should have no protests)
      const requestNoProtests = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477731', // ends in 1
          name: 'João Silva',
          consultationType: 'BASIC'
        }),
      })

      const responseNoProtests = await POST(requestNoProtests)
      const dataNoProtests = await responseNoProtests.json()

      expect(dataNoProtests.data.totalProtests).toBe(0)
      expect(dataNoProtests.data.certificateType).toBe('NEGATIVE')
    })

    it('should validate required fields', async () => {
      const requestMissingName = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477735',
          // name missing
        }),
      })

      const response = await POST(requestMissingName)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Documento e nome são obrigatórios')
    })

    it('should validate document format', async () => {
      const requestInvalidDoc = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '123456', // Invalid format
          name: 'João Silva',
        }),
      })

      const response = await POST(requestInvalidDoc)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('CPF ou CNPJ inválido')
    })

    it('should validate order existence and payment status', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477735',
          name: 'João Silva',
          consultationType: 'DETAILED',
          orderId: 'invalid-order'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Pedido não encontrado ou pagamento não confirmado')
    })

    it('should validate order payment status', async () => {
      const unpaidOrder = {
        ...mockOrder,
        paymentStatus: 'PENDING',
        documentNumber: '11144477735'
      }
      
      mockPrisma.order.findUnique.mockResolvedValue(unpaidOrder)

      const request = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477735',
          name: 'João Silva',
          consultationType: 'DETAILED',
          orderId: 'order-123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Pedido não encontrado ou pagamento não confirmado')
    })

    it('should validate document matches order', async () => {
      const orderWithDifferentDoc = {
        ...mockOrder,
        paymentStatus: 'COMPLETED',
        documentNumber: '99999999999' // Different document
      }
      
      mockPrisma.order.findUnique.mockResolvedValue(orderWithDifferentDoc)

      const request = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477735',
          name: 'João Silva',
          consultationType: 'DETAILED',
          orderId: 'order-123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Documento não confere com o pedido')
    })

    it('should auto-detect document type', async () => {
      // Test CPF detection
      const cpfRequest = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477735',
          name: 'João Silva',
        }),
      })

      const cpfResponse = await POST(cpfRequest)
      const cpfData = await cpfResponse.json()

      expect(cpfData.data.documentType).toBe('CPF')

      // Test CNPJ detection
      const cnpjRequest = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11222333000181',
          name: 'Empresa LTDA',
        }),
      })

      const cnpjResponse = await POST(cnpjRequest)
      const cnpjData = await cnpjResponse.json()

      expect(cnpjData.data.documentType).toBe('CNPJ')
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.lead.upsert.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477735',
          name: 'João Silva',
        }),
      })

      // Should not fail even if lead saving fails
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Lead saving failure should be logged but not break the consultation
    })

    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Erro interno do servidor. Tente novamente.')
    })

    it('should generate correct protest data for different scenarios', async () => {
      // Test with document ending in 3 (should have 2 protests)
      const request = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477733',
          name: 'João Silva',
          consultationType: 'DETAILED'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.totalProtests).toBe(2)
      expect(data.data.protests).toHaveLength(2)
      expect(data.data.protests[0]).toMatchObject({
        id: expect.any(String),
        date: expect.any(String),
        value: expect.any(Number),
        creditor: expect.any(String),
        notaryOffice: expect.any(String),
        city: expect.any(String),
        state: expect.any(String),
        protocol: expect.any(String),
        status: 'ACTIVE'
      })
    })

    it('should hide sensitive information in basic consultations', async () => {
      const request = new NextRequest('http://localhost:3000/api/protest/query', {
        method: 'POST',
        body: JSON.stringify({
          documentNumber: '11144477730', // Has protests
          name: 'João Silva',
          consultationType: 'BASIC'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      if (data.data.totalProtests > 0) {
        expect(data.data.protests[0].value).toBe(0) // Hidden in basic
        expect(data.data.protests[0].protocol).toBe('***HIDDEN***')
        expect(data.data.protests[0].creditor).toContain('[Detalhes na certidão paga]')
      }
    })
  })

  describe('GET', () => {
    it('should return query status when query exists', async () => {
      mockPrisma.protestQuery.findUnique.mockResolvedValue(mockProtestQuery)

      const request = new NextRequest('http://localhost:3000/api/protest/query?queryId=query-123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.queryId).toBe('query-123')
      expect(data.data.status).toBe('COMPLETED')
      expect(mockPrisma.protestQuery.findUnique).toHaveBeenCalledWith({
        where: { id: 'query-123' },
        select: {
          id: true,
          document: true,
          documentType: true,
          status: true,
          result: true,
          createdAt: true,
          updatedAt: true
        }
      })
    })

    it('should require queryId parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/protest/query')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('ID da consulta é obrigatório')
    })

    it('should return 404 when query not found', async () => {
      mockPrisma.protestQuery.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/protest/query?queryId=nonexistent')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Consulta não encontrada')
    })

    it('should handle database errors', async () => {
      mockPrisma.protestQuery.findUnique.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/protest/query?queryId=query-123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Erro interno do servidor')
    })
  })
})