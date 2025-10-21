#!/usr/bin/env bun
/**
 * Script to fix production database schema
 * Adds missing 'rg' column to User table
 *
 * Usage:
 *   DATABASE_URL="postgresql://user:pass@host:port/db" bun scripts/fix-production-schema.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing production database schema...')
  console.log('Adding missing "rg" column to User table\n')

  try {
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'User'
      AND column_name = 'rg'
    `

    const result = await prisma.$queryRawUnsafe(checkColumnQuery)

    if (Array.isArray(result) && result.length > 0) {
      console.log('✅ Column "rg" already exists in User table')
      return
    }

    console.log('Adding column "rg" to User table...')

    // Add the column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rg" TEXT;
    `)

    console.log('✅ Column "rg" added successfully')

    // Verify the change
    const verify = await prisma.$queryRawUnsafe(checkColumnQuery)
    if (Array.isArray(verify) && verify.length > 0) {
      console.log('✅ Verification successful - column exists')
    } else {
      console.log('❌ Verification failed - column may not have been created')
    }

  } catch (error) {
    console.error('❌ Error fixing schema:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('\n✨ Schema fix completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Schema fix failed:', error)
    process.exit(1)
  })
