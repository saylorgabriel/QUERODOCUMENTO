#!/usr/bin/env bun
/**
 * Script to check if a user exists in the database
 *
 * Usage:
 *   bun scripts/check-user.ts <email>
 */

import { PrismaClient } from '@prisma/client'

const email = process.argv[2]

if (!email) {
  console.error('❌ Email is required')
  console.log('Usage: bun scripts/check-user.ts <email>')
  process.exit(1)
}

const prisma = new PrismaClient()

async function checkUser() {
  console.log(`🔍 Checking if user exists: ${email}\n`)

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        cpf: true,
        cnpj: true,
        phone: true,
        rg: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      },
    })

    if (user) {
      console.log('✅ User found!\n')
      console.log('📋 User Details:')
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.name || 'N/A'}`)
      console.log(`   CPF: ${user.cpf || 'N/A'}`)
      console.log(`   CNPJ: ${user.cnpj || 'N/A'}`)
      console.log(`   Phone: ${user.phone || 'N/A'}`)
      console.log(`   RG: ${user.rg || 'N/A'}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Email Verified: ${user.emailVerified || 'No'}`)
      console.log(`   Created At: ${user.createdAt}`)
      return true
    } else {
      console.log('❌ User not found')
      console.log('\n💡 Tip: You can create this user with:')
      console.log(`   bun scripts/create-user.ts ${email}`)
      return false
    }
  } catch (error) {
    console.error('💥 Error checking user:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
  .then((found) => {
    process.exit(found ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
