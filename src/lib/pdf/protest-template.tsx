/**
 * Protest Consultation PDF Template
 * Professional PDF template for protest consultation results
 */

import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { BaseTemplate, styles } from './base-template'
import { 
  formatDate, 
  formatDateOnly, 
  formatCurrency, 
  formatDocument, 
  getDocumentType,
  generateWatermark,
  generateQRCodeData
} from './utils'

// Define the protest query result interface
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

interface ProtestTemplateProps {
  data: ProtestQueryResult
  includeQRCode?: boolean
}

// Status color mapping for protests
const getStatusInfo = (status: ProtestItem['status']) => {
  const statusMap = {
    'ACTIVE': { text: 'ATIVO', color: '#EF4444' },
    'PAID': { text: 'QUITADO', color: '#10B981' },
    'CANCELLED': { text: 'CANCELADO', color: '#6B7280' }
  }
  return statusMap[status] || statusMap['ACTIVE']
}

// Table cell widths for protest table
const tableWidths = {
  date: '15%',
  value: '15%',
  creditor: '25%',
  notaryOffice: '20%',
  location: '15%',
  status: '10%'
}

export function ProtestTemplate({ data, includeQRCode = true }: ProtestTemplateProps) {
  const watermarkText = generateWatermark(data.queryId)
  const qrCodeData = includeQRCode ? generateQRCodeData(data.queryId, data.documentSearched) : undefined
  
  // Determine if this is a clean or problematic result
  const isCleanRecord = data.totalProtests === 0
  const documentTypeDisplay = getDocumentType(data.documentSearched)
  const formattedDocument = formatDocument(data.documentSearched)
  
  return (
    <BaseTemplate 
      title="CERTIDÃO DE CONSULTA DE PROTESTOS"
      watermarkText={watermarkText}
      qrCodeData={qrCodeData}
      queryId={data.queryId}
    >
      {/* Query Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DADOS DA CONSULTA</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Documento Consultado:</Text>
            <Text style={styles.infoValue}>{formattedDocument} ({documentTypeDisplay})</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nome/Razão Social:</Text>
            <Text style={styles.infoValue}>{data.name}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data da Consulta:</Text>
            <Text style={styles.infoValue}>{formatDate(data.searchDate)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status da Consulta:</Text>
            <Text style={styles.infoValue}>
              {data.status === 'COMPLETED' ? 'CONCLUÍDA' : 
               data.status === 'PROCESSING' ? 'PROCESSANDO' : 'ERRO'}
            </Text>
          </View>
        </View>
      </View>

      {/* Results Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RESULTADO DA CONSULTA</Text>
        
        <View style={isCleanRecord ? styles.alertSuccess : styles.alertWarning}>
          <Text style={styles.alertText}>
            <Text style={{ fontWeight: 'bold' }}>
              {isCleanRecord ? 'SITUAÇÃO REGULAR' : 'PROTESTOS ENCONTRADOS'}
            </Text>
            {'\n\n'}
            {data.summary}
            {'\n\n'}
            {isCleanRecord 
              ? 'Nenhum registro de protesto foi localizado para o documento consultado na data da pesquisa.'
              : `Total de ${data.totalProtests} protesto(s) localizado(s) para o documento consultado.`
            }
          </Text>
        </View>
        
        {!isCleanRecord && (
          <View style={styles.section}>
            <Text style={styles.infoLabel}>
              Total de Protestos Encontrados: <Text style={styles.infoValue}>{data.totalProtests}</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Protests Table (only if there are protests) */}
      {!isCleanRecord && data.protests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALHES DOS PROTESTOS</Text>
          
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: tableWidths.date }]}>
                Data
              </Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: tableWidths.value }]}>
                Valor
              </Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: tableWidths.creditor }]}>
                Credor
              </Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: tableWidths.notaryOffice }]}>
                Cartório
              </Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: tableWidths.location }]}>
                Local
              </Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: tableWidths.status }]}>
                Status
              </Text>
            </View>
            
            {/* Table Rows */}
            {data.protests.map((protest, index) => {
              const statusInfo = getStatusInfo(protest.status)
              
              return (
                <View key={protest.id || index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: tableWidths.date }]}>
                    {formatDateOnly(protest.date)}
                  </Text>
                  <Text style={[styles.tableCell, { width: tableWidths.value }]}>
                    {formatCurrency(protest.value)}
                  </Text>
                  <Text style={[styles.tableCell, { width: tableWidths.creditor }]}>
                    {protest.creditor}
                  </Text>
                  <Text style={[styles.tableCell, { width: tableWidths.notaryOffice }]}>
                    {protest.notaryOffice}
                  </Text>
                  <Text style={[styles.tableCell, { width: tableWidths.location }]}>
                    {protest.city}/{protest.state}
                  </Text>
                  <Text style={[
                    styles.tableCell, 
                    { width: tableWidths.status, color: statusInfo.color, fontWeight: 'bold' }
                  ]}>
                    {statusInfo.text}
                  </Text>
                </View>
              )
            })}
          </View>
          
          {/* Protests Summary */}
          <View style={{ marginTop: 15, padding: 10, backgroundColor: '#F9FAFB' }}>
            <Text style={{ fontSize: 10, color: '#374151', lineHeight: 1.4 }}>
              <Text style={{ fontWeight: 'bold' }}>RESUMO:</Text>
              {'\n'}• Total de protestos: {data.totalProtests}
              {'\n'}• Valor total: {formatCurrency(
                data.protests.reduce((sum, protest) => sum + protest.value, 0)
              )}
              {'\n'}• Protestos ativos: {data.protests.filter(p => p.status === 'ACTIVE').length}
              {'\n'}• Protestos quitados: {data.protests.filter(p => p.status === 'PAID').length}
              {'\n'}• Protestos cancelados: {data.protests.filter(p => p.status === 'CANCELLED').length}
            </Text>
          </View>
        </View>
      )}

      {/* Legal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMAÇÕES LEGAIS</Text>
        
        <Text style={{
          fontSize: 10,
          color: '#4B5563',
          lineHeight: 1.5,
          textAlign: 'justify'
        }}>
          <Text style={{ fontWeight: 'bold' }}>IMPORTANTE:</Text>
          {'\n\n'}
          • Esta consulta foi realizada nas bases de dados dos Cartórios de Protesto cadastrados em nosso sistema.
          {'\n\n'}
          • A ausência de protestos neste documento não significa inexistência de protestos em cartórios não 
          consultados ou em outras bases de dados.
          {'\n\n'}
          • Este documento tem caráter meramente informativo e não substitui certidões oficiais emitidas 
          diretamente pelos cartórios competentes.
          {'\n\n'}
          • Para fins oficiais, recomendamos a solicitação de certidão oficial junto ao cartório de protesto 
          da comarca de interesse.
          {'\n\n'}
          • A validade das informações contidas neste documento está limitada à data de sua emissão.
          {'\n\n'}
          • Em conformidade com a Lei nº 13.709/2018 (LGPD), os dados pessoais utilizados nesta consulta 
          são tratados exclusivamente para a prestação do serviço solicitado.
        </Text>
      </View>

      {/* Validation Information */}
      {includeQRCode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VALIDAÇÃO DO DOCUMENTO</Text>
          
          <Text style={{
            fontSize: 10,
            color: '#6B7280',
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            Para validar a autenticidade deste documento, acesse:{'\n'}
            <Text style={{ fontWeight: 'bold', color: '#1F2937' }}>
              www.querodocumento.com.br/validar
            </Text>
            {'\n'}
            E informe o código: <Text style={{ fontWeight: 'bold' }}>{data.queryId}</Text>
            {'\n\n'}
            Ou utilize o código QR presente neste documento.
          </Text>
        </View>
      )}
    </BaseTemplate>
  )
}

export default ProtestTemplate