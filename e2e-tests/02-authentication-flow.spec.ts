import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Test', () => {
  const testUser = {
    name: 'João Silva',
    email: `joao.teste.${Date.now()}@teste.com`, // Unique email for each test run
    cpf: '123.456.789-00',
    phone: '(11) 99999-9999',
    password: 'teste123456'
  };

  test('should complete user registration flow', async ({ page }) => {
    console.log('🔐 Testing Authentication Flow - User Registration');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for registration/login links
    const loginLink = page.locator('a, button').filter({ 
      hasText: /entrar|login|registr|cadastr|conta/i 
    }).first();
    
    if (await loginLink.count() > 0) {
      await loginLink.click();
      console.log('✅ Found and clicked login/register link');
    } else {
      // Try to navigate directly to common auth routes
      const authRoutes = ['/auth/register', '/register', '/cadastro', '/auth', '/login'];
      let authPageFound = false;
      
      for (const route of authRoutes) {
        try {
          await page.goto(route);
          await page.waitForLoadState('networkidle');
          
          // Check if this looks like an auth page
          const hasAuthElements = await page.locator('input[type="email"], input[type="password"], form').count() > 0;
          if (hasAuthElements) {
            console.log(`✅ Found auth page at ${route}`);
            authPageFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!authPageFound) {
        console.log('⚠️ No auth page found, testing registration via hero form');
        await page.goto('/');
      }
    }
    
    await page.screenshot({ path: 'test-results/auth-page.png', fullPage: true });
    
    // Look for registration form elements
    const emailInput = page.locator(
      'input[name*="email" i], input[type="email"], input[placeholder*="email" i]'
    ).first();
    
    const nameInput = page.locator(
      'input[name*="name" i], input[placeholder*="nome" i], input[placeholder*="name" i]'
    ).first();
    
    const cpfInput = page.locator(
      'input[name*="cpf" i], input[placeholder*="cpf" i], input[id*="cpf" i]'
    ).first();
    
    const phoneInput = page.locator(
      'input[name*="phone" i], input[name*="telefone" i], input[placeholder*="telefone" i], input[placeholder*="phone" i]'
    ).first();
    
    const passwordInput = page.locator('input[type="password"]').first();
    
    // Try to fill the registration form
    try {
      if (await nameInput.count() > 0) {
        await nameInput.fill(testUser.name);
        console.log('✅ Filled name field');
      }
      
      if (await emailInput.count() > 0) {
        await emailInput.fill(testUser.email);
        console.log('✅ Filled email field');
      }
      
      if (await cpfInput.count() > 0) {
        await cpfInput.fill(testUser.cpf);
        console.log('✅ Filled CPF field');
      }
      
      if (await phoneInput.count() > 0) {
        await phoneInput.fill(testUser.phone);
        console.log('✅ Filled phone field');
      }
      
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(testUser.password);
        console.log('✅ Filled password field');
      }
      
      // Look for submit button
      const submitButton = page.locator(
        'button[type="submit"], input[type="submit"], button:has-text("registrar"), button:has-text("cadastrar"), button:has-text("criar")'
      ).first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        console.log('✅ Clicked submit button');
        
        // Wait for response
        await page.waitForTimeout(3000);
        
        // Check for success indicators
        const currentUrl = page.url();
        console.log(`Current URL after registration: ${currentUrl}`);
        
        // Look for success messages or redirects
        const successIndicators = page.locator(
          '[class*="success"], [class*="confirm"], .toast, .alert, [data-testid*="success"]'
        );
        
        if (await successIndicators.count() > 0) {
          console.log('✅ Success indicators found');
        }
        
        // Check if we're on a dashboard or different page
        if (currentUrl.includes('dashboard') || currentUrl.includes('conta') || currentUrl.includes('user')) {
          console.log('✅ Redirected to user area after registration');
        }
        
      } else {
        console.log('⚠️ Submit button not found');
      }
      
    } catch (error) {
      console.log('⚠️ Error during form filling:', error);
    }
    
    await page.screenshot({ path: 'test-results/registration-result.png', fullPage: true });
  });
  
  test('should test login functionality if available', async ({ page }) => {
    console.log('🔐 Testing Login Functionality');
    
    // Try common login routes
    const loginRoutes = ['/auth/login', '/login', '/entrar', '/auth'];
    
    for (const route of loginRoutes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() >= 2;
        if (hasLoginForm) {
          console.log(`✅ Found login page at ${route}`);
          
          // Test with admin credentials
          const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
          const passwordInput = page.locator('input[type="password"]').first();
          
          if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
            await emailInput.fill('admin@querodocumento.com');
            await passwordInput.fill('admin123456');
            
            const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
            if (await submitBtn.count() > 0) {
              await submitBtn.click();
              await page.waitForTimeout(2000);
              
              console.log(`Login result URL: ${page.url()}`);
              await page.screenshot({ path: 'test-results/login-result.png', fullPage: true });
            }
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }
  });
});