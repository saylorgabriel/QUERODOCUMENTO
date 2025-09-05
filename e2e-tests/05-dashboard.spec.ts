import { test, expect } from '@playwright/test';

test.describe('Dashboard Test', () => {
  test('should test user dashboard functionality', async ({ page }) => {
    console.log('📊 Testing User Dashboard Functionality');
    
    // First try to access dashboard directly
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log(`Dashboard URL: ${currentUrl}`);
    
    // If redirected to login, handle authentication
    if (currentUrl.includes('login') || currentUrl.includes('auth') || currentUrl.includes('entrar')) {
      console.log('🔐 Redirected to login, attempting authentication');
      
      // Try with admin credentials as fallback
      const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill('admin@querodocumento.com');
        await passwordInput.fill('admin123456');
        
        const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForTimeout(2000);
          await page.waitForLoadState('networkidle');
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/dashboard-initial.png', fullPage: true });
    
    // Try alternative dashboard routes
    const dashboardRoutes = ['/dashboard', '/conta', '/user', '/painel', '/minha-conta'];
    let dashboardFound = false;
    
    for (const route of dashboardRoutes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Check if this looks like a dashboard
        const dashboardElements = page.locator(
          '.dashboard, [class*="dashboard"], .user-panel, .account, h1:has-text("dashboard"), h1:has-text("minha conta")'
        );
        
        if (await dashboardElements.count() > 0) {
          console.log(`✅ Dashboard found at ${route}`);
          dashboardFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!dashboardFound) {
      console.log('⚠️ No dashboard page found, testing common dashboard elements on current page');
    }
    
    await page.screenshot({ path: 'test-results/dashboard-loaded.png', fullPage: true });
    
    // Test dashboard elements
    console.log('🔍 Testing Dashboard Elements');
    
    // Check for user information display
    const userInfo = page.locator(
      '.user-info, [class*="user"], .profile, h1, h2, .welcome, [class*="welcome"]'
    );
    
    if (await userInfo.count() > 0) {
      console.log('✅ User information section found');
    }
    
    // Check for statistics or summary cards
    const statsCards = page.locator(
      '.card, .stat, .summary, [class*="stat"], [class*="summary"], [class*="metric"]'
    );
    
    if (await statsCards.count() > 0) {
      console.log(`✅ Found ${await statsCards.count()} statistics/summary elements`);
    }
    
    // Check for orders/requests list
    const ordersList = page.locator(
      'table, .orders, .requests, [class*="order"], [class*="pedido"], .list, tbody'
    );
    
    if (await ordersList.count() > 0) {
      console.log('✅ Orders/requests list found');
      
      // Check for individual order items
      const orderItems = page.locator('tr, .order-item, [class*="order-item"], .list-item');
      if (await orderItems.count() > 1) { // More than header
        console.log(`✅ Found ${await orderItems.count()} order items`);
      }
    }
    
    // Test navigation elements
    const navElements = page.locator(
      'nav, .navigation, .menu, [class*="nav"], .sidebar, a:has-text("pedidos"), a:has-text("consultas")'
    );
    
    if (await navElements.count() > 0) {
      console.log('✅ Dashboard navigation found');
    }
    
    // Test action buttons
    const actionButtons = page.locator(
      'button:has-text("nova"), button:has-text("solicitar"), a:has-text("consulta"), a:has-text("certidão")'
    );
    
    if (await actionButtons.count() > 0) {
      console.log(`✅ Found ${await actionButtons.count()} action buttons`);
      
      // Try clicking first action button
      const firstAction = actionButtons.first();
      await firstAction.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/dashboard-action-clicked.png', fullPage: true });
    }
    
    // Test search functionality if available
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="pesquis"], input[placeholder*="busca"]'
    ).first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      console.log('✅ Search functionality tested');
    }
    
    // Test filters if available
    const filterElements = page.locator('select, .filter, [class*="filter"]');
    if (await filterElements.count() > 0) {
      console.log('✅ Filter elements found');
    }
    
    await page.screenshot({ path: 'test-results/dashboard-final.png', fullPage: true });
  });
  
  test('should test dashboard mobile responsiveness', async ({ page }) => {
    console.log('📱 Testing Dashboard Mobile Responsiveness');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Handle login if needed
    if (page.url().includes('login')) {
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.count() > 0) {
        await emailInput.fill('admin@querodocumento.com');
        await passwordInput.fill('admin123456');
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    
    await page.screenshot({ path: 'test-results/dashboard-mobile.png', fullPage: true });
    
    // Check if mobile menu exists
    const mobileMenu = page.locator(
      '.mobile-menu, .hamburger, [class*="mobile"], [class*="burger"], button[aria-label*="menu"]'
    );
    
    if (await mobileMenu.count() > 0) {
      console.log('✅ Mobile menu found');
      await mobileMenu.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/dashboard-mobile-menu.png', fullPage: true });
    }
    
    // Test scrolling behavior
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/dashboard-mobile-scrolled.png', fullPage: true });
    
    console.log('✅ Mobile dashboard test completed');
  });
});