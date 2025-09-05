import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  console.log('🔧 Creating admin user...')

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@querodocumento.com' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      console.log('🔑 Password: admin123456')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador Sistema',
        email: 'admin@querodocumento.com',
        password: hashedPassword,
        phone: '(11) 98888-8888',
        role: 'ADMIN',
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@querodocumento.com')
    console.log('🔑 Password: admin123456')
    console.log('')
    console.log('🌐 Access admin panel at: http://localhost:3009/admin')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()