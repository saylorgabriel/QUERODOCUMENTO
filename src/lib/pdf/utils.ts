/**
 * PDF Generation Utilities
 * Utility functions for formatting dates, currency, and document numbers in PDFs
 */

/**
 * Format a date string to Brazilian Portuguese format
 * @param dateString ISO date string or Date object
 * @returns Formatted date string (DD/MM/YYYY HH:mm:ss)
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo'
  }).format(date)
}

/**
 * Format a date string to Brazilian Portuguese format (date only)
 * @param dateString ISO date string or Date object
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDateOnly(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  }).format(date)
}

/**
 * Format currency values to Brazilian Real format
 * @param amount Number to format as currency
 * @returns Formatted currency string (R$ 1.234,56)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

/**
 * Format CPF with dots and dashes
 * @param cpf CPF string (11 digits)
 * @returns Formatted CPF (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Format CNPJ with dots, slashes and dashes
 * @param cnpj CNPJ string (14 digits)
 * @returns Formatted CNPJ (XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return cnpj
  
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Format document (CPF or CNPJ) based on its length
 * @param document Document string
 * @returns Formatted document string
 */
export function formatDocument(document: string): string {
  const cleaned = document.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return formatCPF(cleaned)
  } else if (cleaned.length === 14) {
    return formatCNPJ(cleaned)
  }
  
  return document
}

/**
 * Get document type based on length
 * @param document Document string
 * @returns Document type ('CPF' or 'CNPJ')
 */
export function getDocumentType(document: string): 'CPF' | 'CNPJ' {
  const cleaned = document.replace(/\D/g, '')
  return cleaned.length === 11 ? 'CPF' : 'CNPJ'
}

/**
 * Generate a unique filename for PDF downloads
 * @param prefix Filename prefix
 * @param document Document number (for uniqueness)
 * @returns Unique filename
 */
export function generatePDFFilename(prefix: string, document: string): string {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const cleanDocument = document.replace(/\D/g, '').slice(-4) // Last 4 digits
  return `${prefix}_${timestamp}_${cleanDocument}.pdf`
}

/**
 * Generate watermark text for PDFs
 * @param queryId Query ID for traceability
 * @returns Watermark text
 */
export function generateWatermark(queryId: string): string {
  return `CONSULTA ${queryId.toUpperCase()} - ${formatDate(new Date())}`
}

/**
 * Convert bytes to base64 data URI
 * @param bytes Uint8Array of PDF bytes
 * @returns Base64 data URI string
 */
export function bytesToBase64DataURI(bytes: Uint8Array): string {
  const base64 = Buffer.from(bytes).toString('base64')
  return `data:application/pdf;base64,${base64}`
}

/**
 * Generate validation QR code data
 * @param queryId Query ID
 * @param documentNumber Document number
 * @returns QR code data string
 */
export function generateQRCodeData(queryId: string, documentNumber: string): string {
  // In production, this would be a URL to validate the document
  // For now, we'll use a mock validation URL
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'https://querodocumento.com.br'
  return `${baseURL}/validar/${queryId}?doc=${encodeURIComponent(documentNumber)}`
}

/**
 * Get Brazilian state name from abbreviation
 * @param stateCode State code (e.g., 'SP', 'RJ')
 * @returns Full state name
 */
export function getStateName(stateCode: string): string {
  const states: { [key: string]: string } = {
    'AC': 'Acre',
    'AL': 'Alagoas', 
    'AP': 'Amapá',
    'AM': 'Amazonas',
    'BA': 'Bahia',
    'CE': 'Ceará',
    'DF': 'Distrito Federal',
    'ES': 'Espírito Santo',
    'GO': 'Goiás',
    'MA': 'Maranhão',
    'MT': 'Mato Grosso',
    'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais',
    'PA': 'Pará',
    'PB': 'Paraíba',
    'PR': 'Paraná',
    'PE': 'Pernambuco',
    'PI': 'Piauí',
    'RJ': 'Rio de Janeiro',
    'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia',
    'RR': 'Roraima',
    'SC': 'Santa Catarina',
    'SP': 'São Paulo',
    'SE': 'Sergipe',
    'TO': 'Tocantins'
  }
  
  return states[stateCode.toUpperCase()] || stateCode
}