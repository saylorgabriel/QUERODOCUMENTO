import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('simple-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ user: null })
    }

    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session hasn't expired
    const expires = new Date(sessionData.expires)
    if (expires <= new Date()) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ 
      user: sessionData.user,
      expires: sessionData.expires 
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ user: null })
  }
}