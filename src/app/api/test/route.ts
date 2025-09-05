import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Test route works!' })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      message: 'POST works!',
      received: body 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error processing request',
      details: (error as any).message 
    }, { status: 500 })
  }
}
