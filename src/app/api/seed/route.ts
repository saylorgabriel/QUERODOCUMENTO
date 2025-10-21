import { NextResponse } from 'next/server'
import { seedEmoluments } from '@/../../prisma/seeds/emoluments'

// Proteger com uma chave secreta
const SEED_SECRET = process.env.SEED_SECRET || 'your-secret-key-here'

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const { secret } = await request.json()

    if (secret !== SEED_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Executar seed de emolumentos
    await seedEmoluments()

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!'
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
