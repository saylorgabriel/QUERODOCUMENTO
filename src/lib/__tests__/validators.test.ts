/**
 * Unit tests for validators utility functions
 */

import { describe, it, expect } from '@jest/globals'
import {
  validateCPF,
  validateCNPJ,
  formatCPF,
  formatCNPJ,
  detectDocumentType,
  validateDocument,
  formatDocument,
  sanitizeDocument,
  validatePhone,
  formatPhone,
} from '../validators'

describe('CPF Validation', () => {
  it('should validate correct CPF', () => {
    expect(validateCPF('11144477735')).toBe(true)
    expect(validateCPF('111.444.777-35')).toBe(true)
    expect(validateCPF('039.443.854-03')).toBe(true)
  })

  it('should reject invalid CPF', () => {
    expect(validateCPF('12345678900')).toBe(false)
    expect(validateCPF('11111111111')).toBe(false) // Same digits
    expect(validateCPF('123456789')).toBe(false) // Too short
    expect(validateCPF('123456789012')).toBe(false) // Too long
    expect(validateCPF('')).toBe(false)
    expect(validateCPF('abc.def.ghi-jk')).toBe(false)
  })

  it('should handle CPF with various formats', () => {
    expect(validateCPF('111 444 777 35')).toBe(true)
    expect(validateCPF('111-444-777-35')).toBe(true)
    expect(validateCPF('111.444.777.35')).toBe(true)
  })
})

describe('CNPJ Validation', () => {
  it('should validate correct CNPJ', () => {
    expect(validateCNPJ('11222333000181')).toBe(true)
    expect(validateCNPJ('11.222.333/0001-81')).toBe(true)
    expect(validateCNPJ('34238864000168')).toBe(true)
  })

  it('should reject invalid CNPJ', () => {
    expect(validateCNPJ('12345678000100')).toBe(false)
    expect(validateCNPJ('11111111111111')).toBe(false) // Same digits
    expect(validateCNPJ('123456789')).toBe(false) // Too short
    expect(validateCNPJ('123456789012345')).toBe(false) // Too long
    expect(validateCNPJ('')).toBe(false)
    expect(validateCNPJ('ab.cde.fgh/ijkl-mn')).toBe(false)
  })

  it('should handle CNPJ with various formats', () => {
    expect(validateCNPJ('11 222 333 0001 81')).toBe(true)
    expect(validateCNPJ('11-222-333-0001-81')).toBe(true)
    expect(validateCNPJ('11.222.333.0001.81')).toBe(true)
  })
})

describe('CPF Formatting', () => {
  it('should format CPF correctly', () => {
    expect(formatCPF('11144477735')).toBe('111.444.777-35')
    expect(formatCPF('111.444.777-35')).toBe('111.444.777-35')
    expect(formatCPF('111 444 777 35')).toBe('111.444.777-35')
  })

  it('should return original string if not valid CPF length', () => {
    expect(formatCPF('123456')).toBe('123456')
    expect(formatCPF('123456789012')).toBe('123456789012')
    expect(formatCPF('')).toBe('')
  })
})

describe('CNPJ Formatting', () => {
  it('should format CNPJ correctly', () => {
    expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
    expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81')
    expect(formatCNPJ('11 222 333 0001 81')).toBe('11.222.333/0001-81')
  })

  it('should return original string if not valid CNPJ length', () => {
    expect(formatCNPJ('123456')).toBe('123456')
    expect(formatCNPJ('123456789012345')).toBe('123456789012345')
    expect(formatCNPJ('')).toBe('')
  })
})

describe('Document Type Detection', () => {
  it('should detect CPF correctly', () => {
    expect(detectDocumentType('11144477735')).toBe('CPF')
    expect(detectDocumentType('111.444.777-35')).toBe('CPF')
    expect(detectDocumentType('111 444 777 35')).toBe('CPF')
  })

  it('should detect CNPJ correctly', () => {
    expect(detectDocumentType('11222333000181')).toBe('CNPJ')
    expect(detectDocumentType('11.222.333/0001-81')).toBe('CNPJ')
    expect(detectDocumentType('11 222 333 0001 81')).toBe('CNPJ')
  })

  it('should return null for invalid lengths', () => {
    expect(detectDocumentType('123456')).toBe(null)
    expect(detectDocumentType('123456789012')).toBe(null)
    expect(detectDocumentType('123456789012345')).toBe(null)
    expect(detectDocumentType('')).toBe(null)
  })
})

