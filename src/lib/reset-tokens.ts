// Database-backed reset token storage using Prisma
import {
  createResetToken as dbCreateResetToken,
  validateResetToken as dbValidateResetToken,
  useResetToken as dbUseResetToken,
  clearExpiredResetTokens
} from './database'

// Helper function to store reset token
export async function storeResetToken(email: string, token: string, expires: Date): Promise<void> {
  const expiresInHours = Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60))
  await dbCreateResetToken(email, token, expiresInHours)
}

// Helper function to validate reset token
export async function validateResetToken(email: string, token: string): Promise<boolean> {
  return await dbValidateResetToken(email, token)
}

// Helper function to clear used token (mark as used)
export async function clearResetToken(email: string, token: string): Promise<void> {
  await dbUseResetToken(email, token)
}

// Helper function to clean up expired tokens
export async function cleanupExpiredTokens(): Promise<number> {
  return await clearExpiredResetTokens()
}

// Utility function to generate secure reset token
export function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}