/**
 * Document validation utilities for CPF and CNPJ
 */

/**
 * Validates CPF (Brazilian individual taxpayer registry)
 */
export function validateCPF(cpf: string): boolean {
  // Handle null/undefined inputs
  if (!cpf || typeof cpf !== 'string') return false
  
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/[^\d]/g, '')

  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Calculate first verification digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(cleanCPF.charAt(9))) return false

  // Calculate second verification digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

/**
 * Validates CNPJ (Brazilian business taxpayer registry)
 */
export function validateCNPJ(cnpj: string): boolean {
  // Handle null/undefined inputs
  if (!cnpj || typeof cnpj !== 'string') return false
  
  // Remove non-numeric characters
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '')

  // Check if has 14 digits
  if (cleanCNPJ.length !== 14) return false

  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false

  // Validation algorithm
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  // Calculate first verification digit
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i]
  }
  let digit = sum % 11
  digit = digit < 2 ? 0 : 11 - digit
  if (digit !== parseInt(cleanCNPJ.charAt(12))) return false

  // Calculate second verification digit
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i]
  }
  digit = sum % 11
  digit = digit < 2 ? 0 : 11 - digit
  if (digit !== parseInt(cleanCNPJ.charAt(13))) return false

  return true
}

/**
 * Formats CPF for display (xxx.xxx.xxx-xx)
 */
export function formatCPF(cpf: string): string {
  if (!cpf || typeof cpf !== 'string') return ''
  const clean = cpf.replace(/[^\d]/g, '')
  if (clean.length !== 11) return cpf
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formats CNPJ for display (xx.xxx.xxx/xxxx-xx)
 */
export function formatCNPJ(cnpj: string): string {
  if (!cnpj || typeof cnpj !== 'string') return ''
  const clean = cnpj.replace(/[^\d]/g, '')
  if (clean.length !== 14) return cnpj
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Detects if a document is CPF or CNPJ based on length
 */
export function detectDocumentType(document: string): 'CPF' | 'CNPJ' | null {
  if (!document || typeof document !== 'string') return null
  const clean = document.replace(/[^\d]/g, '')
  if (clean.length === 11) return 'CPF'
  if (clean.length === 14) return 'CNPJ'
  return null
}

/**
 * Validates a document (CPF or CNPJ)
 */
export function validateDocument(document: string): boolean {
  if (!document || typeof document !== 'string') return false
  const type = detectDocumentType(document)
  if (type === 'CPF') return validateCPF(document)
  if (type === 'CNPJ') return validateCNPJ(document)
  return false
}

/**
 * Formats a document (CPF or CNPJ) for display
 */
export function formatDocument(document: string): string {
  if (!document || typeof document !== 'string') return ''
  const type = detectDocumentType(document)
  if (type === 'CPF') return formatCPF(document)
  if (type === 'CNPJ') return formatCNPJ(document)
  return document
}

/**
 * Sanitizes a document by removing non-numeric characters
 */
export function sanitizeDocument(document: string): string {
  if (!document || typeof document !== 'string') return ''
  return document.replace(/[^\d]/g, '')
}

/**
 * Validates phone number (Brazilian format)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  const clean = phone.replace(/[^\d]/g, '')
  return clean.length === 10 || clean.length === 11
}

/**
 * Formats phone for display
 */
export function formatPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return ''
  const clean = phone.replace(/[^\d]/g, '')
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return phone
}