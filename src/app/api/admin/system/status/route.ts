import { NextRequest, NextResponse } from 'next/server'
import { getAppStatus } from '@/lib/startup'

export async function GET(request: NextRequest) {
  try {
    const status = getAppStatus()

    return NextResponse.json({
      success: true,
      system: status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    )
  }
}