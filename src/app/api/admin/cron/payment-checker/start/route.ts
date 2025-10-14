import { NextRequest, NextResponse } from 'next/server'
import { paymentChecker } from '@/lib/cron/payment-checker'

export async function POST(request: NextRequest) {
  try {
    paymentChecker.start()

    return NextResponse.json({
      success: true,
      message: 'Payment checker cron started',
      status: paymentChecker.getStatus()
    })
  } catch (error) {
    console.error('Error starting payment checker:', error)
    return NextResponse.json(
      { error: 'Failed to start payment checker' },
      { status: 500 }
    )
  }
}