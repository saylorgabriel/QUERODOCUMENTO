import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('simple-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ user: null, isAdmin: false })
    }

    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session hasn't expired
    const expires = new Date(sessionData.expires)
    if (expires <= new Date()) {
      return NextResponse.json({ user: null, isAdmin: false })
    }

    // Check if user is admin
    const isAdmin = sessionData.user?.role === 'ADMIN'

    return NextResponse.json({ 
      user: sessionData.user,
      isAdmin,
      expires: sessionData.expires 
    })
  } catch (error) {
    console.error('Admin session check error:', error)
    return NextResponse.json({ user: null, isAdmin: false })
  }
}