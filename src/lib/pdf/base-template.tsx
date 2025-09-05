/**
 * Base PDF Template
 * Common layout and styling for all PDF documents
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate } from './utils'

// Register fonts for better typography (optional)
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
// })

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333333',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
  },
  
  headerLeft: {
    flexDirection: 'column',
    flex: 2,
  },
  
  headerRight: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-end',
  },
  
  logo: {
    width: 120,
    height: 40,
    marginBottom: 8,
  },
  
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  companySlogan: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
  },
  
  companyInfo: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  
  // Content styles
  content: {
    flex: 1,
    marginBottom: 30,
  },
  
  section: {
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
  },
  
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  
  infoItem: {
    width: '50%',
    paddingRight: 10,
    marginBottom: 8,
  },
  
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 2,
  },
  
  infoValue: {
    fontSize: 11,
    color: '#1F2937',
  },
  
  // Table styles
  table: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    marginTop: 10,
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    minHeight: 25,
    alignItems: 'center',
  },
  
  tableHeaderRow: {
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
  },
  
  tableCell: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 10,
    textAlign: 'left',
  },
  
  tableCellHeader: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 10,
  },
  
  // Alert styles
  alertSuccess: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    borderLeftStyle: 'solid',
    padding: 12,
    marginBottom: 15,
  },
  
  alertError: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderLeftStyle: 'solid',
    padding: 12,
    marginBottom: 15,
  },
  
  alertWarning: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderLeftStyle: 'solid',
    padding: 12,
    marginBottom: 15,
  },
  
  alertText: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  
  // Footer styles
  footer: {
    flexDirection: 'column',
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
  },
  
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  footerLeft: {
    flex: 2,
  },
  
  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  footerText: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.3,
  },
  
  pageNumber: {
    fontSize: 8,
    color: '#6B7280',
  },
  
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 36,
    color: '#F3F4F6',
    opacity: 0.1,
    zIndex: -1,
    fontWeight: 'bold',
  },
  
  qrCodeContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
  },
  
  qrCode: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  
  qrCodeText: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
  },
})

// Company information (this should be configurable)
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

interface BaseTemplateProps {
  title: string
  children: React.ReactNode
  watermarkText?: string
  qrCodeData?: string
  queryId?: string
  pageCount?: number
  currentPage?: number
}

export function BaseTemplate({ 
  title, 
  children, 
  watermarkText,
  qrCodeData,
  queryId,
  pageCount = 1,
  currentPage = 1
}: BaseTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        {watermarkText && (
          <Text style={styles.watermark}>{watermarkText}</Text>
        )}
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Company logo would go here */}
            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
            <Text style={styles.companySlogan}>{COMPANY_INFO.slogan}</Text>
            <Text style={styles.companyInfo}>
              {COMPANY_INFO.address}{'\n'}
              {COMPANY_INFO.cityState}{'\n'}
              Tel: {COMPANY_INFO.phone} | E-mail: {COMPANY_INFO.email}{'\n'}
              CNPJ: {COMPANY_INFO.cnpj} | {COMPANY_INFO.website}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.infoLabel}>Data/Hora:</Text>
            <Text style={styles.infoValue}>{formatDate(new Date())}</Text>
            {queryId && (
              <>
                <Text style={[styles.infoLabel, { marginTop: 8 }]}>ID da Consulta:</Text>
                <Text style={styles.infoValue}>{queryId}</Text>
              </>
            )}
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.documentTitle}>{title}</Text>

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>

        {/* QR Code (if provided) */}
        {qrCodeData && (
          <View style={styles.qrCodeContainer}>
            {/* QR Code image would be generated and inserted here */}
            <Text style={styles.qrCodeText}>
              Código QR para validação online{'\n'}
              {qrCodeData}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerText}>
                Este documento foi gerado eletronicamente e possui validade legal.{'\n'}
                Para verificar a autenticidade, acesse nosso site e informe o código de consulta.{'\n'}
                Data de geração: {formatDate(new Date())}
              </Text>
            </View>
            
            <View style={styles.footerRight}>
              <Text style={styles.pageNumber}>
                Página {currentPage} de {pageCount}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export { styles }
export default BaseTemplate