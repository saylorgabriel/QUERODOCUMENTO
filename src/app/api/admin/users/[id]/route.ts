import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('simple-session')

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(sessionCookie.value)
    if (sessionData.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        cnpj: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar usuário',
        details: (error as any).message
      },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('simple-session')

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(sessionCookie.value)
    if (sessionData.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, phone, cpf, cnpj, role } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone: phone || null,
        cpf: cpf || null,
        cnpj: cnpj || null,
        role,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        cnpj: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao atualizar usuário',
        details: (error as any).message
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('simple-session')

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(sessionCookie.value)
    if (sessionData.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Prevent admin from deleting themselves
    if (sessionData.user.id === id) {
      return NextResponse.json(
        { success: false, error: 'Você não pode excluir sua própria conta' },
        { status: 400 }
      )
    }

    // Check if user exists and get related data count
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Delete user and all related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First, delete all orders of the user
      await tx.order.deleteMany({
        where: { userId: id }
      })

      // Then delete the user
      await tx.user.delete({
        where: { id }
      })

      return {
        deletedOrders: user._count.orders
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso',
      deletedOrders: result.deletedOrders
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao excluir usuário',
        details: (error as any).message
      },
      { status: 500 }
    )
  }
}
