#!/usr/bin/env bun

/**
 * Test Data Seeding Script
 * Creates consistent test data for development and testing
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface TestDataConfig {
  users: number
  queries: number
  orders: number
  leads: number
}

const DEFAULT_CONFIG: TestDataConfig = {
  users: 10,
  queries: 50,
  orders: 20,
  leads: 30
}

// Test CPF/CNPJ numbers (valid but fictitious)
const TEST_CPFS = [
  '11144477735',
  '22255588844',
  '33366699977',
  '44477711188',
  '55588822299',
  '66699933300',
  '77711144455',
  '88822255566',
  '99933366677',
  '10101010101'
]

const TEST_CNPJS = [
  '11222333000181',
  '22333444000172',
  '33444555000163',
  '44555666000154',
  '55666777000145'
]

async function seedTestData(config: TestDataConfig = DEFAULT_CONFIG) {
  console.log('🌱 Starting test data seeding...')

  try {
    // Clean existing test data
    await cleanTestData()

    // Create users
    const users = await createTestUsers(config.users)
    console.log(`✅ Created ${users.length} test users`)

    // Create protest queries
    const queries = await createTestQueries(users, config.queries)
    console.log(`✅ Created ${queries.length} test queries`)

    // Create orders
    const orders = await createTestOrders(users, config.orders)
    console.log(`✅ Created ${orders.length} test orders`)

    // Create leads
    const leads = await createTestLeads(config.leads)
    console.log(`✅ Created ${leads.length} test leads`)

    // Create sample documents
    await createSampleDocuments(orders.slice(0, 5))
    console.log(`✅ Created sample documents`)

    // Create email logs
    await createEmailLogs(users.slice(0, 5))
    console.log(`✅ Created email logs`)

    console.log('🎉 Test data seeding completed successfully!')
  } catch (error) {
    console.error('❌ Test data seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function cleanTestData() {
  console.log('🧹 Cleaning existing test data...')
  
  // Delete in correct order to respect foreign key constraints
  await prisma.downloadLog.deleteMany({
    where: { user: { email: { contains: '@test.com' } } }
  })
  
  await prisma.orderDocument.deleteMany({
    where: { order: { user: { email: { contains: '@test.com' } } } }
  })
  
  await prisma.orderHistory.deleteMany({
    where: { order: { user: { email: { contains: '@test.com' } } } }
  })
  
  await prisma.emailLog.deleteMany({
    where: { user: { email: { contains: '@test.com' } } }
  })
  
  await prisma.lead.deleteMany({
    where: { email: { contains: '@test.com' } }
  })
  
  await prisma.order.deleteMany({
    where: { user: { email: { contains: '@test.com' } } }
  })
  
  await prisma.certificate.deleteMany({
    where: { user: { email: { contains: '@test.com' } } }
  })
  
  await prisma.protestQuery.deleteMany({
    where: { user: { email: { contains: '@test.com' } } }
  })
  
  await prisma.payment.deleteMany({
    where: { user: { email: { contains: '@test.com' } } }
  })
  
  await prisma.session.deleteMany({
    where: { user: { email: { contains: '@test.com' } } }
  })
  
  await prisma.auditLog.deleteMany({
    where: { user: { email: { contains: '@test.com' } } }
  })
  
  await prisma.user.deleteMany({
    where: { email: { contains: '@test.com' } }
  })
  
  console.log('✅ Test data cleaned')
}

async function createTestUsers(count: number) {
  const users = []
  const hashedPassword = await bcrypt.hash('test123', 12)
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPassword,
      cpf: '00011122233',
      phone: '(11) 90000-0000',
      role: 'ADMIN'
    }
  })
  users.push(adminUser)

  // Create regular users
  for (let i = 1; i < count; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        name: `Test User ${i}`,
        password: hashedPassword,
        cpf: TEST_CPFS[i % TEST_CPFS.length],
        phone: `(11) 9999${String(i).padStart(4, '0')}`,
        role: i < 3 ? 'ADMIN' : 'USER'
      }
    })
    users.push(user)
  }

  return users
}

async function createTestQueries(users: any[], count: number) {
  const queries = []
  const statuses = ['COMPLETED', 'PENDING', 'FAILED', 'PROCESSING']
  
  for (let i = 0; i < count; i++) {
    const user = users[i % users.length]
    const document = i % 2 === 0 
      ? TEST_CPFS[i % TEST_CPFS.length] 
      : TEST_CNPJS[i % TEST_CNPJS.length]
    
    const status = statuses[i % statuses.length]
    const hasFindings = i % 3 === 0 // 33% chance of findings
    
    const query = await prisma.protestQuery.create({
      data: {
        userId: user.id,
        document,
        documentType: i % 2 === 0 ? 'CPF' : 'CNPJ',
        status: status as any,
        result: status === 'COMPLETED' ? {
          found: hasFindings,
          message: hasFindings ? 'Protestos encontrados' : 'Nenhum protesto encontrado',
          protests: hasFindings ? [
            {
              protocol: `PROT${String(i).padStart(6, '0')}`,
              amount: Math.random() * 10000 + 100,
              date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              creditor: `Credor ${i}`,
              cartorio: `Cartório ${Math.floor(Math.random() * 10) + 1}`
            }
          ] : [],
          searchedAt: new Date().toISOString()
        } : null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within 30 days
      }
    })
    queries.push(query)
  }

  return queries
}

async function createTestOrders(users: any[], count: number) {
  const orders = []
  const statuses = ['AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED']
  const serviceTypes = ['PROTEST_QUERY', 'CERTIFICATE_REQUEST']
  const paymentMethods = ['PIX', 'CREDIT_CARD', 'BOLETO']
  
  for (let i = 0; i < count; i++) {
    const user = users[i % users.length]
    const serviceType = serviceTypes[i % serviceTypes.length]
    const status = statuses[i % statuses.length]
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: `ORD-${String(Date.now() + i).slice(-8)}`,
        serviceType: serviceType as any,
        status: status as any,
        documentNumber: TEST_CPFS[i % TEST_CPFS.length],
        documentType: 'CPF',
        invoiceName: user.name,
        invoiceDocument: user.cpf,
        amount: serviceType === 'PROTEST_QUERY' ? 9.90 : 29.90,
        paymentMethod: paymentMethods[i % paymentMethods.length] as any,
        paymentStatus: status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        paidAt: status === 'COMPLETED' ? new Date() : null,
        state: serviceType === 'CERTIFICATE_REQUEST' ? 'SP' : null,
        city: serviceType === 'CERTIFICATE_REQUEST' ? 'São Paulo' : null,
        notaryOffice: serviceType === 'CERTIFICATE_REQUEST' ? `Cartório ${i % 5 + 1}` : null,
        reason: serviceType === 'CERTIFICATE_REQUEST' ? 'Processo licitatório' : null,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random date within 60 days
      }
    })
    
    // Create order history
    await prisma.orderHistory.create({
      data: {
        orderId: order.id,
        newStatus: status as any,
        changedById: users[0].id, // Admin user
        notes: `Status alterado para ${status}`,
      }
    })
    
    orders.push(order)
  }

  return orders
}

async function createTestLeads(count: number) {
  const leads = []
  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']
  const stages = ['FORM_FILLED', 'CONSULTATION', 'QUOTE_REQUESTED', 'PAYMENT_STARTED', 'CUSTOMER']
  const sources = ['landing_page', 'google_ads', 'facebook_ads', 'organic_search', 'referral']
  
  for (let i = 0; i < count; i++) {
    const document = TEST_CPFS[(i + 5) % TEST_CPFS.length] // Different from users
    const converted = i % 4 === 0 // 25% conversion rate
    
    const lead = await prisma.lead.create({
      data: {
        documentNumber: document,
        name: `Lead ${i + 1}`,
        email: `lead${i + 1}@test.com`,
        phone: `(11) 8888${String(i).padStart(4, '0')}`,
        source: sources[i % sources.length],
        status: converted ? 'CONVERTED' : statuses[i % (statuses.length - 1)] as any,
        stage: converted ? 'CUSTOMER' : stages[i % (stages.length - 1)] as any,
        score: Math.floor(Math.random() * 100),
        consultations: Math.floor(Math.random() * 5) + 1,
        converted,
        convertedAt: converted ? new Date() : null,
        totalSpent: converted ? Math.random() * 200 + 50 : 0,
        emailsSent: Math.floor(Math.random() * 10),
        emailOpens: Math.floor(Math.random() * 5),
        emailClicks: Math.floor(Math.random() * 3),
        utm_source: sources[i % sources.length],
        utm_medium: 'cpc',
        utm_campaign: 'test_campaign',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within 90 days
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
      }
    })
    leads.push(lead)
  }

  return leads
}

async function createSampleDocuments(orders: any[]) {
  for (const order of orders) {
    if (order.status === 'COMPLETED') {
      await prisma.orderDocument.create({
        data: {
          orderId: order.id,
          filename: `resultado_${order.orderNumber}.pdf`,
          storedFilename: `${order.id}_resultado.pdf`,
          filePath: `/uploads/results/${order.id}_resultado.pdf`,
          fileSize: Math.floor(Math.random() * 500000) + 50000, // 50KB - 500KB
          mimeType: 'application/pdf',
          documentType: 'RESULT',
          uploadedById: order.userId,
          checksum: `sha256_${Math.random().toString(36).substring(2)}`,
          downloadToken: Math.random().toString(36).substring(2),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        }
      })
    }
  }
}

async function createEmailLogs(users: any[]) {
  const templates = [
    'welcome_email',
    'consultation_result',
    'order_confirmation',
    'payment_confirmation',
    'certificate_ready'
  ]
  
  const statuses = ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED']
  
  for (const user of users) {
    for (let i = 0; i < 5; i++) {
      const status = statuses[i % statuses.length]
      
      await prisma.emailLog.create({
        data: {
          to: user.email,
          from: 'noreply@querodocumento.com.br',
          subject: `Test Email ${i + 1}`,
          provider: 'MAILHOG',
          status: status as any,
          messageId: `test-${user.id}-${i}`,
          templateName: templates[i % templates.length],
          userId: user.id,
          sentAt: status !== 'FAILED' ? new Date() : null,
          deliveredAt: ['DELIVERED', 'OPENED', 'CLICKED'].includes(status) ? new Date() : null,
          openedAt: ['OPENED', 'CLICKED'].includes(status) ? new Date() : null,
          clickedAt: status === 'CLICKED' ? new Date() : null,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      })
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2)
  const config: Partial<TestDataConfig> = {}
  
  // Parse CLI arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '')
    const value = parseInt(args[i + 1])
    
    if (key && !isNaN(value)) {
      config[key as keyof TestDataConfig] = value
    }
  }
  
  seedTestData({ ...DEFAULT_CONFIG, ...config })
}

export { seedTestData, cleanTestData }