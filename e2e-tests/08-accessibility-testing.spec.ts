import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

/**
 * Accessibility E2E Tests
 * Tests WCAG 2.1 compliance and accessibility features
 */

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test('should pass accessibility audit on landing page', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation through main elements
    await page.keyboard.press('Tab')
    let focused = await page.locator(':focus').getAttribute('name')
    expect(focused).toBe('document')
    
    await page.keyboard.press('Tab')
    focused = await page.locator(':focus').getAttribute('name')
    expect(focused).toBe('documentType')
    
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toHaveAttribute('type', 'submit')
    
    // Test Enter key submission
    await page.keyboard.press('Enter')
    await expect(page.locator('text=Faça seu cadastro')).toBeVisible()
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check main form has proper labels
    await expect(page.locator('label[for="document"]')).toBeVisible()
    await expect(page.locator('input[name="document"]')).toHaveAttribute('aria-describedby')
    
    // Check select has proper label
    await expect(page.locator('label[for="documentType"]')).toBeVisible()
    await expect(page.locator('select[name="documentType"]')).toHaveAttribute('aria-label')
    
    // Check submit button has accessible name
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toHaveAttribute('aria-label')
    
    // Check error messages have proper roles
    await page.fill('input[name="document"]', '123')
    await page.click('button[type="submit"]')
    
    const errorMessage = page.locator('[role="alert"]').first()
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toHaveAttribute('aria-live', 'polite')
  })

  test('should support screen reader announcements', async ({ page }) => {
    // Check page title for screen readers
    await expect(page).toHaveTitle(/Consulta de Protestos/)
    
    // Check heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const h2Elements = page.locator('h2')
    const h2Count = await h2Elements.count()
    expect(h2Count).toBeGreaterThan(0)
    
    // Check landmark regions
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    
    // Check form has proper fieldset/legend if applicable
    const fieldset = page.locator('fieldset')
    if (await fieldset.count() > 0) {
      await expect(fieldset.first().locator('legend')).toBeVisible()
    }
  })

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background-color: black !important;
            color: white !important;
            border-color: white !important;
          }
        }
      `
    })
    
    await page.emulateMedia({ colorScheme: 'dark' })
    
    // Elements should still be visible and functional
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('input[name="document"]')).toBeVisible()
    
    // Form should still work
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Faça seu cadastro')).toBeVisible()
  })

  test('should support reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.addStyleTag({
      content: `
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `
    })
    
    // Page should still function without animations
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.click('button[type="submit"]')
    
    // Content should appear without animation delays
    await expect(page.locator('text=Faça seu cadastro')).toBeVisible({ timeout: 1000 })
  })

  test('should handle text scaling up to 200%', async ({ page }) => {
    // Simulate 200% text scaling
    await page.addStyleTag({
      content: `
        html {
          font-size: 200% !important;
        }
      `
    })
    
    // Content should still be readable and functional
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('input[name="document"]')).toBeVisible()
    
    // Form should still be usable
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.selectOption('select[name="documentType"]', 'CPF')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Faça seu cadastro')).toBeVisible()
  })

  test('should have sufficient color contrast', async ({ page }) => {
    // Check color contrast using axe-core
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
    
    // Additional manual checks for critical elements
    const textElement = page.locator('h1')
    const computedStyle = await textElement.evaluate(el => {
      const style = window.getComputedStyle(el)
      return {
        color: style.color,
        backgroundColor: style.backgroundColor
      }
    })
    
    // Should have contrast information (actual contrast calculation would need more complex setup)
    expect(computedStyle.color).toBeTruthy()
  })

  test('should provide alternative text for images', async ({ page }) => {
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      const ariaLabel = await image.getAttribute('aria-label')
      const role = await image.getAttribute('role')
      
      // Images should have alt text, aria-label, or be marked as decorative
      expect(
        alt !== null || ariaLabel !== null || role === 'presentation'
      ).toBeTruthy()
    }
  })

  test('should support focus indicators', async ({ page }) => {
    // Test that focused elements have visible focus indicators
    const focusableElements = page.locator('input, button, select, a[href]')
    const elementCount = await focusableElements.count()
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) { // Test first 5 elements
      const element = focusableElements.nth(i)
      await element.focus()
      
      // Check if element has focus styles
      const focusStyle = await element.evaluate(el => {
        const style = window.getComputedStyle(el, ':focus')
        return {
          outline: style.outline,
          boxShadow: style.boxShadow,
          border: style.border
        }
      })
      
      // Should have some form of focus indicator
      expect(
        focusStyle.outline !== 'none' ||
        focusStyle.boxShadow !== 'none' ||
        focusStyle.border !== 'none'
      ).toBeTruthy()
    }
  })

  test('should handle form errors accessibly', async ({ page }) => {
    // Submit invalid form
    await page.click('button[type="submit"]')
    
    // Error messages should be announced to screen readers
    const errorElements = page.locator('[role="alert"], .error-message')
    const errorCount = await errorElements.count()
    
    expect(errorCount).toBeGreaterThan(0)
    
    // First error should have focus or be announced
    const firstError = errorElements.first()
    await expect(firstError).toBeVisible()
    
    // Error should be associated with form field
    const errorId = await firstError.getAttribute('id')
    if (errorId) {
      const associatedInput = page.locator(`[aria-describedby*="${errorId}"]`)
      await expect(associatedInput).toBeVisible()
    }
  })

  test('should work with screen reader simulation', async ({ page }) => {
    // Simulate screen reader behavior by checking text content order
    const pageText = await page.textContent('body')
    
    // Important content should appear in logical order
    expect(pageText).toMatch(/Consulta.*Protestos.*CPF.*CNPJ.*Consultar/s)
    
    // Check that hidden content is not exposed to screen readers
    const hiddenElements = page.locator('[aria-hidden="true"]')
    const hiddenCount = await hiddenElements.count()
    
    for (let i = 0; i < hiddenCount; i++) {
      const hiddenElement = hiddenElements.nth(i)
      const isVisible = await hiddenElement.isVisible()
      
      // Elements marked as aria-hidden should not be visible or should be decorative
      if (isVisible) {
        const role = await hiddenElement.getAttribute('role')
        expect(role === 'presentation' || role === 'img').toBeTruthy()
      }
    }
  })

  test('should support voice control patterns', async ({ page }) => {
    // Test that voice control can identify clickable elements
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const title = await button.getAttribute('title')
      
      // Buttons should have identifiable text for voice commands
      expect(
        (text && text.trim().length > 0) ||
        (ariaLabel && ariaLabel.length > 0) ||
        (title && title.length > 0)
      ).toBeTruthy()
    }
    
    // Links should have descriptive text
    const links = page.locator('a[href]')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      
      // Links should not have generic text like "click here"
      expect(
        text && !text.match(/click here|here|more|link/i) ||
        ariaLabel && ariaLabel.length > 0
      ).toBeTruthy()
    }
  })

  test('should provide skip navigation links', async ({ page }) => {
    // Check for skip links at the beginning of the page
    await page.keyboard.press('Tab')
    
    const firstFocused = page.locator(':focus')
    const href = await firstFocused.getAttribute('href')
    const text = await firstFocused.textContent()
    
    // First focusable element might be a skip link
    if (href && href.startsWith('#')) {
      expect(text).toMatch(/skip|main|content/i)
      
      // Skip link should work
      await firstFocused.click()
      const targetElement = page.locator(href)
      await expect(targetElement).toBeVisible()
    }
  })

  test('should handle dynamic content accessibly', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@querodocumento.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    await page.goto('/consulta')
    
    // Test loading state
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.click('button[text="Consultar"]')
    
    // Loading state should be announced
    const loadingElement = page.locator('[role="status"], .loading')
    if (await loadingElement.count() > 0) {
      await expect(loadingElement.first()).toHaveAttribute('aria-live')
    }
    
    // Result should be announced when ready
    await expect(page.locator('[data-testid="consultation-result"]')).toBeVisible()
    
    const resultElement = page.locator('[role="status"], [aria-live]').last()
    if (await resultElement.count() > 0) {
      await expect(resultElement).toBeVisible()
    }
  })
})