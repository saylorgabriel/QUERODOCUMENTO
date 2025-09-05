/**
 * jsPDF Template for Protest Consultation
 * Professional PDF generation using jsPDF instead of @react-pdf/renderer
 */

import QRCode from 'qrcode'
import { 
  formatDate, 
  formatDateOnly, 
  formatCurrency, 
  formatDocument, 
  getDocumentType,
  generateWatermark,
  generateQRCodeData,
  getStateName 
} from './utils'

// Define interfaces
interface ProtestItem {
  id: string
  date: string
  value: number
  creditor: string
  notaryOffice: string
  city: string
  state: string
  protocol: string
  status: 'ACTIVE' | 'PAID' | 'CANCELLED'
}

interface ProtestQueryResult {
  queryId: string
  documentSearched: string
  documentType: 'CPF' | 'CNPJ'
  name: string
  searchDate: string
  status: 'COMPLETED' | 'PROCESSING' | 'ERROR'
  totalProtests: number
  protests: ProtestItem[]
  summary: string
}

// Company information
const COMPANY_INFO = {
  name: 'QueróDocumento',
  slogan: 'Consultas e Certidões de Protesto Online',
  address: 'Av. Paulista, 1000 - Bela Vista',
  cityState: 'São Paulo, SP - CEP: 01310-100',
  phone: '(11) 3000-0000',
  email: 'contato@querodocumento.com.br',
  cnpj: '12.345.678/0001-90',
  website: 'www.querodocumento.com.br'
}

// Colors
const COLORS = {
  primary: '#1F2937',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  light: '#F3F4F6',
  border: '#E5E7EB'
}

