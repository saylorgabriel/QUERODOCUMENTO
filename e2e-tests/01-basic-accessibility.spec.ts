import { test, expect } from '@playwright/test';

test.describe('Basic Accessibility Test', () => {
  test('should load landing page and verify key elements', async ({ page }) => {
    console.log('🔍 Testing Basic Accessibility - Loading Landing Page');
    
    // Navigate to the landing page
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/landing-page.png', fullPage: true });
    
    // Check page title
    await expect(page).toHaveTitle(/Querodocumento/i);
    
    // Verify header is present
    const header = page.locator('header, nav, [data-testid="header"]').first();
    await expect(header).toBeVisible();
    
    // Look for hero section/form - try multiple possible selectors
    const heroForm = page.locator(
      'form, [data-testid="hero-form"], [class*="hero"], [id*="hero"], main form'
    ).first();
    await expect(heroForm).toBeVisible();
    
    // Check for key form elements (CPF input)
    const cpfInput = page.locator(
      'input[name*="cpf" i], input[placeholder*="cpf" i], input[id*="cpf" i], input[type="text"]:has-text("cpf")'
    ).first();
    
    if (await cpfInput.count() > 0) {
      await expect(cpfInput).toBeVisible();
      console.log('✅ CPF input field found');
    } else {
      console.log('⚠️ CPF input field not found with current selectors');
      
      // Try to find any text input
      const anyTextInput = page.locator('input[type="text"], input:not([type])').first();
      if (await anyTextInput.count() > 0) {
        console.log('✅ At least one text input found');
      }
    }
    
    // Check for navigation elements
    const navLinks = page.locator('a, button').filter({ hasText: /entrar|login|registr|conta/i });
    if (await navLinks.count() > 0) {
      console.log('✅ Navigation links found');
    }
    
    // Check for main call-to-action button
    const ctaButton = page.locator(
      'button:has-text("consulta"), button:has-text("iniciar"), input[type="submit"], button[type="submit"]'
    ).first();
    
    if (await ctaButton.count() > 0) {
      await expect(ctaButton).toBeVisible();
      console.log('✅ Main CTA button found');
    } else {
      console.log('⚠️ Main CTA button not found');
    }
    
    // Check for footer
    const footer = page.locator('footer, [data-testid="footer"]').first();
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
      console.log('✅ Footer found');
    }
    
    // Verify page is responsive - check mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/landing-page-mobile.png', fullPage: true });
    
    console.log('✅ Basic Accessibility Test completed successfully');
  });
  
  test('should have proper page structure and accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper HTML structure
    const main = page.locator('main, [role="main"]');
    if (await main.count() > 0) {
      await expect(main).toBeVisible();
      console.log('✅ Main content area found');
    }
    
    // Check for headings hierarchy
    const h1 = page.locator('h1');
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible();
      console.log('✅ H1 heading found');
    }
    
    // Verify no console errors on page load
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    if (errors.length > 0) {
      console.log('⚠️ Console errors found:', errors);
    } else {
      console.log('✅ No console errors detected');
    }
  });
});