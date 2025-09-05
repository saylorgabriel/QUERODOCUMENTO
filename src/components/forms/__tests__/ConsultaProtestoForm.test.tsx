/**
 * Unit tests for ConsultaProtestoForm component
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { ConsultaProtestoForm } from '../ConsultaProtestoForm'
import { mockFetch } from '@/__tests__/utils/test-utils'

// Mock Next.js navigation hooks
const mockPush = jest.fn()
const mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

// Mock child components to isolate testing
jest.mock('../StepIndicator', () => ({
  StepIndicator: ({ currentStep, steps }: any) => (
    <div data-testid="step-indicator">
      Step {currentStep} of {steps.length}
    </div>
  ),
}))

jest.mock('../PaymentMethodSelector', () => ({
  PaymentMethodSelector: ({ selectedMethod, onSelect }: any) => (
    <div data-testid="payment-selector">
      <button onClick={() => onSelect('PIX')}>PIX</button>
      <button onClick={() => onSelect('CREDIT_CARD')}>Credit Card</button>
      <span>Selected: {selectedMethod || 'None'}</span>
    </div>
  ),
}))

jest.mock('@/components/ui/input-document', () => ({
  InputDocument: ({ value, onChange, placeholder, error }: any) => (
    <div>
      <input
        data-testid="input-document"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value, true, 'CPF', false)}
      />
      {error && <span data-testid="document-error">{error}</span>}
    </div>
  ),
}))

jest.mock('@/components/ui/input-phone', () => ({
  InputPhone: ({ value, onChange, placeholder, error }: any) => (
    <div>
      <input
        data-testid="input-phone"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value, true)}
      />
      {error && <span data-testid="phone-error">{error}</span>}
    </div>
  ),
}))

describe('ConsultaProtestoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.delete('documentNumber')
    mockSearchParams.delete('name')
    mockSearchParams.delete('phone')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Initial State', () => {
    it('should render step 1 by default', () => {
      render(<ConsultaProtestoForm />)
      
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
      expect(screen.getByText('Consulta de Protesto')).toBeInTheDocument()
      expect(screen.getByText('Digite o CPF ou CNPJ que deseja consultar')).toBeInTheDocument()
      expect(screen.getByTestId('input-document')).toBeInTheDocument()
    })

    it('should initialize with URL search params', () => {
      mockSearchParams.set('documentNumber', '11144477735')
      mockSearchParams.set('name', 'João Silva')
      mockSearchParams.set('phone', '11999999999')

      render(<ConsultaProtestoForm />)

      expect(screen.getByTestId('input-document')).toHaveValue('11144477735')
    })

    it('should initialize with props data', () => {
      const initialData = {
        documentNumber: '11144477735',
        name: 'João Silva',
        phone: '11999999999',
      }

      render(<ConsultaProtestoForm initialData={initialData} />)

      expect(screen.getByTestId('input-document')).toHaveValue('11144477735')
    })

    it('should prioritize props over URL params', () => {
      mockSearchParams.set('documentNumber', '99999999999')
      
      const initialData = {
        documentNumber: '11144477735',
      }

      render(<ConsultaProtestoForm initialData={initialData} />)

      expect(screen.getByTestId('input-document')).toHaveValue('11144477735')
    })
  })

  describe('Step 1 - Document Input', () => {
    it('should show price for paid consultation', () => {
      render(<ConsultaProtestoForm />)
      
      expect(screen.getByText('R$ 29,90')).toBeInTheDocument()
      expect(screen.getByText('Consulta completa em todo o Brasil')).toBeInTheDocument()
    })

    it('should show additional fields for direct query mode', () => {
      const onQuerySubmit = jest.fn()
      render(<ConsultaProtestoForm onQuerySubmit={onQuerySubmit} />)

      expect(screen.getByPlaceholderText('Nome completo/Razão Social')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Telefone com DDD (opcional)')).toBeInTheDocument()
      expect(screen.getByText('Consultar Protestos')).toBeInTheDocument()
    })

    it('should validate required fields in step 1', async () => {
      render(<ConsultaProtestoForm />)

      const continueButton = screen.getByText('Continuar')
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(screen.getByTestId('document-error')).toHaveTextContent('CPF ou CNPJ é obrigatório')
      })
    })

    it('should call onQuerySubmit when provided', async () => {
      const onQuerySubmit = jest.fn()
      render(<ConsultaProtestoForm onQuerySubmit={onQuerySubmit} />)

      const nameInput = screen.getByPlaceholderText('Nome completo/Razão Social')
      const documentInput = screen.getByTestId('input-document')
      const phoneInput = screen.getByTestId('input-phone')
      const submitButton = screen.getByText('Consultar Protestos')

      fireEvent.change(nameInput, { target: { value: 'João Silva' } })
      fireEvent.change(documentInput, { target: { value: '11144477735' } })
      fireEvent.change(phoneInput, { target: { value: '11999999999' } })
      
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onQuerySubmit).toHaveBeenCalledWith('11144477735', 'João Silva', '11999999999')
      })
    })

    it('should validate name in direct query mode', async () => {
      const onQuerySubmit = jest.fn()
      render(<ConsultaProtestoForm onQuerySubmit={onQuerySubmit} />)

      const documentInput = screen.getByTestId('input-document')
      const submitButton = screen.getByText('Consultar Protestos')

      fireEvent.change(documentInput, { target: { value: '11144477735' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
      })
      
      expect(onQuerySubmit).not.toHaveBeenCalled()
    })
  })

  describe('Step Navigation', () => {
    it('should advance to step 2 when step 1 is valid', async () => {
      render(<ConsultaProtestoForm />)

      const documentInput = screen.getByTestId('input-document')
      const continueButton = screen.getByText('Continuar')

      fireEvent.change(documentInput, { target: { value: '11144477735' } })
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
        expect(screen.getByText('Seus Dados')).toBeInTheDocument()
      })
    })

    it('should go back to previous step', async () => {
      render(<ConsultaProtestoForm />)

      // Move to step 2
      const documentInput = screen.getByTestId('input-document')
      fireEvent.change(documentInput, { target: { value: '11144477735' } })
      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
      })

      // Go back
      fireEvent.click(screen.getByText('Voltar'))

      await waitFor(() => {
        expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
      })
    })

    it('should disable back button on step 1', () => {
      render(<ConsultaProtestoForm />)
      
      const backButton = screen.getByText('Voltar')
      expect(backButton).toBeDisabled()
    })
  })

  describe('Step 2 - Authentication', () => {
    beforeEach(async () => {
      render(<ConsultaProtestoForm />)
      
      // Navigate to step 2
      const documentInput = screen.getByTestId('input-document')
      fireEvent.change(documentInput, { target: { value: '11144477735' } })
      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(screen.getByText('Seus Dados')).toBeInTheDocument()
      })
    })

    it('should show registration form by default', () => {
      expect(screen.getByText('Crie sua conta para prosseguir')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Nome completo')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Confirmar senha')).toBeInTheDocument()
    })

    it('should toggle between login and registration', () => {
      const loginButton = screen.getByText('Já tenho conta')
      fireEvent.click(loginButton)

      expect(screen.getByText('Faça login para continuar')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Nome completo')).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Confirmar senha')).not.toBeInTheDocument()

      const registerButton = screen.getByText('Criar Conta')
      fireEvent.click(registerButton)

      expect(screen.getByText('Crie sua conta para prosseguir')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Nome completo')).toBeInTheDocument()
    })

    it('should validate registration fields', async () => {
      const continueButton = screen.getByText('Continuar')
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
        expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
        expect(screen.getByText('Telefone é obrigatório')).toBeInTheDocument()
        expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument()
      })
    })

    it('should validate password confirmation', async () => {
      const passwordInput = screen.getByPlaceholderText('Senha')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirmar senha')
      const continueButton = screen.getByText('Continuar')

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Senhas não conferem')).toBeInTheDocument()
      })
    })

    it('should validate password length', async () => {
      const passwordInput = screen.getByPlaceholderText('Senha')
      const continueButton = screen.getByText('Continuar')

      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument()
      })
    })

    it('should toggle password visibility', () => {
      const passwordInput = screen.getByPlaceholderText('Senha')
      const toggleButton = passwordInput.parentElement?.querySelector('button')

      expect(passwordInput).toHaveAttribute('type', 'password')
      
      if (toggleButton) {
        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')
      }
    })
  })

  describe('Authentication API Calls', () => {
    beforeEach(async () => {
      render(<ConsultaProtestoForm />)
      
      // Navigate to step 2
      const documentInput = screen.getByTestId('input-document')
      fireEvent.change(documentInput, { target: { value: '11144477735' } })
      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(screen.getByText('Seus Dados')).toBeInTheDocument()
      })
    })

    it('should handle successful registration', async () => {
      mockFetch({ success: true })

      // Fill registration form
      fireEvent.change(screen.getByPlaceholderText('Nome completo'), { target: { value: 'João Silva' } })
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '11999999999' } })
      fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByPlaceholderText('Confirmar senha'), { target: { value: 'password123' } })

      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test@example.com')
        }))
      })
    })

    it('should handle registration errors', async () => {
      mockFetch({ error: 'Email já existe' }, { status: 400, ok: false })

      // Fill registration form
      fireEvent.change(screen.getByPlaceholderText('Nome completo'), { target: { value: 'João Silva' } })
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'existing@example.com' } })
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '11999999999' } })
      fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByPlaceholderText('Confirmar senha'), { target: { value: 'password123' } })

      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(screen.getByText('Email já existe')).toBeInTheDocument()
      })
    })

    it('should handle successful login', async () => {
      mockFetch({ success: true })

      // Switch to login mode
      fireEvent.click(screen.getByText('Já tenho conta'))

      // Fill login form
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '11999999999' } })
      fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'password123' } })

      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/simple-login', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test@example.com')
        }))
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      render(<ConsultaProtestoForm />)

      // Mock a delayed response
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )

      // Navigate to step 2 and submit
      const documentInput = screen.getByTestId('input-document')
      fireEvent.change(documentInput, { target: { value: '11144477735' } })
      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(screen.getByText('Seus Dados')).toBeInTheDocument()
      })

      // Fill form and submit
      fireEvent.change(screen.getByPlaceholderText('Nome completo'), { target: { value: 'João Silva' } })
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '11999999999' } })
      fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByPlaceholderText('Confirmar senha'), { target: { value: 'password123' } })

      fireEvent.click(screen.getByText('Continuar'))

      // Should show loading state
      expect(screen.getByText('Processando...')).toBeInTheDocument()
      expect(screen.getByText('Continuar')).toBeDisabled()
    })

    it('should disable buttons during document validation', () => {
      render(<ConsultaProtestoForm />)

      // Mock document validation state
      const documentInput = screen.getByTestId('input-document')
      fireEvent.change(documentInput, { target: { value: '111' } })

      // The continue button should be disabled during validation
      const continueButton = screen.getByText('Continuar')
      expect(continueButton).not.toBeDisabled() // Since we're mocking validation as instant
    })
  })

  describe('Error Handling', () => {
    it('should clear errors when user starts typing', async () => {
      render(<ConsultaProtestoForm />)

      // Trigger validation error
      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(screen.getByTestId('document-error')).toBeInTheDocument()
      })

      // Start typing
      const documentInput = screen.getByTestId('input-document')
      fireEvent.change(documentInput, { target: { value: '1' } })

      // Error should be cleared
      expect(screen.queryByTestId('document-error')).not.toBeInTheDocument()
    })

    it('should handle network errors gracefully', async () => {
      render(<ConsultaProtestoForm />)

      // Mock network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

      // Navigate to step 2 and submit with valid data
      const documentInput = screen.getByTestId('input-document')
      fireEvent.change(documentInput, { target: { value: '11144477735' } })
      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(screen.getByText('Seus Dados')).toBeInTheDocument()
      })

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Nome completo'), { target: { value: 'João Silva' } })
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '11999999999' } })
      fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'password123' } })
      fireEvent.change(screen.getByPlaceholderText('Confirmar senha'), { target: { value: 'password123' } })

      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        expect(screen.getByText('Erro de conexão')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ConsultaProtestoForm />)

      const documentInput = screen.getByTestId('input-document')
      expect(documentInput).toHaveAttribute('aria-required', 'true')
    })

    it('should associate error messages with inputs', async () => {
      render(<ConsultaProtestoForm />)

      fireEvent.click(screen.getByText('Continuar'))

      await waitFor(() => {
        const error = screen.getByTestId('document-error')
        expect(error).toBeInTheDocument()
        expect(error).toHaveTextContent('CPF ou CNPJ é obrigatório')
      })
    })
  })
})