export async function generateProtestPDF(data: ProtestQueryResult, includeQRCode: boolean = true): Promise<Uint8Array> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf')
  // @ts-ignore - autotable plugin
  await import('jspdf-autotable')
  
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  let currentY = margin

  // Helper function to check if we need a new page
  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - margin) {
      doc.addPage()
      currentY = margin
      return true
    }
    return false
  }

  // Add watermark
  doc.saveGraphicsState()
  doc.setGState(doc.GState({ opacity: 0.1 }))
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(48)
  doc.text(generateWatermark(data.queryId), pageWidth/2, pageHeight/2, { 
    angle: -45, 
    align: 'center' 
  })
  doc.restoreGraphicsState()

  // Header
  doc.setTextColor(COLORS.primary)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY_INFO.name, margin, currentY)
  
  currentY += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.secondary)
  doc.text(COMPANY_INFO.slogan, margin, currentY)
  
  currentY += 8
  doc.setFontSize(8)
  const companyDetails = [
    COMPANY_INFO.address,
    COMPANY_INFO.cityState,
    `Tel: ${COMPANY_INFO.phone} | E-mail: ${COMPANY_INFO.email}`,
    `CNPJ: ${COMPANY_INFO.cnpj} | ${COMPANY_INFO.website}`
  ]
  companyDetails.forEach(line => {
    doc.text(line, margin, currentY)
    currentY += 4
  })

  // Date and Query ID (top right)
  doc.setTextColor(COLORS.secondary)
  doc.setFontSize(8)
  doc.text('Data/Hora:', pageWidth - margin - 50, margin)
  doc.text(formatDate(new Date()), pageWidth - margin - 50, margin + 4)
  doc.text('ID da Consulta:', pageWidth - margin - 50, margin + 12)
  doc.setFont('helvetica', 'bold')
  doc.text(data.queryId, pageWidth - margin - 50, margin + 16)

  // Line separator
  currentY += 5
  doc.setDrawColor(COLORS.border)
  doc.setLineWidth(0.5)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 15

  // Document Title
  doc.setTextColor(COLORS.primary)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const title = 'CERTIDÃO DE CONSULTA DE PROTESTOS'
  const titleWidth = doc.getTextWidth(title)
  doc.text(title, (pageWidth - titleWidth) / 2, currentY)
  currentY += 15

  // Query Information Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DA CONSULTA', margin, currentY)
  currentY += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.secondary)
  
  const queryInfo = [
    ['Documento Consultado:', `${formatDocument(data.documentSearched)} (${getDocumentType(data.documentSearched)})`],
    ['Nome/Razão Social:', data.name],
    ['Data da Consulta:', formatDate(data.searchDate)],
    ['Status da Consulta:', data.status === 'COMPLETED' ? 'CONCLUÍDA' : data.status === 'PROCESSING' ? 'PROCESSANDO' : 'ERRO']
  ]

  queryInfo.forEach((info, index) => {
    const x = margin + (index % 2) * (contentWidth / 2)
    const y = currentY + Math.floor(index / 2) * 8
    doc.setFont('helvetica', 'bold')
    doc.text(info[0], x, y)
    doc.setFont('helvetica', 'normal')
    doc.text(info[1], x, y + 4)
  })

  currentY += 25

  // Results Summary
  checkPageBreak(30)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.primary)
  doc.text('RESULTADO DA CONSULTA', margin, currentY)
  currentY += 8

  // Summary box
  const isCleanRecord = data.totalProtests === 0
  const boxColor = isCleanRecord ? COLORS.success : COLORS.warning
  
  // Draw colored border
  doc.setDrawColor(boxColor)
  doc.setLineWidth(2)
  doc.line(margin, currentY, margin, currentY + 20)
  
  // Background
  doc.setFillColor(isCleanRecord ? '#ECFDF5' : '#FFFBEB')
  doc.rect(margin + 2, currentY - 2, contentWidth - 2, 20, 'F')

  doc.setTextColor(isCleanRecord ? '#065F46' : '#92400E')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(isCleanRecord ? 'SITUAÇÃO REGULAR' : 'PROTESTOS ENCONTRADOS', margin + 5, currentY + 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const summaryLines = doc.splitTextToSize(data.summary, contentWidth - 10)
  doc.text(summaryLines, margin + 5, currentY + 10)

  if (!isCleanRecord) {
    doc.setFont('helvetica', 'bold')
    doc.text(`Total de ${data.totalProtests} protesto(s) localizado(s).`, margin + 5, currentY + 16)
  }

  currentY += 25

  // Protests Table (only if there are protests)
  if (!isCleanRecord && data.protests.length > 0) {
    checkPageBreak(60)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DETALHES DOS PROTESTOS', margin, currentY)
    currentY += 10

    // Prepare table data
    const tableData = data.protests.map((protest) => [
      formatDateOnly(protest.date),
      formatCurrency(protest.value),
      protest.creditor,
      protest.notaryOffice,
      `${protest.city}/${protest.state}`,
      protest.status === 'ACTIVE' ? 'ATIVO' : protest.status === 'PAID' ? 'QUITADO' : 'CANCELADO'
    ])

    // @ts-ignore - autotable types
    doc.autoTable({
      startY: currentY,
      head: [['Data', 'Valor', 'Credor', 'Cartório', 'Local', 'Status']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: COLORS.light,
        textColor: COLORS.primary,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 }
      }
    })

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 10

    // Protests summary
    const totalValue = data.protests.reduce((sum, protest) => sum + protest.value, 0)
    const activeCount = data.protests.filter(p => p.status === 'ACTIVE').length
    const paidCount = data.protests.filter(p => p.status === 'PAID').length
    const cancelledCount = data.protests.filter(p => p.status === 'CANCELLED').length

    doc.setFillColor(COLORS.light)
    doc.rect(margin, currentY, contentWidth, 25, 'F')
    
    doc.setTextColor(COLORS.primary)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMO:', margin + 5, currentY + 5)
    
    doc.setFont('helvetica', 'normal')
    const summaryText = [
      `• Total de protestos: ${data.totalProtests}`,
      `• Valor total: ${formatCurrency(totalValue)}`,
      `• Protestos ativos: ${activeCount}`,
      `• Protestos quitados: ${paidCount}`,
      `• Protestos cancelados: ${cancelledCount}`
    ]
    
    summaryText.forEach((text, index) => {
      doc.text(text, margin + 5, currentY + 9 + (index * 4))
    })

    currentY += 30
  }

  // Legal Information
  checkPageBreak(50)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.primary)
  doc.text('INFORMAÇÕES LEGAIS', margin, currentY)
  currentY += 8

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.secondary)
  
  const legalText = [
    'IMPORTANTE:',
    '',
    '• Esta consulta foi realizada nas bases de dados dos Cartórios de Protesto cadastrados em nosso sistema.',
    '',
    '• A ausência de protestos neste documento não significa inexistência de protestos em cartórios não consultados ou em outras bases de dados.',
    '',
    '• Este documento tem caráter meramente informativo e não substitui certidões oficiais emitidas diretamente pelos cartórios competentes.',
    '',
    '• Para fins oficiais, recomendamos a solicitação de certidão oficial junto ao cartório de protesto da comarca de interesse.',
    '',
    '• A validade das informações contidas neste documento está limitada à data de sua emissão.',
    '',
    '• Em conformidade com a Lei nº 13.709/2018 (LGPD), os dados pessoais utilizados nesta consulta são tratados exclusivamente para a prestação do serviço solicitado.'
  ]

  legalText.forEach(text => {
    if (text.startsWith('IMPORTANTE:')) {
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }
    
    if (text) {
      const lines = doc.splitTextToSize(text, contentWidth)
      doc.text(lines, margin, currentY)
      currentY += lines.length * 4
    } else {
      currentY += 2
    }
  })

  // QR Code and Validation (if enabled)
  if (includeQRCode) {
    checkPageBreak(40)
    currentY += 10
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('VALIDAÇÃO DO DOCUMENTO', margin, currentY)
    currentY += 8

    try {
      // Generate QR Code
      const qrCodeData = generateQRCodeData(data.queryId, data.documentSearched)
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Add QR Code
      doc.addImage(qrCodeDataURL, 'PNG', pageWidth - margin - 30, currentY, 25, 25)
    } catch (error) {
      console.warn('QR Code generation failed:', error)
    }

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.secondary)
    
    const validationText = [
      'Para validar a autenticidade deste documento, acesse:',
      'www.querodocumento.com.br/validar',
      `E informe o código: ${data.queryId}`,
      '',
      'Ou utilize o código QR presente neste documento.'
    ]

    validationText.forEach((text, index) => {
      if (text.includes('www.querodocumento.com.br')) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.primary)
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(COLORS.secondary)
      }
      
      const textWidth = doc.getTextWidth(text)
      doc.text(text, (pageWidth - textWidth) / 2, currentY + (index * 4))
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Footer line
    doc.setDrawColor(COLORS.border)
    doc.setLineWidth(0.5)
    doc.line(margin, pageHeight - margin - 10, pageWidth - margin, pageHeight - margin - 10)
    
    // Footer text
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.secondary)
    doc.text('Este documento foi gerado eletronicamente e possui validade legal.', margin, pageHeight - margin - 6)
    doc.text(`Data de geração: ${formatDate(new Date())}`, margin, pageHeight - margin - 2)
    
    // Page number
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 30, pageHeight - margin - 2)
  }

  // Return the PDF as Uint8Array
  const pdfOutput = doc.output('arraybuffer')
  return new Uint8Array(pdfOutput)
}