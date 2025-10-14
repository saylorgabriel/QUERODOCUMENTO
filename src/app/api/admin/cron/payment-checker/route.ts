import { NextRequest, NextResponse } from 'next/server'
import { paymentChecker } from '@/lib/cron/payment-checker'

// Get cron status
export async function GET(request: NextRequest) {
  try {
    const status = paymentChecker.getStatus()

    return NextResponse.json({
      success: true,
      cron: status,
      endpoints: {
        start: 'POST /api/admin/cron/payment-checker/start',
        stop: 'POST /api/admin/cron/payment-checker/stop',
        runNow: 'POST /api/admin/cron/payment-checker/run-now',
        status: 'GET /api/admin/cron/payment-checker'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    )
  }
}