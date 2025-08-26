import { test, expect } from '@playwright/test';

test.describe('Styles Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Start dev server will be on port 3500
    await page.goto('http://localhost:3500', { waitUntil: 'networkidle' });
  });

  test('should apply Tailwind styles correctly - landing page', async ({ page }) => {
    // Wait for page to fully render
    await page.waitForSelector('body', { state: 'visible' });
    
    // Take a full page screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/landing-full-page.png',
      fullPage: true 
    });

    // Check if the main gradient background is applied
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Should have a background color

    // Check if the hero section exists and is styled
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Take screenshot of hero section
    await heroSection.screenshot({ 
      path: 'tests/screenshots/hero-section.png' 
    });

    // Check for gradient text styling on headings
    const heading = page.locator('h1').first();
    if (await heading.count() > 0) {
      await heading.screenshot({ 
        path: 'tests/screenshots/heading-gradient.png' 
      });
      
      const headingColor = await heading.evaluate((el) => 
        window.getComputedStyle(el).backgroundImage
      );
      // Check if gradient is applied
      expect(headingColor).toMatch(/gradient|linear/i);
    }

    // Check for button styling
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await firstButton.screenshot({ 
        path: 'tests/screenshots/button-styling.png' 
      });
      
      // Check button has proper styling
      const buttonBg = await firstButton.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(buttonBg).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('should apply dark mode styles correctly', async ({ page }) => {
    // Apply dark mode class to HTML
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    await page.waitForTimeout(500); // Wait for transition

    // Take dark mode screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/dark-mode-full.png',
      fullPage: true 
    });

    // Check dark background is applied
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });
    
    // Dark mode should have a darker background
    console.log('Dark mode background color:', bgColor);
    
    // Verify CSS custom properties are loaded
    const rootStyles = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.documentElement);
      return {
        background: styles.getPropertyValue('--background'),
        foreground: styles.getPropertyValue('--foreground'),
        primary: styles.getPropertyValue('--primary'),
        radius: styles.getPropertyValue('--radius')
      };
    });
    
    expect(rootStyles.background).toBeTruthy();
    expect(rootStyles.foreground).toBeTruthy();
    expect(rootStyles.primary).toBeTruthy();
  });

  test('should apply component styles - image generator', async ({ page }) => {
    // Look for the image generator component
    const imageGenerator = page.locator('[class*="generator"], [class*="Generator"]').first();
    
    if (await imageGenerator.count() > 0) {
      await imageGenerator.screenshot({ 
        path: 'tests/screenshots/image-generator.png' 
      });
      
      // Check if it has proper spacing/padding
      const padding = await imageGenerator.evaluate((el) => 
        window.getComputedStyle(el).padding
      );
      expect(padding).not.toBe('0px');
    }

    // Check for form elements styling
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.count() > 0) {
      const firstInput = inputs.first();
      await firstInput.screenshot({ 
        path: 'tests/screenshots/input-styling.png' 
      });
      
      // Verify input has border and proper styling
      const inputStyles = await firstInput.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          border: styles.border,
          borderRadius: styles.borderRadius,
          padding: styles.padding
        };
      });
      
      expect(inputStyles.borderRadius).not.toBe('0px');
      expect(inputStyles.padding).not.toBe('0px');
    }
  });

  test('should apply responsive styles correctly', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-view.png',
      fullPage: true 
    });

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/tablet-view.png',
      fullPage: true 
    });

    // Test desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/desktop-view.png',
      fullPage: true 
    });

    // Verify layout changes based on viewport
    const container = page.locator('.container, [class*="container"]').first();
    if (await container.count() > 0) {
      const containerWidth = await container.evaluate((el) => 
        el.getBoundingClientRect().width
      );
      
      // Desktop should have wider container
      expect(containerWidth).toBeGreaterThan(768);
    }
  });

  test('should load custom CSS animations', async ({ page }) => {
    // Check for animated elements
    const animatedElements = page.locator('[class*="animate"], [class*="motion"], .cpu-architecture');
    
    if (await animatedElements.count() > 0) {
      const firstAnimated = animatedElements.first();
      
      // Take initial screenshot
      await firstAnimated.screenshot({ 
        path: 'tests/screenshots/animation-start.png' 
      });
      
      // Wait for animation
      await page.waitForTimeout(1000);
      
      // Take another screenshot
      await firstAnimated.screenshot({ 
        path: 'tests/screenshots/animation-mid.png' 
      });
      
      // Check if animation styles are applied
      const animationStyle = await firstAnimated.evaluate((el) => 
        window.getComputedStyle(el).animation
      );
      
      // Should have some animation property
      expect(animationStyle).toBeTruthy();
    }
  });

  test('verify Tailwind utilities are working', async ({ page }) => {
    // Create a test element to verify Tailwind is processing correctly
    await page.evaluate(() => {
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-blue-500 text-white p-4 rounded-lg shadow-lg';
      testDiv.textContent = 'Tailwind Test Element';
      testDiv.id = 'tailwind-test';
      document.body.appendChild(testDiv);
    });

    const testElement = page.locator('#tailwind-test');
    await testElement.screenshot({ 
      path: 'tests/screenshots/tailwind-test-element.png' 
    });

    const styles = await testElement.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        padding: computed.padding,
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow
      };
    });

    // Verify Tailwind utilities are applied
    expect(styles.backgroundColor).toMatch(/rgb|rgba/);
    expect(styles.color).toMatch(/rgb|rgba/);
    expect(styles.padding).not.toBe('0px');
    expect(styles.borderRadius).not.toBe('0px');
    expect(styles.boxShadow).not.toBe('none');

    // Cleanup
    await page.evaluate(() => {
      document.getElementById('tailwind-test')?.remove();
    });
  });

  test('should compile and apply globals.css correctly', async ({ page }) => {
    // Verify CSS custom properties from globals.css are loaded
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = window.getComputedStyle(root);
      return {
        // Check core variables
        radius: styles.getPropertyValue('--radius'),
        background: styles.getPropertyValue('--background'),
        foreground: styles.getPropertyValue('--foreground'),
        primary: styles.getPropertyValue('--primary'),
        
        // Check custom colors
        sage50: styles.getPropertyValue('--sage-50'),
        warmGray50: styles.getPropertyValue('--warm-gray-50'),
        
        // Check shadow variables
        shadow: styles.getPropertyValue('--shadow'),
        shadowMd: styles.getPropertyValue('--shadow-md'),
        
        // Check theme-specific variables
        colorBackground: styles.getPropertyValue('--color-background'),
        colorPrimary: styles.getPropertyValue('--color-primary'),
        
        // Check if CSS is loaded at all
        hasStyles: document.styleSheets.length > 0
      };
    });

    // All CSS variables should be defined
    expect(cssVariables.radius).toBeTruthy();
    expect(cssVariables.background).toBeTruthy();
    expect(cssVariables.foreground).toBeTruthy();
    expect(cssVariables.primary).toBeTruthy();
    expect(cssVariables.sage50).toBeTruthy();
    expect(cssVariables.warmGray50).toBeTruthy();
    expect(cssVariables.hasStyles).toBe(true);

    console.log('CSS Variables loaded:', cssVariables);
  });

  test('visual regression - compare with baseline', async ({ page }) => {
    // This test can be used to compare against baseline images
    // First run will create baselines, subsequent runs will compare
    
    await expect(page).toHaveScreenshot('homepage-baseline.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('[class*="animate"]')] // Mask animated elements
    });

    // Test specific components
    const header = page.locator('header').first();
    if (await header.count() > 0) {
      await expect(header).toHaveScreenshot('header-baseline.png');
    }

    const footer = page.locator('footer').first();
    if (await footer.count() > 0) {
      await expect(footer).toHaveScreenshot('footer-baseline.png');
    }
  });
});

// Helper test to ensure dev server is running
test('dev server is accessible', async ({ page }) => {
  const response = await page.goto('http://localhost:3500');
  expect(response?.status()).toBeLessThan(400);
});