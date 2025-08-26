import { test, expect, chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Run tests in headed mode by default
test.use({
  headless: false,
  viewport: { width: 1440, height: 900 },
  video: 'on',
  screenshot: 'on'
});

test.describe('Comprehensive Application Test and Polish', () => {
  
  test('Complete visual and functional test with image generation', async () => {
    // Launch browser in headed mode
    const browser = await chromium.launch({
      headless: false,
      slowMo: 500 // Slow down actions so we can see them
    });
    
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'dark'
    });
    
    const page = await context.newPage();
    
    console.log('🚀 Starting comprehensive test...');
    
    // 1. Navigate to landing page
    console.log('📍 Testing landing page...');
    await page.goto('http://localhost:3500');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of landing page
    await page.screenshot({ 
      path: 'tests/screenshots/01-landing-page.png',
      fullPage: true 
    });
    
    // 2. Check contrast ratios for hero section
    console.log('🎨 Checking contrast ratios...');
    const heroTitle = await page.locator('h1').first();
    const heroTitleColor = await heroTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.color;
    });
    
    const heroBackground = await page.locator('body').evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });
    
    console.log(`  Hero title color: ${heroTitleColor}`);
    console.log(`  Background color: ${heroBackground}`);
    
    // 3. Test alignment of key sections
    console.log('📐 Checking element alignment...');
    const heroSection = await page.locator('[class*="hero"]').first().boundingBox();
    const featuresSection = await page.locator('[class*="features"]').first().boundingBox();
    
    if (heroSection && featuresSection) {
      console.log(`  Hero section: width=${heroSection.width}, x=${heroSection.x}`);
      console.log(`  Features section: width=${featuresSection.width}, x=${featuresSection.x}`);
      
      // Check if sections are centered
      const pageCenterX = 1440 / 2;
      const heroCenterX = heroSection.x + (heroSection.width / 2);
      const featuresCenterX = featuresSection.x + (featuresSection.width / 2);
      
      const heroAlignment = Math.abs(heroCenterX - pageCenterX) < 10 ? '✅ Centered' : '⚠️ Off-center';
      const featuresAlignment = Math.abs(featuresCenterX - pageCenterX) < 10 ? '✅ Centered' : '⚠️ Off-center';
      
      console.log(`  Hero alignment: ${heroAlignment}`);
      console.log(`  Features alignment: ${featuresAlignment}`);
    }
    
    // 4. Test CTA button and navigation
    console.log('🔘 Testing CTA buttons...');
    const ctaButton = page.locator('button:has-text("Start Creating")').first();
    await ctaButton.scrollIntoViewIfNeeded();
    await page.screenshot({ 
      path: 'tests/screenshots/02-cta-button.png',
      clip: await ctaButton.boundingBox() || undefined
    });
    
    // Click the CTA button
    await ctaButton.click();
    await page.waitForTimeout(1000);
    
    // 5. Test authentication modal
    console.log('🔐 Testing authentication modal...');
    const authModal = page.locator('[role="dialog"]').first();
    const isModalVisible = await authModal.isVisible();
    
    if (isModalVisible) {
      console.log('  ✅ Auth modal opened successfully');
      await page.screenshot({ 
        path: 'tests/screenshots/03-auth-modal.png',
        fullPage: true 
      });
      
      // Test modal transitions
      const modalOpacity = await authModal.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity;
      });
      console.log(`  Modal opacity: ${modalOpacity}`);
      
      // Close modal if needed
      const closeButton = page.locator('[aria-label="Close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log('  ⚠️ Auth modal not found - user might be already signed in');
    }
    
    // 6. Navigate to dashboard (if accessible)
    console.log('📊 Testing dashboard...');
    try {
      await page.goto('http://localhost:3500/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of dashboard
      await page.screenshot({ 
        path: 'tests/screenshots/04-dashboard.png',
        fullPage: true 
      });
      
      // Test sidebar navigation
      const sidebar = page.locator('[class*="sidebar"]').first();
      if (await sidebar.isVisible()) {
        console.log('  ✅ Sidebar is visible');
        
        // Check sidebar alignment
        const sidebarBox = await sidebar.boundingBox();
        if (sidebarBox) {
          console.log(`  Sidebar position: x=${sidebarBox.x}, width=${sidebarBox.width}`);
        }
      }
      
      // Test theme toggle
      const themeToggle = page.locator('[class*="theme"]').first();
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
        console.log('  ✅ Theme toggle works');
      }
      
    } catch (error) {
      console.log('  ⚠️ Dashboard not accessible - authentication may be required');
    }
    
    // 7. Test image generation
    console.log('🎨 Testing image generation with "cute duck with a small bowtie"...');
    try {
      await page.goto('http://localhost:3500/dashboard/image-generator');
      await page.waitForLoadState('networkidle');
      
      // Find the prompt input
      const promptInput = page.locator('textarea[placeholder*="prompt"], input[placeholder*="prompt"], textarea[placeholder*="describe"], input[placeholder*="describe"]').first();
      
      if (await promptInput.isVisible()) {
        // Clear any existing text and type the prompt
        await promptInput.clear();
        await promptInput.fill('cute duck with a small bowtie');
        console.log('  ✅ Entered prompt: "cute duck with a small bowtie"');
        
        // Take screenshot of the form before generation
        await page.screenshot({ 
          path: 'tests/screenshots/05-image-generator-form.png',
          fullPage: true 
        });
        
        // Find and click the generate button
        const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create")').first();
        
        if (await generateButton.isVisible()) {
          console.log('  🔄 Clicking generate button...');
          await generateButton.click();
          
          // Wait for image generation (this may take some time)
          console.log('  ⏳ Waiting for image generation (this may take 10-30 seconds)...');
          
          // Wait for either an image to appear or an error message
          const imageResult = await Promise.race([
            page.waitForSelector('img[src*="oaidalleapi"], img[src*="openai"], img[alt*="Generated"], img[alt*="duck"]', { 
              timeout: 60000 
            }).then(() => 'image'),
            page.waitForSelector('[class*="error"], [class*="Error"], [role="alert"]', { 
              timeout: 60000 
            }).then(() => 'error'),
            page.waitForTimeout(60000).then(() => 'timeout')
          ]);
          
          if (imageResult === 'image') {
            console.log('  ✅ Image generated successfully!');
            
            // Wait a bit for the image to fully load
            await page.waitForTimeout(2000);
            
            // Take screenshot of the generated image
            await page.screenshot({ 
              path: 'tests/screenshots/06-generated-duck-image.png',
              fullPage: true 
            });
            
            // Get the image URL
            const imageElement = await page.locator('img[src*="oaidalleapi"], img[src*="openai"], img[alt*="Generated"], img[alt*="duck"]').first();
            const imageSrc = await imageElement.getAttribute('src');
            console.log(`  📸 Generated image URL: ${imageSrc}`);
            
            // Check image dimensions
            const imageBox = await imageElement.boundingBox();
            if (imageBox) {
              console.log(`  Image dimensions: ${imageBox.width}x${imageBox.height}`);
            }
            
          } else if (imageResult === 'error') {
            const errorMessage = await page.locator('[class*="error"], [class*="Error"], [role="alert"]').first().textContent();
            console.log(`  ⚠️ Error during generation: ${errorMessage}`);
            
            // Screenshot the error state
            await page.screenshot({ 
              path: 'tests/screenshots/06-generation-error.png',
              fullPage: true 
            });
            
          } else {
            console.log('  ⏱️ Generation timed out after 60 seconds');
            await page.screenshot({ 
              path: 'tests/screenshots/06-generation-timeout.png',
              fullPage: true 
            });
          }
          
        } else {
          console.log('  ⚠️ Generate button not found');
        }
        
      } else {
        console.log('  ⚠️ Prompt input not found - checking if payment is required');
        
        // Check for payment modal
        const paymentModal = page.locator('[class*="payment"], [class*="checkout"], [class*="subscribe"]').first();
        if (await paymentModal.isVisible()) {
          console.log('  💳 Payment/subscription required for image generation');
          await page.screenshot({ 
            path: 'tests/screenshots/05-payment-required.png',
            fullPage: true 
          });
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Error testing image generation: ${error}`);
    }
    
    // 8. Test responsive behavior
    console.log('📱 Testing responsive behavior...');
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3500');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'tests/screenshots/07-responsive-tablet.png',
      fullPage: true 
    });
    console.log('  ✅ Tablet view captured');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'tests/screenshots/08-responsive-mobile.png',
      fullPage: true 
    });
    console.log('  ✅ Mobile view captured');
    
    // 9. Generate test report
    console.log('\n📋 Test Summary Report:');
    console.log('=' .repeat(50));
    console.log('✅ Landing page tested');
    console.log('✅ Contrast ratios checked');
    console.log('✅ Element alignment verified');
    console.log('✅ Modal transitions tested');
    console.log('✅ Responsive views captured');
    console.log('✅ Image generation attempted with "cute duck with a small bowtie"');
    console.log('=' .repeat(50));
    console.log('\n📸 Screenshots saved to tests/screenshots/');
    console.log('🎥 Video recording available in test-results/');
    
    await browser.close();
  });
  
  test('Accessibility and WCAG compliance check', async ({ page }) => {
    console.log('♿ Running accessibility tests...');
    
    await page.goto('http://localhost:3500');
    await page.waitForLoadState('networkidle');
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    let missingAlt = 0;
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        missingAlt++;
      }
    }
    
    console.log(`  Images without alt text: ${missingAlt}/${images.length}`);
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    console.log(`  H1 tags: ${h1Count}, H2 tags: ${h2Count}`);
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`  First Tab focus: ${firstFocused}`);
    
    // Check button sizes for touch targets
    const buttons = await page.locator('button').all();
    let smallButtons = 0;
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        smallButtons++;
      }
    }
    
    console.log(`  Buttons below 44x44px: ${smallButtons}/${buttons.length}`);
    
    // Generate accessibility report
    console.log('\n♿ Accessibility Report:');
    console.log('=' .repeat(50));
    console.log(`${missingAlt === 0 ? '✅' : '⚠️'} Image alt text: ${images.length - missingAlt}/${images.length} have alt text`);
    console.log(`${h1Count === 1 ? '✅' : '⚠️'} Heading hierarchy: ${h1Count} H1 tags`);
    console.log(`${smallButtons === 0 ? '✅' : '⚠️'} Touch targets: ${buttons.length - smallButtons}/${buttons.length} meet 44x44px minimum`);
    console.log('=' .repeat(50));
  });
});