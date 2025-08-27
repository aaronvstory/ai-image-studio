import { test, expect } from '@playwright/test';

test.describe('Quick Visual Test - AI Image Generator', () => {
  
  test('Check if server is running and capture initial screenshots', async ({ page }) => {
    console.log('🔍 Checking if development server is running...');
    
    // Test server availability
    try {
      await page.goto('http://localhost:3500', { timeout: 5000 });
      console.log('✅ Server is running on port 3500');
    } catch (error) {
      console.error('❌ Server not running on port 3500. Please start with: npm run dev');
      throw error;
    }
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Capture landing page
    await page.screenshot({ 
      path: 'test-results/landing-page.png',
      fullPage: true 
    });
    
    console.log('📸 Landing page screenshot captured');
    
    // Test navigation to auth pages
    console.log('🔐 Testing authentication pages...');
    
    // Navigate to signup
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/signup-page.png',
      fullPage: true 
    });
    
    // Navigate to login
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/login-page.png',
      fullPage: true 
    });
    
    console.log('📸 Authentication pages captured');
    
    // Test dashboard access
    console.log('🎨 Testing dashboard...');
    
    await page.goto('/dashboard/image-generator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`Dashboard URL: ${currentUrl}`);
    
    await page.screenshot({ 
      path: 'test-results/dashboard.png',
      fullPage: true 
    });
    
    // Check if we have tabs (DALL-E vs Gemini)
    const tabs = page.locator('[role="tab"], .tab');
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      console.log(`Found ${tabCount} tabs`);
      
      // Capture each tab if visible
      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        const tabText = await tab.textContent();
        
        if (tabText && tabText.trim()) {
          await tab.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: `test-results/dashboard-tab-${tabText.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`,
            fullPage: true 
          });
          
          console.log(`📸 Tab "${tabText}" captured`);
        }
      }
    }
    
    console.log('✅ Visual testing completed successfully!');
  });
  
  test('Mobile responsive test', async ({ page }) => {
    console.log('📱 Testing mobile responsive design...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Test mobile landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/mobile-landing.png',
      fullPage: true 
    });
    
    // Test mobile auth
    await page.goto('/auth/login');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/mobile-login.png',
      fullPage: true 
    });
    
    // Test mobile dashboard
    await page.goto('/dashboard/image-generator');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/mobile-dashboard.png',
      fullPage: true 
    });
    
    console.log('📸 Mobile screenshots captured');
  });
  
});