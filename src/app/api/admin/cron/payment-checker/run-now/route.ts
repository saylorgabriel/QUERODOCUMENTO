import { NextRequest, NextResponse } from 'next/server'
import { paymentChecker } from '@/lib/cron/payment-checker'

export async function POST(request: NextRequest) {
  try {
    const result = await paymentChecker.runNow()

    return NextResponse.json({
      success: true,
      message: 'Payment check executed manually',
      result
    })
  } catch (error) {
    console.error('Error running payment checker manually:', error)
    return NextResponse.json(
      {
        error: 'Failed to run payment checker',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}