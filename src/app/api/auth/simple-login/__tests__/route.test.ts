/**
 * Unit tests for Simple Login API Route
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { mockPrisma, mockUser } from '@/__tests__/fixtures/mockData'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

// Mock Next.js cookies
const mockCookieSet = jest.fn()
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    set: mockCookieSet,
    get: jest.fn(),
    delete: jest.fn(),
  })),
}))

describe('/api/auth/simple-login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mocks
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)
    mockBcrypt.compare.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('POST', () => {
    it('should successfully login with valid credentials', async () => {
      const requestBody = {
        email: 'test@querodocumento.com',
        password: 'validpassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
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
      expect(data.message).toBe('Login realizado com sucesso')
      expect(data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phone: mockUser.phone,
        cpf: mockUser.cpf,
        cnpj: mockUser.cnpj,
      })

      // Verify database queries
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@querodocumento.com' }
      })
      expect(mockBcrypt.compare).toHaveBeenCalledWith('validpassword123', mockUser.password)

      // Verify cookie setting
      expect(mockCookieSet).toHaveBeenCalledWith(
        'simple-session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: false, // In test environment
          sameSite: 'lax',
          maxAge: 24 * 60 * 60,
        })
      )

      // Verify session data structure in cookie
      const cookieValue = JSON.parse(mockCookieSet.mock.calls[0][1])
      expect(cookieValue).toMatchObject({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        }),
        expires: expect.any(String),
      })
    })

    it('should validate required fields', async () => {
      const requestMissingEmail = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123'
          // email missing
        }),
      })

      const response1 = await POST(requestMissingEmail)
      const data1 = await response1.json()

      expect(response1.status).toBe(400)
      expect(data1.error).toBe('Email e senha são obrigatórios')

      const requestMissingPassword = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com'
          // password missing
        }),
      })

      const response2 = await POST(requestMissingPassword)
      const data2 = await response2.json()

      expect(response2.status).toBe(400)
      expect(data2.error).toBe('Email e senha são obrigatórios')

      // Should not attempt database queries for invalid input
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
    })

    it('should reject non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Email ou senha incorretos')
      expect(mockBcrypt.compare).not.toHaveBeenCalled()
      expect(mockCookieSet).not.toHaveBeenCalled()
    })

    it('should reject user without password', async () => {
      const userWithoutPassword = { ...mockUser, password: null }
      mockPrisma.user.findUnique.mockResolvedValue(userWithoutPassword)

      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Email ou senha incorretos')
      expect(mockBcrypt.compare).not.toHaveBeenCalled()
    })

    it('should reject invalid password', async () => {
      mockBcrypt.compare.mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@querodocumento.com',
          password: 'wrongpassword'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Email ou senha incorretos')
      expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password)
      expect(mockCookieSet).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro interno do servidor')
    })

    it('should handle bcrypt errors', async () => {
      mockBcrypt.compare.mockRejectedValue(new Error('Bcrypt error'))

      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@querodocumento.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro interno do servidor')
    })

    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro interno do servidor')
    })

    it('should set secure cookie in production environment', async () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      try {
        const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@querodocumento.com',
            password: 'validpassword123'
          }),
        })

        await POST(request)

        expect(mockCookieSet).toHaveBeenCalledWith(
          'simple-session',
          expect.any(String),
          expect.objectContaining({
            secure: true, // Should be true in production
          })
        )
      } finally {
        process.env.NODE_ENV = originalNodeEnv
      }
    })

    it('should create session with correct expiration time', async () => {
      const beforeLogin = Date.now()

      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@querodocumento.com',
          password: 'validpassword123'
        }),
      })

      await POST(request)

      const afterLogin = Date.now()

      const cookieValue = JSON.parse(mockCookieSet.mock.calls[0][1])
      const expiresTime = new Date(cookieValue.expires).getTime()
      const expectedExpiration = beforeLogin + (24 * 60 * 60 * 1000)
      const expectedExpirationMax = afterLogin + (24 * 60 * 60 * 1000)

      expect(expiresTime).toBeGreaterThanOrEqual(expectedExpiration)
      expect(expiresTime).toBeLessThanOrEqual(expectedExpirationMax)
    })

    it('should handle different user types (CPF vs CNPJ)', async () => {
      // Test with company user (CNPJ)
      const companyUser = {
        ...mockUser,
        cpf: null,
        cnpj: '11222333000181',
        name: 'Empresa LTDA'
      }
      
      mockPrisma.user.findUnique.mockResolvedValue(companyUser)

      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'empresa@example.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.cnpj).toBe('11222333000181')
      expect(data.user.cpf).toBe(null)
    })

    it('should log login attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@querodocumento.com',
          password: 'validpassword123'
        }),
      })

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('Login attempt:', { email: 'test@querodocumento.com' })
      expect(consoleSpy).toHaveBeenCalledWith('Login successful for:', 'test@querodocumento.com')

      consoleSpy.mockRestore()
    })
  })
})