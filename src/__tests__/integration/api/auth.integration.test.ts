/**
 * Authentication API Integration Tests
 * Tests user registration, login, session management with real database
 */

import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { 
  setupTestDatabase, 
  cleanDatabase, 
  createTestUser
} from '../setup'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { POST as loginHandler } from '@/app/api/auth/simple-login/route'
import { GET as sessionHandler } from '@/app/api/auth/simple-session/route'
import { POST as _logoutHandler } from '@/app/api/auth/simple-logout/route'
import { POST as forgotPasswordHandler } from '@/app/api/auth/forgot-password/route'
import { POST as resetPasswordHandler } from '@/app/api/auth/reset-password/route'

describe('Authentication API Integration', () => {
  let prisma: any

  beforeAll(async () => {
    prisma = await setupTestDatabase()
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const requestBody = {
        name: 'João Silva',
        email: 'joao@test.com',
        cpf: '11144477735',
        phone: '(11) 99999-9999',
        password: 'senha123'
      }

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const response = await registerHandler(request)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.success).toBe(true)
      expect(result.user.email).toBe('joao@test.com')
      expect(result.user.cpf).toBe('11144477735')

      // Verify user was created in database
      const dbUser = await prisma.user.findUnique({
        where: { email: 'joao@test.com' }
      })

      expect(dbUser).toBeTruthy()
      expect(dbUser.name).toBe('João Silva')
      expect(await bcrypt.compare('senha123', dbUser.password)).toBe(true)
    })

    it('should reject registration with duplicate email', async () => {
      await createTestUser({ email: 'existing@test.com' })

      const requestBody = {
        name: 'Another User',
        email: 'existing@test.com',
        cpf: '22255588844',
        phone: '(11) 88888-8888',
        password: 'senha123'
      }

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await registerHandler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toContain('email')
    })

    it('should reject registration with duplicate CPF', async () => {
      await createTestUser({ cpf: '11144477735' })

      const requestBody = {
        name: 'Another User',
        email: 'another@test.com',
        cpf: '11144477735',
        phone: '(11) 88888-8888',
        password: 'senha123'
      }

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await registerHandler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toContain('CPF')
    })

    it('should reject invalid CPF format', async () => {
      const requestBody = {
        name: 'João Silva',
        email: 'joao@test.com',
        cpf: '12345678900', // Invalid CPF
        phone: '(11) 99999-9999',
        password: 'senha123'
      }

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await registerHandler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toContain('CPF')
    })
  })

  describe('POST /api/auth/simple-login', () => {
    it('should login with valid credentials', async () => {
      const user = await createTestUser({
        email: 'test@login.com',
        password: await bcrypt.hash('senha123', 12)
      })

      const requestBody = {
        email: 'test@login.com',
        password: 'senha123'
      }

      const request = new NextRequest('http://localhost/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await loginHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.user.email).toBe('test@login.com')
      expect(result.sessionToken).toBeTruthy()

      // Verify session was created in database
      const session = await prisma.session.findFirst({
        where: { userId: user.id }
      })

      expect(session).toBeTruthy()
    })

    it('should reject invalid credentials', async () => {
      await createTestUser({
        email: 'test@login.com',
        password: await bcrypt.hash('senha123', 12)
      })

      const requestBody = {
        email: 'test@login.com',
        password: 'wrongpassword'
      }

      const request = new NextRequest('http://localhost/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await loginHandler(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid')
    })

    it('should reject non-existent user', async () => {
      const requestBody = {
        email: 'nonexistent@test.com',
        password: 'senha123'
      }

      const request = new NextRequest('http://localhost/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await loginHandler(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.success).toBe(false)
    })
  })

  describe('GET /api/auth/simple-session', () => {
    it('should return session for valid session token', async () => {
      const user = await createTestUser()
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: 'valid-session-token',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      })

      const request = new NextRequest('http://localhost/api/auth/simple-session', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=valid-session-token`
        }
      })

      const response = await sessionHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.user.id).toBe(user.id)
      expect(result.user.email).toBe(user.email)
    })

    it('should reject expired session token', async () => {
      const user = await createTestUser()
      await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: 'expired-session-token',
          expires: new Date(Date.now() - 1000) // Expired
        }
      })

      const request = new NextRequest('http://localhost/api/auth/simple-session', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=expired-session-token`
        }
      })

      const response = await sessionHandler(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.error).toContain('expired')
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('should create reset token for existing user', async () => {
      await createTestUser({ email: 'reset@test.com' })

      const requestBody = {
        email: 'reset@test.com'
      }

      const request = new NextRequest('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await forgotPasswordHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.message).toContain('email')

      // Verify reset token was created
      const resetToken = await prisma.resetToken.findFirst({
        where: { email: 'reset@test.com' }
      })

      expect(resetToken).toBeTruthy()
      expect(resetToken.used).toBe(false)
    })

    it('should handle non-existent email gracefully', async () => {
      const requestBody = {
        email: 'nonexistent@test.com'
      }

      const request = new NextRequest('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await forgotPasswordHandler(request)
      const result = await response.json()

      // Should return success for security (don't reveal if email exists)
      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const user = await createTestUser({ email: 'reset@test.com' })
      const resetToken = await prisma.resetToken.create({
        data: {
          email: 'reset@test.com',
          token: 'valid-reset-token',
          expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      })

      const requestBody = {
        token: 'valid-reset-token',
        password: 'newpassword123'
      }

      const request = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await resetPasswordHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)

      // Verify password was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id }
      })

      expect(await bcrypt.compare('newpassword123', updatedUser.password)).toBe(true)

      // Verify token was marked as used
      const usedToken = await prisma.resetToken.findUnique({
        where: { token: 'valid-reset-token' }
      })

      expect(usedToken.used).toBe(true)
    })

    it('should reject expired reset token', async () => {
      await prisma.resetToken.create({
        data: {
          email: 'reset@test.com',
          token: 'expired-reset-token',
          expires: new Date(Date.now() - 1000) // Expired
        }
      })

      const requestBody = {
        token: 'expired-reset-token',
        password: 'newpassword123'
      }

      const request = new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await resetPasswordHandler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toContain('expired')
    })
  })

  describe('Audit Logging', () => {
    it('should create audit logs for authentication events', async () => {
      const user = await createTestUser({
        email: 'audit@test.com',
        password: await bcrypt.hash('senha123', 12)
      })

      // Login to generate audit log
      const requestBody = {
        email: 'audit@test.com',
        password: 'senha123'
      }

      const request = new NextRequest('http://localhost/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'x-forwarded-for': '127.0.0.1',
          'user-agent': 'Test Browser'
        }
      })

      await loginHandler(request)

      // Check audit log was created
      const auditLogs = await prisma.auditLog.findMany({
        where: { 
          userId: user.id,
          action: 'LOGIN'
        }
      })

      expect(auditLogs.length).toBeGreaterThan(0)
      expect(auditLogs[0].resource).toBe('USER')
      expect(auditLogs[0].ipAddress).toBe('127.0.0.1')
      expect(auditLogs[0].userAgent).toBe('Test Browser')
    })
  })
})