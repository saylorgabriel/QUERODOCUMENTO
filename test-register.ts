import { POST } from './src/app/api/auth/register/route'

async function testRegister() {
  const request = new Request('http://localhost:3009/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Direct Test',
      email: 'direct@test.com',
      password: 'teste123',
      document: '123.456.789-00',
      phone: '(11) 99999-9999'
    })
  })

  try {
    console.log('Testing registration...')
    const response = await POST(request)
    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testRegister()