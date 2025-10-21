import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedEmoluments } from './seeds/emoluments'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Certificate Emoluments
  await seedEmoluments()

  // Check if demo user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@querodocumento.com' }
  })

  if (!existingUser) {
    // Create demo user
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    const demoUser = await prisma.user.create({
      data: {
        name: 'Usuário Demo',
        email: 'demo@querodocumento.com',
        password: hashedPassword,
        phone: '(11) 99999-9999',
        cpf: '12345678901',
        role: 'USER',
      }
    })

    console.log('✅ Created demo user:', demoUser.email)
  } else {
    console.log('✅ Demo user already exists:', existingUser.email)
  }

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@querodocumento.com' }
  })

  if (!existingAdmin) {
    // Create admin user
    const hashedPasswordAdmin = await bcrypt.hash('admin123456', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@querodocumento.com',
        password: hashedPasswordAdmin,
        phone: '(11) 98888-8888',
        role: 'ADMIN',
      }
    })

    console.log('✅ Created admin user:', adminUser.email)
  } else {
    console.log('✅ Admin user already exists:', existingAdmin.email)
  }

  console.log('🌟 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })