/**
 * Unit tests for ProtestResults component
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { ProtestResults } from '../ProtestResults'
import { mockFetch } from '@/__tests__/utils/test-utils'

// Mock the PDF generation response
const mockPDFResponse = {
  success: true,
  data: {
    dataUrl: 'data:application/pdf;base64,mock-pdf-data',
    filename: 'consulta-protesto-11144477735.pdf'
  }
}

// Mock protest query result with protests
const mockResultWithProtests = {
  queryId: 'query-123',
  documentSearched: '111.444.777-35',
  documentType: 'CPF' as const,
  name: 'João Silva',
  searchDate: '2024-01-15T10:00:00Z',
  status: 'COMPLETED',
  totalProtests: 2,
  protests: [
    {
      id: 'protest-1',
      date: '2024-01-10T00:00:00Z',
      value: 1250.50,
      creditor: 'Banco Exemplo S.A.',
      notaryOffice: '1º Cartório de Protestos',
      city: 'São Paulo',
      state: 'SP',
      protocol: 'PR2024001234',
      status: 'ACTIVE' as const,
    },
    {
      id: 'protest-2',
      date: '2023-12-15T00:00:00Z',
      value: 890.00,
      creditor: 'Financeira XYZ Ltda.',
      notaryOffice: '2º Cartório de Protestos',
      city: 'Rio de Janeiro',
      state: 'RJ',
      protocol: 'PR2023005678',
      status: 'PAID' as const,
    }
  ],
  summary: 'Encontrado(s) 2 protesto(s) para o documento consultado.'
}

// Mock protest query result without protests (clean)
const mockCleanResult = {
  queryId: 'query-456',
  documentSearched: '111.444.777-31',
  documentType: 'CPF' as const,
  name: 'Maria Silva',
  searchDate: '2024-01-15T10:00:00Z',
  status: 'COMPLETED',
  totalProtests: 0,
  protests: [],
  summary: 'Nenhum protesto encontrado para o documento consultado.'
}

describe('ProtestResults', () => {
  const mockOnRequestCertificate = jest.fn()
  const mockOnNewQuery = jest.fn()

  // Mock DOM methods for PDF download
  const mockCreateElement = jest.fn()
  const mockAppendChild = jest.fn()
  const mockRemoveChild = jest.fn()
  const mockClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock document methods
    const mockElement = {
      href: '',
      download: '',
      click: mockClick
    }
    
    mockCreateElement.mockReturnValue(mockElement)
    Object.defineProperty(document, 'createElement', {
      writable: true,
      value: mockCreateElement
    })
    Object.defineProperty(document.body, 'appendChild', {
      writable: true,
      value: mockAppendChild
    })
    Object.defineProperty(document.body, 'removeChild', {
      writable: true,
      value: mockRemoveChild
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Results with Protests', () => {
    it('should display protest results correctly', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      // Header information
      expect(screen.getByText('Consulta de Protesto')).toBeInTheDocument()
      expect(screen.getByText('111.444.777-35')).toBeInTheDocument()
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('CPF')).toBeInTheDocument()
      expect(screen.getByText('15/01/2024')).toBeInTheDocument()

      // Summary
      expect(screen.getByText('Protestos Encontrados')).toBeInTheDocument()
      expect(screen.getByText('Encontrado(s) 2 protesto(s) para o documento consultado.')).toBeInTheDocument()
      expect(screen.getByText('Total: 2 protesto(s)')).toBeInTheDocument()

      // Protest details
      expect(screen.getByText('Detalhes dos Protestos')).toBeInTheDocument()
      expect(screen.getByText('Protesto #1')).toBeInTheDocument()
      expect(screen.getByText('Protesto #2')).toBeInTheDocument()
    })

    it('should display protest details correctly', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      // First protest details
      expect(screen.getByText('R$ 1.250,50')).toBeInTheDocument()
      expect(screen.getByText('10/01/2024')).toBeInTheDocument()
      expect(screen.getByText('Banco Exemplo S.A.')).toBeInTheDocument()
      expect(screen.getByText('1º Cartório de Protestos')).toBeInTheDocument()
      expect(screen.getByText('São Paulo/SP')).toBeInTheDocument()
      expect(screen.getByText('PR2024001234')).toBeInTheDocument()

      // Second protest details
      expect(screen.getByText('R$ 890,00')).toBeInTheDocument()
      expect(screen.getByText('15/12/2023')).toBeInTheDocument()
      expect(screen.getByText('Financeira XYZ Ltda.')).toBeInTheDocument()
      expect(screen.getByText('2º Cartório de Protestos')).toBeInTheDocument()
      expect(screen.getByText('Rio de Janeiro/RJ')).toBeInTheDocument()
      expect(screen.getByText('PR2023005678')).toBeInTheDocument()
    })

    it('should display correct status badges', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      expect(screen.getByText('Ativo')).toBeInTheDocument()
      expect(screen.getByText('Quitado')).toBeInTheDocument()
    })

    it('should show positive certificate button for results with protests', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      expect(screen.getByText('Solicitar Certidão Positiva')).toBeInTheDocument()
      expect(screen.getByText('Solicite uma certidão oficial para ter um documento com validade jurídica.')).toBeInTheDocument()
    })
  })

  describe('Clean Results (No Protests)', () => {
    it('should display clean results correctly', () => {
      render(
        <ProtestResults
          result={mockCleanResult}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      // Header information
      expect(screen.getByText('Consulta de Protesto')).toBeInTheDocument()
      expect(screen.getByText('111.444.777-31')).toBeInTheDocument()
      expect(screen.getByText('Maria Silva')).toBeInTheDocument()

      // Clean status
      expect(screen.getByText('Situação Limpa')).toBeInTheDocument()
      expect(screen.getByText('Nenhum protesto encontrado para o documento consultado.')).toBeInTheDocument()

      // Should not show protest details
      expect(screen.queryByText('Detalhes dos Protestos')).not.toBeInTheDocument()
    })

    it('should show negative certificate button for clean results', () => {
      render(
        <ProtestResults
          result={mockCleanResult}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      expect(screen.getByText('Solicitar Certidão Negativa')).toBeInTheDocument()
      expect(screen.getByText('Solicite uma certidão negativa oficial para comprovar a situação limpa.')).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should call onRequestCertificate when certificate button is clicked', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      const certificateButton = screen.getByText('Solicitar Certidão Positiva')
      fireEvent.click(certificateButton)

      expect(mockOnRequestCertificate).toHaveBeenCalledTimes(1)
    })

    it('should call onNewQuery when new query button is clicked', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      const newQueryButton = screen.getByText('Fazer Nova Consulta')
      fireEvent.click(newQueryButton)

      expect(mockOnNewQuery).toHaveBeenCalledTimes(1)
    })

    it('should handle PDF download successfully', async () => {
      mockFetch(mockPDFResponse)

      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      const downloadButton = screen.getByText('Baixar PDF')
      fireEvent.click(downloadButton)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Gerando PDF...')).toBeInTheDocument()
      })

      // Should call PDF generation API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/pdf/generate', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(mockResultWithProtests.queryId)
        }))
      })

      // Should create download link and trigger download
      await waitFor(() => {
        expect(mockCreateElement).toHaveBeenCalledWith('a')
        expect(mockAppendChild).toHaveBeenCalled()
        expect(mockClick).toHaveBeenCalled()
        expect(mockRemoveChild).toHaveBeenCalled()
      })

      // Should return to normal state
      await waitFor(() => {
        expect(screen.getByText('Baixar PDF')).toBeInTheDocument()
        expect(screen.queryByText('Gerando PDF...')).not.toBeInTheDocument()
      })
    })

    it('should handle PDF download errors', async () => {
      const errorResponse = {
        success: false,
        error: 'Falha na geração do PDF'
      }
      mockFetch(errorResponse, { status: 500, ok: false })

      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      const downloadButton = screen.getByText('Baixar PDF')
      fireEvent.click(downloadButton)

      await waitFor(() => {
        expect(screen.getByText('Erro: Falha ao gerar PDF')).toBeInTheDocument()
      })

      // Should return to normal state
      expect(screen.getByText('Baixar PDF')).toBeInTheDocument()
      expect(downloadButton).not.toBeDisabled()
    })

    it('should handle network errors during PDF download', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      const downloadButton = screen.getByText('Baixar PDF')
      fireEvent.click(downloadButton)

      await waitFor(() => {
        expect(screen.getByText('Erro: Network error')).toBeInTheDocument()
      })
    })

    it('should disable download button while generating PDF', async () => {
      // Mock a delayed response
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockPDFResponse)
        }), 100))
      )

      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      const downloadButton = screen.getByText('Baixar PDF')
      fireEvent.click(downloadButton)

      // Should be disabled while loading
      expect(downloadButton).toBeDisabled()
      expect(screen.getByText('Gerando PDF...')).toBeInTheDocument()
    })
  })

  describe('Formatting and Display', () => {
    it('should format currency correctly', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      expect(screen.getByText('R$ 1.250,50')).toBeInTheDocument()
      expect(screen.getByText('R$ 890,00')).toBeInTheDocument()
    })

    it('should format dates correctly', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      // Search date
      expect(screen.getByText('15/01/2024')).toBeInTheDocument()
      
      // Protest dates
      expect(screen.getByText('10/01/2024')).toBeInTheDocument()
      expect(screen.getByText('15/12/2023')).toBeInTheDocument()
    })

    it('should handle different status types', () => {
      const resultWithCancelledProtest = {
        ...mockResultWithProtests,
        protests: [
          {
            ...mockResultWithProtests.protests[0],
            status: 'CANCELLED' as const
          }
        ]
      }

      render(
        <ProtestResults
          result={resultWithCancelledProtest}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      expect(screen.getByText('Cancelado')).toBeInTheDocument()
    })

    it('should handle unknown status gracefully', () => {
      const resultWithUnknownStatus = {
        ...mockResultWithProtests,
        protests: [
          {
            ...mockResultWithProtests.protests[0],
            status: 'UNKNOWN' as any
          }
        ]
      }

      render(
        <ProtestResults
          result={resultWithUnknownStatus}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      // Should default to 'Ativo' for unknown status
      expect(screen.getByText('Ativo')).toBeInTheDocument()
    })
  })

  describe('Responsive Design and Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      // Check for proper headings hierarchy
      expect(screen.getByRole('heading', { name: 'Consulta de Protesto' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Detalhes dos Protestos' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Próximos Passos' })).toBeInTheDocument()
    })

    it('should have accessible buttons', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    it('should display important notice', () => {
      render(
        <ProtestResults
          result={mockResultWithProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      expect(screen.getByText(/Esta consulta foi realizada em 15\/01\/2024/)).toBeInTheDocument()
      expect(screen.getByText(/Para informações mais atuais, recomendamos fazer uma nova consulta/)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle result without callback functions', () => {
      expect(() => {
        render(<ProtestResults result={mockCleanResult} />)
      }).not.toThrow()

      expect(screen.getByText('Situação Limpa')).toBeInTheDocument()
    })

    it('should handle empty protests array correctly', () => {
      const resultWithEmptyProtests = {
        ...mockResultWithProtests,
        totalProtests: 0,
        protests: []
      }

      render(
        <ProtestResults
          result={resultWithEmptyProtests}
          onRequestCertificate={mockOnRequestCertificate}
          onNewQuery={mockOnNewQuery}
        />
      )

      expect(screen.getByText('Situação Limpa')).toBeInTheDocument()
      expect(screen.queryByText('Detalhes dos Protestos')).not.toBeInTheDocument()
    })

    it('should handle malformed date strings', () => {
      const resultWithBadDate = {
        ...mockResultWithProtests,
        searchDate: 'invalid-date'
      }

      expect(() => {
        render(
          <ProtestResults
            result={resultWithBadDate}
            onRequestCertificate={mockOnRequestCertificate}
            onNewQuery={mockOnNewQuery}
          />
        )
      }).not.toThrow()
    })
  })
})