import { prisma } from './src/lib/prisma'
import bcrypt from 'bcryptjs'

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('teste123', 12)
    
    const user = await prisma.user.create({
      data: {
        name: 'Teste Silva',
        email: 'teste2@example.com',
        password: hashedPassword,
        cpf: '12345678900',
        role: 'USER'
      }
    })
    
    console.log('User created successfully:', JSON.stringify(user, null, 2))
    process.exit(0)
  } catch (error) {
    console.error('Error creating user:', error)
    process.exit(1)
  }
}

createTestUser()