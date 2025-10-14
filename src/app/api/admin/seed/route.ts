import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Security: Require a secret token from environment variables
    const authHeader = request.headers.get('authorization')
    const secret = authHeader?.replace('Bearer ', '')

    const SEED_SECRET = process.env.SEED_SECRET || process.env.ADMIN_SEED_SECRET

    if (!secret || secret !== SEED_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing SEED_SECRET' },
        { status: 401 }
      )
    }

    const results = {
      demo: null as any,
      admin: null as any,
      message: '',
    }

    // Check if demo user already exists
    const existingDemoUser = await prisma.user.findUnique({
      where: { email: 'demo@querodocumento.com' },
    })

    if (!existingDemoUser) {
      const hashedPassword = await bcrypt.hash('123456', 12)

      results.demo = await prisma.user.create({
        data: {
          name: 'Usuário Demo',
          email: 'demo@querodocumento.com',
          password: hashedPassword,
          phone: '(11) 99999-9999',
          cpf: '12345678901',
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })
    } else {
      results.demo = {
        id: existingDemoUser.id,
        email: existingDemoUser.email,
        name: existingDemoUser.name,
        role: existingDemoUser.role,
        status: 'already_exists',
      }
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@querodocumento.com' },
    })

    if (!existingAdmin) {
      const hashedPasswordAdmin = await bcrypt.hash('admin123456', 12)

      results.admin = await prisma.user.create({
        data: {
          name: 'Administrador',
          email: 'admin@querodocumento.com',
          password: hashedPasswordAdmin,
          phone: '(11) 98888-8888',
          role: 'ADMIN',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })
    } else {
      results.admin = {
        id: existingAdmin.id,
        email: existingAdmin.email,
        name: existingAdmin.name,
        role: existingAdmin.role,
        status: 'already_exists',
      }
    }

    results.message = 'Database seeded successfully!'

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    })
  } catch (error) {
    console.error('Seed failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
