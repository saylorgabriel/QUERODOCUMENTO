#!/usr/bin/env bun
/**
 * Script to test login functionality
 *
 * Usage:
 *   bun scripts/test-login.ts <email> <password> [url]
 *
 * Examples:
 *   bun scripts/test-login.ts drikamerino@hotmail.com 1234
 *   bun scripts/test-login.ts drikamerino@hotmail.com 1234 https://querodocumento.vercel.app
 */

const email = process.argv[2] || 'drikamerino@hotmail.com'
const password = process.argv[3] || '1234'
const baseUrl = process.argv[4] || 'https://querodocumento.vercel.app'

async function testLogin() {
  console.log('🧪 Testing login...')
  console.log(`📧 Email: ${email}`)
  console.log(`🔗 URL: ${baseUrl}/api/auth/simple-login\n`)

  try {
    const response = await fetch(`${baseUrl}/api/auth/simple-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()

    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    console.log(`📦 Response:`, JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('\n✅ Login successful!')
      if (data.user) {
        console.log('\n👤 User Info:')
        console.log(`   ID: ${data.user.id}`)
        console.log(`   Email: ${data.user.email}`)
        console.log(`   Name: ${data.user.name || 'N/A'}`)
        console.log(`   Role: ${data.user.role}`)
      }
    } else {
      console.log('\n❌ Login failed!')
      console.log(`   Error: ${data.error || 'Unknown error'}`)
    }

    return response.ok
  } catch (error) {
    console.error('\n💥 Error testing login:', error)
    return false
  }
}

testLogin()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
