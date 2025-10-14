import { NextRequest, NextResponse } from 'next/server'
import { paymentChecker } from '@/lib/cron/payment-checker'

export async function POST(request: NextRequest) {
  try {
    paymentChecker.stop()

    return NextResponse.json({
      success: true,
      message: 'Payment checker cron stopped',
      status: paymentChecker.getStatus()
    })
  } catch (error) {
    console.error('Error stopping payment checker:', error)
    return NextResponse.json(
      { error: 'Failed to stop payment checker' },
      { status: 500 }
    )
  }
}