/**
 * Test Server for Integration Testing
 * Manages test server lifecycle for API integration tests
 */

import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

class TestServer {
  private isRunning = false
  private prisma: PrismaClient | null = null

  async start() {
    if (this.isRunning) return

    try {
      // Start test containers
      console.log('Starting test infrastructure...')
      execSync('docker-compose -f docker-compose.test.yml up -d', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })

      // Wait for databases to be ready
      await this.waitForServices()

      // Initialize Prisma and run migrations
      await this.setupDatabase()

      this.isRunning = true
      console.log('Test infrastructure ready')
    } catch (error) {
      console.error('Failed to start test server:', error)
      throw error
    }
  }

  async stop() {
    if (!this.isRunning) return

    try {
      // Disconnect Prisma
      if (this.prisma) {
        await this.prisma.$disconnect()
        this.prisma = null
      }

      // Stop test containers
      console.log('Stopping test infrastructure...')
      execSync('docker-compose -f docker-compose.test.yml down -v', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })

      this.isRunning = false
      console.log('Test infrastructure stopped')
    } catch (error) {
      console.error('Failed to stop test server:', error)
    }
  }

  private async waitForServices() {
    const maxRetries = 30
    const retryDelay = 1000

    for (let i = 0; i < maxRetries; i++) {
      try {
        // Test PostgreSQL connection
        const testPrisma = new PrismaClient({
          datasources: {
            db: {
              url: 'postgresql://querodoc_test:test123@localhost:5434/querodocumento_test'
            }
          }
        })

        await testPrisma.$queryRaw`SELECT 1`
        await testPrisma.$disconnect()
        
        console.log('Database is ready')
        return
      } catch (error) {
        console.log(`Waiting for database... (attempt ${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }

    throw new Error('Test services failed to start within timeout')
  }

  private async setupDatabase() {
    try {
      // Run database migrations
      console.log('Running database migrations...')
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: 'postgresql://querodoc_test:test123@localhost:5434/querodocumento_test'
        }
      })

      // Generate Prisma client
      console.log('Generating Prisma client...')
      execSync('npx prisma generate', {
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: 'postgresql://querodoc_test:test123@localhost:5434/querodocumento_test'
        }
      })

      // Create Prisma instance
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: 'postgresql://querodoc_test:test123@localhost:5434/querodocumento_test'
          }
        }
      })

      console.log('Database setup complete')
    } catch (error) {
      console.error('Database setup failed:', error)
      throw error
    }
  }

  getPrisma() {
    return this.prisma
  }

  isReady() {
    return this.isRunning
  }
}

export const testServer = new TestServer()