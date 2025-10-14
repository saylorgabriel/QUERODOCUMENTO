import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('simple-session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const sessionData = JSON.parse(sessionCookie.value)

    // Check if session hasn't expired
    const expires = new Date(sessionData.expires)
    if (expires <= new Date()) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 })
    }

    // Check if user is admin
    if (sessionData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Get total orders count
    const totalOrders = await prisma.order.count()

    // Get pending orders (status not COMPLETED or CANCELLED)
    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    })

    // Get completed orders today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const completedToday = await prisma.order.count({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Get total revenue from completed orders
    const revenueData = await prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    })

    const revenue = revenueData._sum.amount || 0

    // Calculate growth percentages (this month vs last month)
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Orders this month
    const ordersThisMonth = await prisma.order.count({
      where: {
        createdAt: { gte: firstDayThisMonth }
      }
    })

    // Orders last month
    const ordersLastMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: firstDayLastMonth,
          lte: lastDayLastMonth
        }
      }
    })

    // Revenue this month
    const revenueThisMonthData = await prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: firstDayThisMonth }
      },
      _sum: { amount: true }
    })
    const revenueThisMonth = Number(revenueThisMonthData._sum.amount || 0)

    // Revenue last month
    const revenueLastMonthData = await prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: {
          gte: firstDayLastMonth,
          lte: lastDayLastMonth
        }
      },
      _sum: { amount: true }
    })
    const revenueLastMonth = Number(revenueLastMonthData._sum.amount || 0)

    // Calculate percentage changes
    const ordersGrowth = ordersLastMonth > 0
      ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
      : 0

    const revenueGrowth = revenueLastMonth > 0
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
      : 0

    return NextResponse.json({
      success: true,
      metrics: {
        totalOrders,
        pendingOrders,
        completedToday,
        revenue: Number(revenue),
        ordersGrowth,
        revenueGrowth
      }
    })
  } catch (error) {
    console.error('Admin metrics error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    )
  }
}
