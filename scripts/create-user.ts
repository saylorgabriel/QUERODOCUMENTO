#!/usr/bin/env bun
/**
 * Script to create a user in the database
 *
 * Usage:
 *   bun scripts/create-user.ts <email> <password> [name]
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const email = process.argv[2]
const password = process.argv[3]
const name = process.argv[4]

if (!email || !password) {
  console.error('❌ Email and password are required')
  console.log('Usage: bun scripts/create-user.ts <email> <password> [name]')
  console.log('Example: bun scripts/create-user.ts user@example.com mypassword "John Doe"')
  process.exit(1)
}

const prisma = new PrismaClient()

async function createUser() {
  console.log(`🔧 Creating user: ${email}\n`)

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('⚠️  User already exists!')
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Name: ${existingUser.name || 'N/A'}`)
      console.log('\n💡 Use the update-user script to modify this user')
      return false
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'USER',
      },
    })

    console.log('✅ User created successfully!\n')
    console.log('📋 User Details:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name || 'N/A'}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Created At: ${user.createdAt}`)

    console.log('\n🔐 Login Credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)

    return true
  } catch (error) {
    console.error('💥 Error creating user:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
