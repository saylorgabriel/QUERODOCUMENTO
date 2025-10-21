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
