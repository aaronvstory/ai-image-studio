import { test, expect } from '@playwright/test';

test.describe('Visual Testing: AI Image Generation App', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('1. Landing Page Screenshots', async ({ page }) => {
    console.log('📸 Testing Landing Page...');
    
    // Navigate to landing page
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Capture full landing page
    await page.screenshot({ 
      path: 'test-results/01-landing-page-full.png',
      fullPage: true 
    });
    
    // Capture hero section specifically
    const hero = page.locator('main').first();
    await hero.screenshot({ 
      path: 'test-results/01-landing-page-hero.png' 
    });
    
    console.log('✅ Landing page screenshots captured');
  });

  test('2. Authentication Pages Screenshots', async ({ page }) => {
    console.log('📸 Testing Authentication Pages...');
    
    // Test Signup Page
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/02-auth-signup-page.png',
      fullPage: true 
    });
    
    // Test signup form styling
    const signupForm = page.locator('form').first();
    if (await signupForm.isVisible()) {
      await signupForm.screenshot({ 
        path: 'test-results/02-auth-signup-form.png' 
      });
    }
    
    // Test Login Page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/02-auth-login-page.png',
      fullPage: true 
    });
    
    // Test login form styling
    const loginForm = page.locator('form').first();
    if (await loginForm.isVisible()) {
      await loginForm.screenshot({ 
        path: 'test-results/02-auth-login-form.png' 
      });
    }
    
    console.log('✅ Authentication page screenshots captured');
  });

  test('3. Dashboard Image Generator Screenshots', async ({ page }) => {
    console.log('📸 Testing Dashboard Image Generator...');
    
    // Navigate to dashboard (may redirect to auth if not logged in)
    await page.goto('/dashboard/image-generator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if we're on auth page (redirected) or dashboard
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/auth/')) {
      console.log('⚠️  Redirected to auth - trying demo mode navigation');
      
      // Try to access dashboard directly with demo mode
      await page.goto('/dashboard/image-generator');
      await page.waitForTimeout(2000);
    }
    
    // Capture current page (whether auth redirect or dashboard)
    await page.screenshot({ 
      path: 'test-results/03-dashboard-or-redirect.png',
      fullPage: true 
    });
    
    // If we're on the dashboard, capture specific elements
    if (!page.url().includes('/auth/')) {
      // Capture DALL-E 3 tab
      const dalleTab = page.locator('[data-value="dalle3"], [role="tab"]:has-text("DALL-E 3")').first();
      if (await dalleTab.isVisible()) {
        await dalleTab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: 'test-results/03-dashboard-dalle3-tab.png',
          fullPage: true 
        });
      }
      
      // Capture Gemini tab if available
      const geminiTab = page.locator('[data-value="gemini"], [role="tab"]:has-text("Gemini")').first();
      if (await geminiTab.isVisible()) {
        await geminiTab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: 'test-results/03-dashboard-gemini-tab.png',
          fullPage: true 
        });
      }
      
      // Capture prompt input area
      const promptInput = page.locator('textarea[placeholder*="prompt"], textarea[placeholder*="image"]').first();
      if (await promptInput.isVisible()) {
        await promptInput.screenshot({ 
          path: 'test-results/03-prompt-input-area.png' 
        });
      }
      
      // Capture generation settings
      const settingsArea = page.locator('[data-testid="generation-settings"], .settings, [role="group"]').first();
      if (await settingsArea.isVisible()) {
        await settingsArea.screenshot({ 
          path: 'test-results/03-generation-settings.png' 
        });
      }
    }
    
    console.log('✅ Dashboard screenshots captured');
  });

  test('4. Mobile Responsive View', async ({ page }) => {
    console.log('📸 Testing Mobile Responsive Design...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Test landing page mobile
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/04-mobile-landing-page.png',
      fullPage: true 
    });
    
    // Test auth pages mobile
    await page.goto('/auth/login');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/04-mobile-auth-login.png',
      fullPage: true 
    });
    
    // Test dashboard mobile
    await page.goto('/dashboard/image-generator');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/04-mobile-dashboard.png',
      fullPage: true 
    });
    
    console.log('✅ Mobile responsive screenshots captured');
  });

  test('5. Dark Theme and Component Styling Test', async ({ page }) => {
    console.log('📸 Testing Dark Theme and Component Styling...');
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Go to landing page and test theme
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check for dark theme indicators
    const body = page.locator('body');
    const bodyClass = await body.getAttribute('class');
    console.log(`Body classes: ${bodyClass}`);
    
    // Capture theme verification
    await page.screenshot({ 
      path: 'test-results/05-theme-verification.png' 
    });
    
    // Test interactive elements (buttons, forms, etc.)
    const interactiveElements = page.locator('button, input, textarea').first();
    if (await interactiveElements.isVisible()) {
      // Hover over first button to test hover states
      await interactiveElements.hover();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/05-interactive-hover-state.png' 
      });
    }
    
    console.log('✅ Theme and styling screenshots captured');
  });

  test('6. Test Toast Notifications (if accessible)', async ({ page }) => {
    console.log('📸 Testing Toast Notifications...');
    
    await page.goto('/dashboard/image-generator');
    await page.waitForTimeout(2000);
    
    // Look for any existing toast notifications
    const toasts = page.locator('[data-sonner-toast], .toast, [role="alert"]');
    const toastCount = await toasts.count();
    
    if (toastCount > 0) {
      console.log(`Found ${toastCount} toast notification(s)`);
      await page.screenshot({ 
        path: 'test-results/06-toast-notifications.png' 
      });
    } else {
      console.log('No toast notifications currently visible');
    }
    
    // Try to trigger a toast by interacting with form if available
    const submitButton = page.locator('button[type="submit"], button:has-text("Generate")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Check for any toast that might have appeared
      const newToasts = page.locator('[data-sonner-toast], .toast, [role="alert"]');
      const newToastCount = await newToasts.count();
      
      if (newToastCount > 0) {
        await page.screenshot({ 
          path: 'test-results/06-toast-after-interaction.png' 
        });
      }
    }
    
    console.log('✅ Toast notification testing completed');
  });

  test('7. Payment Modal Test (if accessible)', async ({ page }) => {
    console.log('📸 Testing Payment Modal...');
    
    await page.goto('/dashboard/image-generator');
    await page.waitForTimeout(2000);
    
    // Look for payment modal triggers
    const paymentTriggers = page.locator(
      'button:has-text("Upgrade"), button:has-text("Pay"), button:has-text("Subscribe"), [data-testid*="payment"]'
    );
    
    const triggerCount = await paymentTriggers.count();
    
    if (triggerCount > 0) {
      console.log(`Found ${triggerCount} potential payment trigger(s)`);
      
      // Try to click the first payment trigger
      await paymentTriggers.first().click();
      await page.waitForTimeout(1500);
      
      // Look for modal
      const modal = page.locator('[role="dialog"], .modal, [data-state="open"]').first();
      if (await modal.isVisible()) {
        await page.screenshot({ 
          path: 'test-results/07-payment-modal.png' 
        });
        console.log('✅ Payment modal screenshot captured');
      } else {
        console.log('No payment modal appeared after clicking trigger');
      }
    } else {
      console.log('No payment modal triggers found');
    }
    
    // Also check checkout page directly
    try {
      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-results/07-checkout-page.png',
        fullPage: true 
      });
      console.log('✅ Checkout page screenshot captured');
    } catch (error) {
      console.log('Checkout page not accessible or doesn\'t exist');
    }
  });
});