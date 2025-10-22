import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/emoluments
 *
 * Retorna os valores de emolumentos para solicitação de certidão de protesto
 *
 * Query params:
 * - state: Sigla do estado (opcional) - se fornecido, retorna apenas para aquele estado
 *
 * Exemplos:
 * - GET /api/emoluments - Retorna todos os estados
 * - GET /api/emoluments?state=SP - Retorna apenas São Paulo
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')

    if (state) {
      // Buscar emolumento de um estado específico
      const emolument = await prisma.certificateEmolument.findUnique({
        where: {
          state: state.toUpperCase(),
          active: true
        }
      })

      if (!emolument) {
        return NextResponse.json(
          { error: 'Estado não encontrado ou inativo' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        emolument: {
          state: emolument.state,
          value5Years: Number(emolument.value5Years),
          boletoFee: Number(emolument.boletoFee),
          lucroFee: Number(emolument.lucroFee),
          taxPercentage: Number(emolument.taxPercentage),
          taxValue: Number(emolument.taxValue),
          finalValue: Number(emolument.finalValue)
        }
      })
    }

    // Buscar todos os emolumentos ativos
    const emoluments = await prisma.certificateEmolument.findMany({
      where: { active: true },
      orderBy: { state: 'asc' }
    })

    return NextResponse.json({
      success: true,
      count: emoluments.length,
      emoluments: emoluments.map(e => ({
        state: e.state,
        value5Years: Number(e.value5Years),
        boletoFee: Number(e.boletoFee),
        lucroFee: Number(e.lucroFee),
        taxPercentage: Number(e.taxPercentage),
        taxValue: Number(e.taxValue),
        finalValue: Number(e.finalValue)
      }))
    })
  } catch (error) {
    console.error('Error fetching emoluments:', error)

    return NextResponse.json(
      {
        error: 'Erro ao buscar emolumentos',
        details: (error as any).message
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/emoluments
 *
 * Atualiza múltiplos emolumentos de uma vez
 *
 * Body:
 * {
 *   "emoluments": [
 *     { "state": "SP", "value5Years": 123.45 },
 *     { "state": "RJ", "value5Years": 98.76 }
 *   ]
 * }
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { emoluments } = body

    if (!Array.isArray(emoluments)) {
      return NextResponse.json(
        { error: 'Emoluments deve ser um array' },
        { status: 400 }
      )
    }

    const updates = []

    for (const emolument of emoluments) {
      const { state, value5Years } = emolument

      if (!state || value5Years === undefined) {
        continue
      }

      // Calcular valores derivados
      const boletoFee = 0.87
      const lucroFee = 30.00
      const serviceValue = 5.09
      const taxPercentage = 6.00

      const subtotal = Number(value5Years) + boletoFee + lucroFee + serviceValue
      const taxValue = Number((subtotal * (taxPercentage / 100)).toFixed(2))
      const finalValue = Number((subtotal + taxValue).toFixed(2))

      // Atualizar registro
      const updated = await prisma.certificateEmolument.upsert({
        where: { state: state.toUpperCase() },
        update: {
          value5Years: Number(value5Years),
          boletoFee,
          lucroFee,
          serviceValue,
          taxPercentage,
          taxValue,
          finalValue,
          updatedAt: new Date()
        },
        create: {
          state: state.toUpperCase(),
          value5Years: Number(value5Years),
          boletoFee,
          lucroFee,
          serviceValue,
          taxPercentage,
          taxValue,
          finalValue
        }
      })

      updates.push(updated)
    }

    return NextResponse.json({
      success: true,
      message: `${updates.length} emolumentos atualizados com sucesso`,
      count: updates.length
    })
  } catch (error) {
    console.error('Error updating emoluments:', error)

    return NextResponse.json(
      {
        error: 'Erro ao atualizar emolumentos',
        details: (error as any).message
      },
      { status: 500 }
    )
  }
}
