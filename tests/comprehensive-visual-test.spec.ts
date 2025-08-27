import { test, expect } from '@playwright/test';

test.describe('Comprehensive Visual Testing - AI Image Generation App', () => {
  
  // Test 1: Server availability and landing page
  test('Landing Page Visual Test', async ({ page }) => {
    console.log('🏠 Testing Landing Page (port 3500)...');
    
    await page.goto('http://localhost:3500', { waitUntil: 'networkidle' });
    
    // Wait for animations to settle
    await page.waitForTimeout(3000);
    
    // Capture full landing page
    await page.screenshot({ 
      path: 'test-results/01-landing-page-full.png',
      fullPage: true 
    });
    
    // Capture hero section specifically
    const hero = page.locator('main section').first();
    await hero.screenshot({ 
      path: 'test-results/01-hero-section.png' 
    });
    
    // Test animated headlines
    console.log('Testing rotating headlines...');
    await page.waitForTimeout(4500); // Wait for headline rotation
    await page.screenshot({ 
      path: 'test-results/01-hero-with-rotated-headline.png' 
    });
    
    // Test CTA button hover
    const ctaButton = page.locator('button:has-text("Start Creating Now")');
    if (await ctaButton.isVisible()) {
      await ctaButton.hover();
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: 'test-results/01-cta-button-hover.png' 
      });
    }
    
    console.log('✅ Landing page tests completed');
  });

  // Test 2: Authentication pages
  test('Authentication Pages Visual Test', async ({ page }) => {
    console.log('🔐 Testing Authentication Pages...');
    
    // Login page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'test-results/02-login-page-full.png',
      fullPage: true 
    });
    
    // Test form interaction
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    
    await page.screenshot({ 
      path: 'test-results/02-login-form-filled.png' 
    });
    
    // Test button hover states
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.hover();
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/02-login-button-hover.png' 
    });
    
    // Signup page
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'test-results/02-signup-page-full.png',
      fullPage: true 
    });
    
    console.log('✅ Authentication pages tests completed');
  });

  // Test 3: Dashboard and image generator
  test('Dashboard Image Generator Visual Test', async ({ page }) => {
    console.log('🎨 Testing Dashboard Image Generator...');
    
    await page.goto('/dashboard/image-generator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Capture initial dashboard state
    await page.screenshot({ 
      path: 'test-results/03-dashboard-initial.png',
      fullPage: true 
    });
    
    // Test DALL-E 3 tab
    const dalleTab = page.locator('[data-value="dalle3"], [role="tab"]:has-text("DALL-E 3")');
    if (await dalleTab.count() > 0) {
      await dalleTab.first().click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/03-dalle3-tab-active.png',
        fullPage: true 
      });
      
      // Test prompt input
      const promptInput = page.locator('textarea, input[placeholder*="prompt"]').first();
      if (await promptInput.isVisible()) {
        await promptInput.fill('A beautiful sunset over the mountains');
        await page.screenshot({ 
          path: 'test-results/03-prompt-filled.png' 
        });
      }
    }
    
    // Test Gemini tab if available
    const geminiTab = page.locator('[data-value="gemini"], [role="tab"]:has-text("Gemini")');
    if (await geminiTab.count() > 0) {
      await geminiTab.first().click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/03-gemini-tab-active.png',
        fullPage: true 
      });
    }
    
    console.log('✅ Dashboard tests completed');
  });

  // Test 4: Mobile responsive design
  test('Mobile Responsive Visual Test', async ({ page }) => {
    console.log('📱 Testing Mobile Responsive Design...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Mobile landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/04-mobile-landing.png',
      fullPage: true 
    });
    
    // Mobile auth
    await page.goto('/auth/login');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'test-results/04-mobile-login.png',
      fullPage: true 
    });
    
    // Mobile dashboard
    await page.goto('/dashboard/image-generator');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/04-mobile-dashboard.png',
      fullPage: true 
    });
    
    console.log('✅ Mobile responsive tests completed');
  });

  // Test 5: Dark theme and component styling
  test('Theme and Styling Visual Test', async ({ page }) => {
    console.log('🎨 Testing Dark Theme and Component Styling...');
    
    // Reset to desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check body class for theme
    const body = await page.locator('body');
    const bodyClass = await body.getAttribute('class');
    console.log(`Theme classes detected: ${bodyClass}`);
    
    // Test component styling on landing
    await page.screenshot({ 
      path: 'test-results/05-theme-landing.png' 
    });
    
    // Go to auth for dark theme test
    await page.goto('/auth/login');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'test-results/05-theme-auth-dark.png' 
    });
    
    // Test interactive states
    const input = page.locator('input[type="email"]').first();
    await input.focus();
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/05-input-focus-state.png' 
    });
    
    console.log('✅ Theme and styling tests completed');
  });

  // Test 6: Error states and notifications
  test('Error States and Notifications Test', async ({ page }) => {
    console.log('🚨 Testing Error States and Toast Notifications...');
    
    await page.goto('/auth/login');
    await page.waitForTimeout(1500);
    
    // Try to submit empty form to trigger validation
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // Check for error states
    await page.screenshot({ 
      path: 'test-results/06-form-validation-errors.png' 
    });
    
    // Try invalid credentials to trigger server error
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await submitButton.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/06-auth-error-state.png' 
    });
    
    console.log('✅ Error states tests completed');
  });
  
});