import { test, expect, Page } from '@playwright/test'

/**
 * Complete User Journey E2E Tests
 * Tests the entire user experience from landing page to dashboard
 */

test.describe('Complete User Journey', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
  })

  test('should complete full user registration and consultation flow', async () => {
    // Step 1: Visit landing page
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Consulta de Protestos')
    
    // Step 2: Fill consultation form without registration
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.selectOption('select[name="documentType"]', 'CPF')
    await page.click('button[type="submit"]')
    
    // Should prompt for registration
    await expect(page.locator('text=Faça seu cadastro')).toBeVisible()
    
    // Step 3: Register new account
    await page.fill('input[name="name"]', 'João da Silva E2E')
    await page.fill('input[name="email"]', `joao.e2e.${Date.now()}@example.com`)
    await page.fill('input[name="phone"]', '(11) 99999-9999')
    await page.fill('input[name="password"]', 'senha123')
    await page.fill('input[name="confirmPassword"]', 'senha123')
    await page.click('button[text="Criar Conta"]')
    
    // Step 4: Should be redirected to consultation form
    await expect(page.url()).toContain('/consulta')
    await expect(page.locator('text=Bem-vindo, João')).toBeVisible()
    
    // Step 5: Complete consultation
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.click('button[text="Consultar"]')
    
    // Step 6: View results
    await expect(page.locator('[data-testid="consultation-result"]')).toBeVisible()
    await expect(page.locator('text=Consulta realizada')).toBeVisible()
    
    // Step 7: Navigate to dashboard
    await page.click('a[href="/dashboard"]')
    await expect(page.url()).toContain('/dashboard')
    
    // Step 8: Verify consultation appears in history
    await expect(page.locator('[data-testid="consultation-history"]')).toBeVisible()
    await expect(page.locator('text=111.444.777-35')).toBeVisible()
    
    // Step 9: Download PDF (if available)
    const downloadLink = page.locator('a[data-testid="download-pdf"]').first()
    if (await downloadLink.isVisible()) {
      const downloadPromise = page.waitForDownload()
      await downloadLink.click()
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.pdf')
    }
    
    // Step 10: Request certificate
    await page.click('button[text="Solicitar Certidão"]')
    await expect(page.locator('text=Solicitação de Certidão')).toBeVisible()
    
    // Fill certificate request form
    await page.selectOption('select[name="certificateType"]', 'NEGATIVE')
    await page.selectOption('select[name="state"]', 'SP')
    await page.selectOption('select[name="city"]', 'São Paulo')
    await page.fill('textarea[name="reason"]', 'Comprovação para processo licitatório')
    await page.click('button[text="Solicitar"]')
    
    // Step 11: Verify order was created
    await expect(page.locator('text=Pedido criado')).toBeVisible()
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
    
    // Step 12: Check orders in dashboard
    await page.click('a[href="/dashboard"]')
    await page.click('button[text="Pedidos"]')
    await expect(page.locator('[data-testid="order-list"]')).toBeVisible()
    
    // Step 13: Logout
    await page.click('button[aria-label="Menu do usuário"]')
    await page.click('button[text="Sair"]')
    await expect(page.url()).toBe('/')
  })

  test('should handle returning user login flow', async () => {
    // First register a user
    await page.goto('/register')
    const email = `returning.user.${Date.now()}@example.com`
    
    await page.fill('input[name="name"]', 'Maria Returning User')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="cpf"]', '222.555.888-44')
    await page.fill('input[name="phone"]', '(11) 88888-8888')
    await page.fill('input[name="password"]', 'senha123')
    await page.fill('input[name="confirmPassword"]', 'senha123')
    await page.click('button[type="submit"]')
    
    // Logout
    await page.click('button[aria-label="Menu do usuário"]')
    await page.click('button[text="Sair"]')
    
    // Now test login flow
    await page.goto('/login')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', 'senha123')
    await page.click('button[type="submit"]')
    
    // Should be redirected to dashboard
    await expect(page.url()).toContain('/dashboard')
    await expect(page.locator('text=Maria')).toBeVisible()
  })

  test('should handle consultation with existing protests', async () => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@querodocumento.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    // Go to consultation
    await page.goto('/consulta')
    
    // Use a CPF that will return protests (mock data)
    await page.fill('input[name="document"]', '333.666.999-77')
    await page.click('button[text="Consultar"]')
    
    // Should show protest results
    await expect(page.locator('[data-testid="protest-found"]')).toBeVisible()
    await expect(page.locator('text=Protestos encontrados')).toBeVisible()
    
    // Should show protest details
    await expect(page.locator('[data-testid="protest-details"]')).toBeVisible()
    
    // Should offer certificate request
    await expect(page.locator('button[text="Solicitar Certidão"]')).toBeVisible()
  })

  test('should handle mobile responsive experience', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Mobile navigation menu
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible()
    
    // Fill form on mobile
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.selectOption('select[name="documentType"]', 'CPF')
    
    // Should handle mobile form submission
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Faça seu cadastro')).toBeVisible()
    
    // Mobile registration form
    await page.fill('input[name="name"]', 'Mobile User')
    await page.fill('input[name="email"]', `mobile.${Date.now()}@example.com`)
    await page.fill('input[name="cpf"]', '444.777.111-35')
    await page.fill('input[name="phone"]', '(11) 77777-7777')
    await page.fill('input[name="password"]', 'senha123')
    await page.fill('input[name="confirmPassword"]', 'senha123')
    await page.click('button[text="Criar Conta"]')
    
    // Should work on mobile
    await expect(page.url()).toContain('/dashboard')
  })

  test('should handle error scenarios gracefully', async () => {
    await page.goto('/')
    
    // Test invalid CPF
    await page.fill('input[name="document"]', '123.456.789-00')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=CPF inválido')).toBeVisible()
    
    // Test network error simulation
    await page.route('**/api/protest/query', route => {
      route.abort('failed')
    })
    
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Erro na consulta')).toBeVisible()
    
    // Should show retry button
    await expect(page.locator('button[text="Tentar Novamente"]')).toBeVisible()
  })

  test('should handle session expiration', async () => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@querodocumento.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    // Simulate session expiration
    await page.context().clearCookies()
    
    // Try to access protected route
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page.url()).toContain('/login')
    await expect(page.locator('text=Sessão expirada')).toBeVisible()
  })

  test('should handle payment flow', async () => {
    // Login and create order
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@querodocumento.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    // Request certificate to trigger payment flow
    await page.goto('/consulta')
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.click('button[text="Consultar"]')
    await page.click('button[text="Solicitar Certidão"]')
    
    // Fill certificate form
    await page.selectOption('select[name="certificateType"]', 'NEGATIVE')
    await page.selectOption('select[name="state"]', 'SP')
    await page.selectOption('select[name="city"]', 'São Paulo')
    await page.click('button[text="Solicitar"]')
    
    // Should show payment options
    await expect(page.locator('text=Escolha a forma de pagamento')).toBeVisible()
    await expect(page.locator('button[text="PIX"]')).toBeVisible()
    await expect(page.locator('button[text="Cartão de Crédito"]')).toBeVisible()
    
    // Select PIX payment
    await page.click('button[text="PIX"]')
    
    // Should show PIX QR code
    await expect(page.locator('[data-testid="pix-qrcode"]')).toBeVisible()
    await expect(page.locator('text=PIX Copia e Cola')).toBeVisible()
    
    // Should show copy button
    await page.click('button[text="Copiar Código PIX"]')
    await expect(page.locator('text=Código copiado')).toBeVisible()
  })

  test('should provide accessibility navigation', async () => {
    await page.goto('/')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should focus on form elements
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toHaveAttribute('name', 'document')
    
    // Test screen reader labels
    await expect(page.locator('label[for="document"]')).toBeVisible()
    await expect(page.locator('input[name="document"]')).toHaveAttribute('aria-label')
    
    // Test high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('body')).toHaveClass(/dark/)
  })

  test('should handle offline scenarios', async () => {
    await page.goto('/')
    
    // Simulate offline
    await page.context().setOffline(true)
    
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.click('button[type="submit"]')
    
    // Should show offline message
    await expect(page.locator('text=Sem conexão')).toBeVisible()
    await expect(page.locator('text=Tente novamente quando estiver online')).toBeVisible()
    
    // Restore connection
    await page.context().setOffline(false)
    await page.click('button[text="Tentar Novamente"]')
    
    // Should work again
    await expect(page.locator('text=Faça seu cadastro')).toBeVisible()
  })
})