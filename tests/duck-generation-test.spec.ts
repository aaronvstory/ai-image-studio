import { test, expect } from '@playwright/test';

test.describe('Duck Image Generation Test', () => {
  // Configure for headed mode with slower operations for visibility
  test.use({
    viewport: { width: 1440, height: 900 }
  });

  test('Generate cute duck with bowtie image', async ({ page }) => {
    console.log('🦆 Starting duck image generation test...');
    
    // Navigate to landing page first
    await page.goto('http://localhost:3500', { waitUntil: 'networkidle' });
    console.log('📍 Loaded landing page');
    
    // Take screenshot of landing page
    await page.screenshot({ 
      path: 'test-results/duck-test-01-landing.png',
      fullPage: true 
    });
    
    // Try to navigate to image generator
    console.log('🎨 Navigating to image generator...');
    
    // First try direct navigation
    await page.goto('http://localhost:3500/dashboard/image-generator', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to stabilize
    await page.waitForTimeout(3000);
    
    // Check current URL to see if we were redirected
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'test-results/duck-test-02-navigation.png',
      fullPage: true 
    });
    
    // If we're on sign-in page, we need auth
    if (currentUrl.includes('sign-in') || currentUrl.includes('sign-up')) {
      console.log('🔐 Authentication required - checking for demo mode...');
      
      // Look for any bypass or demo mode option
      const demoButton = page.locator('button:has-text("Demo"), button:has-text("Try Demo"), button:has-text("Skip")');
      if (await demoButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await demoButton.click();
        console.log('✅ Demo mode activated');
        await page.waitForTimeout(2000);
      } else {
        console.log('ℹ️ Authentication required - test user needed');
        
        // Try to sign in with test credentials if available
        const emailInput = page.locator('input[name="identifier"], input[name="emailAddress"], input[type="email"]').first();
        if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log('📧 Attempting test login...');
          await emailInput.fill('test@example.com');
          
          const passwordInput = page.locator('input[type="password"]').first();
          if (await passwordInput.isVisible()) {
            await passwordInput.fill('testpassword123');
            
            const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Continue")').first();
            if (await submitButton.isVisible()) {
              await submitButton.click();
              await page.waitForTimeout(3000);
            }
          }
        }
      }
    }
    
    // Check if we're now on the image generator page
    const generatorUrl = page.url();
    if (generatorUrl.includes('image-generator') || generatorUrl.includes('dashboard')) {
      console.log('✅ Reached image generator page');
      
      // Look for prompt input field
      const promptSelectors = [
        'textarea[placeholder*="prompt"]',
        'input[placeholder*="prompt"]',
        'textarea[placeholder*="Describe"]',
        'input[placeholder*="Describe"]',
        'textarea[placeholder*="Enter"]',
        'textarea[name="prompt"]',
        'input[name="prompt"]',
        '#prompt',
        'textarea',
        'input[type="text"]'
      ];
      
      let promptInput = null;
      for (const selector of promptSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
          promptInput = element;
          console.log(`✅ Found prompt input with selector: ${selector}`);
          break;
        }
      }
      
      if (promptInput) {
        // Clear and enter the duck prompt
        await promptInput.clear();
        await promptInput.fill('cute duck with a small bowtie');
        console.log('📝 Entered prompt: "cute duck with a small bowtie"');
        
        // Take screenshot with prompt entered
        await page.screenshot({ 
          path: 'test-results/duck-test-03-prompt-entered.png',
          fullPage: true 
        });
        
        // Find and click generate button
        const generateSelectors = [
          'button:has-text("Generate")',
          'button:has-text("Create")',
          'button:has-text("Generate Image")',
          'button:has-text("Submit")',
          'button[type="submit"]',
          'button.primary',
          'button'
        ];
        
        let generateButton = null;
        for (const selector of generateSelectors) {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
            const text = await element.textContent();
            if (text && (text.includes('Generate') || text.includes('Create') || text.includes('Submit'))) {
              generateButton = element;
              console.log(`✅ Found generate button: "${text}"`);
              break;
            }
          }
        }
        
        if (generateButton) {
          // Click generate button
          await generateButton.click();
          console.log('⏳ Generating image... (waiting up to 60 seconds)');
          
          // Wait for image to appear or error message
          const imageSelectors = [
            'img[alt*="Generated"]',
            'img[alt*="generated"]',
            'img[alt*="AI"]',
            'img[src*="oaidalleapi"]',
            'img[src*="openai"]',
            'img[src*="dalle"]',
            '.generated-image img',
            '#generated-image',
            'img'
          ];
          
          // Also look for error messages
          const errorSelectors = [
            'text=payment required',
            'text=subscribe',
            'text=upgrade',
            'text=error',
            'text=failed',
            '.error',
            '.alert'
          ];
          
          // Wait for either image or error
          let imageFound = false;
          let errorFound = false;
          
          for (let i = 0; i < 60; i++) {
            // Check for generated image
            for (const selector of imageSelectors) {
              const img = page.locator(selector).first();
              if (await img.isVisible({ timeout: 1000 }).catch(() => false)) {
                const src = await img.getAttribute('src');
                if (src && (src.includes('oaidalleapi') || src.includes('openai') || src.includes('blob:') || src.length > 100)) {
                  imageFound = true;
                  console.log('🎉 Image generated successfully!');
                  console.log('🖼️ Image URL:', src?.substring(0, 100) + '...');
                  
                  // Wait a bit for image to fully load
                  await page.waitForTimeout(3000);
                  
                  // Take screenshot of generated image
                  await page.screenshot({ 
                    path: 'test-results/duck-test-04-generated-duck.png',
                    fullPage: true 
                  });
                  
                  // Also try to capture just the image
                  const imageBounds = await img.boundingBox();
                  if (imageBounds) {
                    await page.screenshot({
                      path: 'test-results/duck-test-05-duck-closeup.png',
                      clip: imageBounds
                    });
                  }
                  
                  break;
                }
              }
            }
            
            if (imageFound) break;
            
            // Check for errors
            for (const selector of errorSelectors) {
              const error = page.locator(selector).first();
              if (await error.isVisible({ timeout: 500 }).catch(() => false)) {
                errorFound = true;
                const errorText = await error.textContent();
                console.log(`⚠️ Error encountered: ${errorText}`);
                
                // Take screenshot of error state
                await page.screenshot({ 
                  path: 'test-results/duck-test-error-state.png',
                  fullPage: true 
                });
                break;
              }
            }
            
            if (errorFound) break;
            
            // Wait before next check
            await page.waitForTimeout(1000);
            
            if (i % 10 === 0 && i > 0) {
              console.log(`⏳ Still waiting... (${i} seconds elapsed)`);
            }
          }
          
          if (!imageFound && !errorFound) {
            console.log('⚠️ Image generation timed out after 60 seconds');
            await page.screenshot({ 
              path: 'test-results/duck-test-timeout-state.png',
              fullPage: true 
            });
          }
          
        } else {
          console.log('❌ Could not find generate button');
          await page.screenshot({ 
            path: 'test-results/duck-test-no-generate-button.png',
            fullPage: true 
          });
        }
      } else {
        console.log('❌ Could not find prompt input field');
        await page.screenshot({ 
          path: 'test-results/duck-test-no-prompt-field.png',
          fullPage: true 
        });
      }
    } else {
      console.log('ℹ️ Could not access image generator - authentication or payment required');
      await page.screenshot({ 
        path: 'test-results/duck-test-blocked-access.png',
        fullPage: true 
      });
    }
    
    console.log('🦆 Duck generation test complete!');
  });

  test('Check contrast ratios and alignment', async ({ page }) => {
    console.log('🎨 Checking visual polish...');
    
    await page.goto('http://localhost:3500', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Analyze contrast ratios
    const contrastResults = await page.evaluate(() => {
      const results: Array<any> = [];
      
      // Helper function to get luminance
      function getLuminance(r: number, g: number, b: number) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      
      // Helper function to calculate contrast ratio
      function getContrastRatio(rgb1: string, rgb2: string) {
        const parseRgb = (rgb: string) => {
          const match = rgb.match(/\d+/g);
          return match ? match.map(Number) : [0, 0, 0];
        };
        
        const [r1, g1, b1] = parseRgb(rgb1);
        const [r2, g2, b2] = parseRgb(rgb2);
        
        const l1 = getLuminance(r1, g1, b1);
        const l2 = getLuminance(r2, g2, b2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
      }
      
      // Check all text elements
      const textElements = document.querySelectorAll('h1, h2, h3, p, button, a');
      
      textElements.forEach((element, index) => {
        if (index >= 10) return; // Limit to first 10 elements
        
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        const fontSize = parseFloat(styles.fontSize);
        const fontWeight = styles.fontWeight;
        
        // Get effective background color (traverse up if transparent)
        let effectiveBg = backgroundColor;
        let parent = element.parentElement;
        while (parent && (effectiveBg === 'transparent' || effectiveBg === 'rgba(0, 0, 0, 0)')) {
          effectiveBg = window.getComputedStyle(parent).backgroundColor;
          parent = parent.parentElement;
        }
        
        const ratio = getContrastRatio(color, effectiveBg);
        const isLargeText = Number(fontSize) >= 18 || (Number(fontSize) >= 14 && Number(fontWeight) >= 700);
        const requiredRatio = isLargeText ? 3 : 4.5;
        const passes = Number(ratio) >= requiredRatio;
        
        results.push({
          element: element.tagName.toLowerCase(),
          text: (element.textContent || '').substring(0, 30),
          color,
          background: effectiveBg,
          fontSize: `${fontSize}px`,
          fontWeight,
          contrastRatio: ratio.toFixed(2),
          required: requiredRatio,
          passes,
          wcagLevel: passes ? 'AA' : 'FAIL'
        });
      });
      
      return results;
    });
    
    console.log('📊 Contrast Ratio Results:');
    contrastResults.forEach(result => {
      const status = result.passes ? '✅' : '❌';
      console.log(`${status} ${result.element}: ${result.contrastRatio}:1 (needs ${result.required}:1) - ${result.wcagLevel}`);
    });
    
    // Check alignment
    const alignmentResults = await page.evaluate(() => {
      const results: Array<any> = [];
      
      // Check centered elements
      const centeredElements = document.querySelectorAll('[class*="center"], [class*="mx-auto"], .container');
      
      centeredElements.forEach((element, index) => {
        if (index >= 5) return; // Limit checks
        
        const rect = element.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const leftMargin = rect.left;
        const rightMargin = windowWidth - rect.right;
        const isCentered = Math.abs(leftMargin - rightMargin) < 5;
        
        results.push({
          element: element.tagName.toLowerCase(),
          class: element.className,
          width: rect.width,
          leftMargin: Math.round(leftMargin),
          rightMargin: Math.round(rightMargin),
          isCentered,
          offset: Math.round(leftMargin - rightMargin)
        });
      });
      
      return results;
    });
    
    console.log('📐 Alignment Results:');
    alignmentResults.forEach(result => {
      const status = result.isCentered ? '✅' : '⚠️';
      console.log(`${status} ${result.element}: Left ${result.leftMargin}px, Right ${result.rightMargin}px (offset: ${result.offset}px)`);
    });
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/duck-test-visual-analysis.png',
      fullPage: true 
    });
    
    console.log('✨ Visual polish check complete!');
  });
});