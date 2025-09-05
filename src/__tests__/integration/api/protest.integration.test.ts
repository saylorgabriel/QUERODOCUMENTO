/**
 * Protest Query API Integration Tests
 * Tests protest consultation functionality with real database integration
 */

import { NextRequest } from 'next/server'
import { 
  setupTestDatabase, 
  cleanDatabase, 
  createTestUser,
  createTestSession,
  getTestPrisma
} from '../setup'
import { POST as protestQueryHandler, GET as protestQueryGET } from '@/app/api/protest/query/route'

// No external API to mock - the route generates mock data internally

describe('Protest Query API Integration', () => {
  let prisma: any
  let testUser: any
  let testSession: any

  beforeAll(async () => {
    prisma = await setupTestDatabase()
  })

  beforeEach(async () => {
    await cleanDatabase()
    testUser = await createTestUser()
    testSession = await createTestSession(testUser.id)
  })

  describe('POST /api/protest/query', () => {
    it('should create protest query with valid CPF', async () => {
      const requestBody = {
        documentNumber: '11144477735',
        name: 'João da Silva',
        phone: '11987654321',
        consultationType: 'BASIC'
      }

      const request = new NextRequest('http://localhost/api/protest/query', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await protestQueryHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.queryId).toBeTruthy()
      expect(result.data.documentSearched).toBe('11144477735')
      expect(result.data.documentType).toBe('CPF')
      expect(result.data.status).toBe('COMPLETED')

      // Verify lead was created/updated
      const lead = await prisma.lead.findUnique({
        where: { documentNumber: '11144477735' }
      })

      expect(lead).toBeTruthy()
      expect(lead.consultations).toBe(1)
      expect(lead.stage).toBe('CONSULTATION')
      expect(lead.name).toBe('João da Silva')
    })

    it('should handle protest query with findings', async () => {
      // Use a document that ends in 0 to trigger protests in the mock logic
      const requestBody = {
        documentNumber: '22255588840', // Ends in 0, should have protests
        name: 'Maria Silva',
        phone: '11987654321',
        consultationType: 'BASIC'
      }

      const request = new NextRequest('http://localhost/api/protest/query', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await protestQueryHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.totalProtests).toBeGreaterThan(0)
      expect(result.data.protests).toBeDefined()
      expect(result.data.certificateType).toBe('POSITIVE')

      // Verify lead was created
      const lead = await prisma.lead.findUnique({
        where: { documentNumber: '22255588840' }
      })

      expect(lead).toBeTruthy()
      expect(lead.name).toBe('Maria Silva')
    })

    it('should validate CNPJ format', async () => {
      const requestBody = {
        documentNumber: '12.345.678/0001-95', // Valid CNPJ format
        name: 'Empresa Teste Ltda',
        consultationType: 'BASIC'
      }

      const request = new NextRequest('http://localhost/api/protest/query', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await protestQueryHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.documentType).toBe('CNPJ')
    })

    it('should reject invalid document format', async () => {
      const requestBody = {
        documentNumber: '123456789', // Too short, invalid
        name: 'João Silva'
      }

      const request = new NextRequest('http://localhost/api/protest/query', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await protestQueryHandler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toContain('CPF ou CNPJ inválido')
    })

    it('should reject missing required fields', async () => {
      const requestBody = {
        documentNumber: '11144477735'
        // Missing name
      }

      const request = new NextRequest('http://localhost/api/protest/query', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await protestQueryHandler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Documento e nome são obrigatórios')
    })

  })

  describe('GET /api/protest/query', () => {
    it('should return 400 for missing queryId', async () => {
      const request = new NextRequest('http://localhost/api/protest/query')

      const response = await protestQueryGET(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toContain('ID da consulta é obrigatório')
    })

    it('should return 404 for non-existent query', async () => {
      const request = new NextRequest('http://localhost/api/protest/query?queryId=non-existent')

      const response = await protestQueryGET(request)
      const result = await response.json()

      expect(response.status).toBe(404)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Consulta não encontrada')
    })
  })
})