describe('Generic Document Validation', () => {
  it('should validate CPF using generic function', () => {
    expect(validateDocument('11144477735')).toBe(true)
    expect(validateDocument('111.444.777-35')).toBe(true)
    expect(validateDocument('12345678900')).toBe(false)
  })

  it('should validate CNPJ using generic function', () => {
    expect(validateDocument('11222333000181')).toBe(true)
    expect(validateDocument('11.222.333/0001-81')).toBe(true)
    expect(validateDocument('12345678000100')).toBe(false)
  })

  it('should reject invalid documents', () => {
    expect(validateDocument('123456')).toBe(false)
    expect(validateDocument('')).toBe(false)
    expect(validateDocument('abc')).toBe(false)
  })
})

describe('Generic Document Formatting', () => {
  it('should format CPF using generic function', () => {
    expect(formatDocument('11144477735')).toBe('111.444.777-35')
  })

  it('should format CNPJ using generic function', () => {
    expect(formatDocument('11222333000181')).toBe('11.222.333/0001-81')
  })

  it('should return original for unrecognized formats', () => {
    expect(formatDocument('123456')).toBe('123456')
    expect(formatDocument('')).toBe('')
  })
})

describe('Document Sanitization', () => {
  it('should remove all non-numeric characters', () => {
    expect(sanitizeDocument('111.444.777-35')).toBe('11144477735')
    expect(sanitizeDocument('11.222.333/0001-81')).toBe('11222333000181')
    expect(sanitizeDocument('111 444 777 35')).toBe('11144477735')
    expect(sanitizeDocument('abc123def456')).toBe('123456')
    expect(sanitizeDocument('!@#$%')).toBe('')
  })

  it('should handle empty and null strings', () => {
    expect(sanitizeDocument('')).toBe('')
    expect(sanitizeDocument(' ')).toBe('')
  })
})

describe('Phone Validation', () => {
  it('should validate correct phone numbers', () => {
    expect(validatePhone('1199999999')).toBe(true) // 10 digits
    expect(validatePhone('11999999999')).toBe(true) // 11 digits
    expect(validatePhone('(11) 99999-9999')).toBe(true)
    expect(validatePhone('(11) 9999-9999')).toBe(true)
  })

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false)
    expect(validatePhone('123456789')).toBe(false) // 9 digits
    expect(validatePhone('123456789012')).toBe(false) // 12 digits
    expect(validatePhone('')).toBe(false)
    expect(validatePhone('abc')).toBe(false)
  })
})

describe('Phone Formatting', () => {
  it('should format 10-digit phone number', () => {
    expect(formatPhone('1199999999')).toBe('(11) 9999-9999')
    expect(formatPhone('11 9999 9999')).toBe('(11) 9999-9999')
  })

  it('should format 11-digit phone number', () => {
    expect(formatPhone('11999999999')).toBe('(11) 99999-9999')
    expect(formatPhone('11 99999 9999')).toBe('(11) 99999-9999')
  })

  it('should return original for invalid lengths', () => {
    expect(formatPhone('123')).toBe('123')
    expect(formatPhone('123456789')).toBe('123456789')
    expect(formatPhone('')).toBe('')
  })

  it('should handle already formatted phone numbers', () => {
    expect(formatPhone('(11) 9999-9999')).toBe('(11) 9999-9999')
    expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999')
  })
})

describe('Edge Cases', () => {
  it('should handle undefined and null inputs gracefully', () => {
    // Type assertion for testing - in real usage TypeScript would prevent this
    expect(() => validateCPF(null as any)).not.toThrow()
    expect(() => validateCNPJ(undefined as any)).not.toThrow()
    expect(() => formatCPF(null as any)).not.toThrow()
  })

  it('should handle very long strings', () => {
    const longString = '1'.repeat(1000)
    expect(validateCPF(longString)).toBe(false)
    expect(validateCNPJ(longString)).toBe(false)
    expect(detectDocumentType(longString)).toBe(null)
  })

  it('should handle strings with only special characters', () => {
    expect(validateDocument('!@#$%^&*()')).toBe(false)
    expect(formatDocument('!@#$%^&*()')).toBe('!@#$%^&*()')
    expect(sanitizeDocument('!@#$%^&*()')).toBe('')
  })
})