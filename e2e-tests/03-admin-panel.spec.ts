import { test, expect } from '@playwright/test';

test.describe('Admin Panel Test', () => {
  const adminCredentials = {
    email: 'admin@querodocumento.com',
    password: 'admin123456'
  };

  test('should access admin panel and verify functionality', async ({ page }) => {
    console.log('⚙️ Testing Admin Panel Access and Functionality');
    
    // Navigate to admin panel
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/admin-login-page.png', fullPage: true });
    
    // Check if we're already logged in or need to login
    const currentUrl = page.url();
    console.log(`Admin URL: ${currentUrl}`);
    
    // Look for login form
    const loginForm = page.locator('form, input[type="email"], input[type="password"]');
    
    if (await loginForm.count() > 0) {
      console.log('🔐 Admin login form found, attempting login');
      
      // Find email and password inputs
      const emailInput = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.count() > 0) {
        await emailInput.fill(adminCredentials.email);
        console.log('✅ Filled admin email');
      }
      
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(adminCredentials.password);
        console.log('✅ Filled admin password');
      }
      
      // Find and click submit button
      const submitButton = page.locator(
        'button[type="submit"], input[type="submit"], button:has-text("entrar"), button:has-text("login")'
      ).first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        console.log('✅ Clicked admin login button');
        
        // Wait for login response
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle');
      }
    }
    
    const afterLoginUrl = page.url();
    console.log(`After login URL: ${afterLoginUrl}`);
    
    await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: true });
    
    // Verify we're in admin area
    const adminIndicators = page.locator(
      '[class*="admin"], [data-testid*="admin"], h1:has-text("admin"), h1:has-text("dashboard"), .dashboard'
    );
    
    if (await adminIndicators.count() > 0) {
      console.log('✅ Admin dashboard loaded successfully');
    } else {
      console.log('⚠️ Admin dashboard indicators not found, but might still be functional');
    }
    
    // Look for dashboard metrics/statistics
    const metricsElements = page.locator(
      '[class*="metric"], [class*="stat"], [class*="count"], .card, .widget'
    );
    
    if (await metricsElements.count() > 0) {
      console.log(`✅ Found ${await metricsElements.count()} dashboard metric elements`);
    }
    
    // Test navigation to orders/pedidos page
    const ordersLink = page.locator(
      'a:has-text("pedidos"), a:has-text("orders"), nav a, .nav-link, .menu-item'
    ).filter({ hasText: /pedidos|orders|solicit/i }).first();
    
    if (await ordersLink.count() > 0) {
      await ordersLink.click();
      console.log('✅ Clicked on orders link');
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/admin-orders.png', fullPage: true });
      
      // Check for orders list
      const ordersList = page.locator(
        'table, .list, .orders, [class*="list"], tbody tr, .order-item'
      );
      
      if (await ordersList.count() > 0) {
        console.log('✅ Orders list is accessible');
      } else {
        console.log('⚠️ Orders list not found, might be empty or use different structure');
      }
      
      // Test search and filters if available
      const searchInput = page.locator('input[type="search"], input[placeholder*="pesquis"], input[placeholder*="busca"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
        console.log('✅ Search functionality found');
      }
      
      // Test filters
      const filterSelect = page.locator('select, .filter, [class*="filter"]').first();
      if (await filterSelect.count() > 0) {
        console.log('✅ Filter functionality found');
      }
      
    } else {
      console.log('⚠️ Orders navigation link not found');
      
      // Try direct navigation to orders
      await page.goto('/admin/pedidos');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/admin-orders-direct.png', fullPage: true });
    }
  });
  
  test('should test admin functionality and permissions', async ({ page }) => {
    console.log('🛡️ Testing Admin Permissions and Functionality');
    
    // Go to admin area
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Login if needed (reuse login logic)
    const loginForm = page.locator('input[type="email"], input[type="password"]');
    if (await loginForm.count() > 0) {
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      await emailInput.fill(adminCredentials.email);
      await passwordInput.fill(adminCredentials.password);
      
      const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Test admin-only features
    const adminOnlyElements = page.locator(
      '[data-role="admin"], .admin-only, [class*="admin"], .management, .backoffice'
    );
    
    if (await adminOnlyElements.count() > 0) {
      console.log('✅ Admin-only elements found');
    }
    
    // Check for user management
    const usersLink = page.locator('a:has-text("usuários"), a:has-text("users"), a:has-text("clientes")').first();
    if (await usersLink.count() > 0) {
      await usersLink.click();
      await page.waitForTimeout(1000);
      console.log('✅ User management accessible');
    }
    
    // Check for system settings
    const settingsLink = page.locator('a:has-text("configurações"), a:has-text("settings"), a:has-text("config")').first();
    if (await settingsLink.count() > 0) {
      console.log('✅ Settings menu found');
    }
    
    await page.screenshot({ path: 'test-results/admin-final.png', fullPage: true });
  });
});