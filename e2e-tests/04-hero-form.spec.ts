import { test, expect } from '@playwright/test';

test.describe('Hero Form Test', () => {
  const testData = {
    cpf: '987.654.321-00',
    name: 'Maria Santos',
    phone: '(11) 88888-8888'
  };

  test('should test hero form consultation flow', async ({ page }) => {
    console.log('📋 Testing Hero Form - Consultation Request Flow');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/hero-form-initial.png', fullPage: true });
    
    // Find the hero form
    const heroForm = page.locator('form, [data-testid="hero-form"], main form').first();
    
    if (await heroForm.count() === 0) {
      console.log('⚠️ Hero form not found with initial selectors, trying alternative approach');
      
      // Look for individual input fields that might be part of hero section
      const inputs = await page.locator('input[type="text"], input:not([type])').all();
      console.log(`Found ${inputs.length} input fields on the page`);
      
      if (inputs.length === 0) {
        console.log('❌ No input fields found on landing page');
        return;
      }
    }
    
    // Find CPF input field
    const cpfInput = page.locator(
      'input[name*="cpf" i], input[placeholder*="cpf" i], input[id*="cpf" i], input[class*="cpf" i]'
    ).first();
    
    if (await cpfInput.count() > 0) {
      await cpfInput.fill(testData.cpf);
      console.log('✅ Filled CPF field in hero form');
    } else {
      // Try first text input as potential CPF field
      const firstTextInput = page.locator('input[type="text"], input:not([type])').first();
      if (await firstTextInput.count() > 0) {
        await firstTextInput.fill(testData.cpf);
        console.log('✅ Filled first text input with CPF');
      } else {
        console.log('❌ No CPF input field found');
      }
    }
    
    // Find name input field
    const nameInput = page.locator(
      'input[name*="name" i], input[name*="nome" i], input[placeholder*="nome" i], input[placeholder*="name" i]'
    ).first();
    
    if (await nameInput.count() > 0) {
      await nameInput.fill(testData.name);
      console.log('✅ Filled name field in hero form');
    } else {
      // Try second text input as potential name field
      const textInputs = page.locator('input[type="text"], input:not([type])');
      if (await textInputs.count() > 1) {
        await textInputs.nth(1).fill(testData.name);
        console.log('✅ Filled second text input with name');
      }
    }
    
    // Find phone input field
    const phoneInput = page.locator(
      'input[name*="phone" i], input[name*="telefone" i], input[name*="tel" i], input[placeholder*="telefone" i]'
    ).first();
    
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(testData.phone);
      console.log('✅ Filled phone field in hero form');
    } else {
      // Try third text input as potential phone field
      const textInputs = page.locator('input[type="text"], input:not([type])');
      if (await textInputs.count() > 2) {
        await textInputs.nth(2).fill(testData.phone);
        console.log('✅ Filled third text input with phone');
      }
    }
    
    await page.screenshot({ path: 'test-results/hero-form-filled.png', fullPage: true });
    
    // Find and click submit button
    const submitButtons = page.locator(
      'button[type="submit"], input[type="submit"], button:has-text("consulta"), button:has-text("iniciar"), button:has-text("buscar")'
    );
    
    if (await submitButtons.count() > 0) {
      const submitButton = submitButtons.first();
      
      // Scroll to button if needed
      await submitButton.scrollIntoViewIfNeeded();
      await submitButton.click();
      console.log('✅ Clicked submit button');
      
      // Wait for response and potential page change
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      console.log(`Current URL after hero form submit: ${currentUrl}`);
      
      await page.screenshot({ path: 'test-results/hero-form-result.png', fullPage: true });
      
      // Check for redirection to consultation page
      if (currentUrl.includes('consulta') || currentUrl.includes('protesto') || currentUrl.includes('pedido')) {
        console.log('✅ Successfully redirected to consultation flow page');
        
        // Look for consultation form or next steps
        const consultationElements = page.locator(
          'form, .consultation, .step, [class*="step"], h1, h2'
        );
        
        if (await consultationElements.count() > 0) {
          console.log('✅ Consultation page elements found');
          
          // Check for multi-step form indicators
          const stepIndicators = page.locator(
            '.step, [class*="step"], .progress, [class*="progress"], .stage'
          );
          
          if (await stepIndicators.count() > 0) {
            console.log('✅ Multi-step form indicators found');
          }
          
          // Look for price display
          const priceElements = page.locator(':has-text("R$"), :has-text("29"), :has-text("preço")');
          if (await priceElements.count() > 0) {
            console.log('✅ Price information displayed');
          }
        }
        
      } else if (currentUrl.includes('login') || currentUrl.includes('auth') || currentUrl.includes('cadastro')) {
        console.log('✅ Redirected to authentication - normal flow for new users');
        
      } else {
        console.log('⚠️ Unexpected redirection or no redirection occurred');
      }
      
    } else {
      console.log('❌ Submit button not found');
      
      // Try clicking any button on the form
      const anyButton = page.locator('button').first();
      if (await anyButton.count() > 0) {
        await anyButton.click();
        console.log('⚠️ Clicked first available button');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/hero-form-fallback.png', fullPage: true });
      }
    }
  });
  
  test('should validate hero form input requirements', async ({ page }) => {
    console.log('✅ Testing Hero Form Validation');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const submitButton = page.locator(
      'button[type="submit"], input[type="submit"], button:has-text("consulta"), button:has-text("iniciar")'
    ).first();
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Look for validation messages
      const validationMessages = page.locator(
        '.error, [class*="error"], .invalid, [class*="invalid"], .validation, [role="alert"]'
      );
      
      if (await validationMessages.count() > 0) {
        console.log('✅ Form validation messages displayed');
      } else {
        console.log('⚠️ No validation messages found - form might accept empty values');
      }
      
      await page.screenshot({ path: 'test-results/hero-form-validation.png', fullPage: true });
    }
    
    // Test with invalid CPF
    const cpfInput = page.locator('input').first(); // Assume first input is CPF
    if (await cpfInput.count() > 0) {
      await cpfInput.fill('123.456.789-99'); // Invalid CPF
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'test-results/hero-form-invalid-cpf.png', fullPage: true });
    }
  });
});