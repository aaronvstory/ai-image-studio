import { test, expect } from '@playwright/test';

test.describe('Test Both Image Providers', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3500');
    await page.waitForLoadState('networkidle');
  });

  test('OpenAI DALL-E 3 Generation', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ path: 'tests/01-openai-start.png', fullPage: true });

    // Select OpenAI provider (should be default)
    const openaiRadio = page.locator('input[value="openai"]');
    if (await openaiRadio.isVisible()) {
      await openaiRadio.click();
    }

    // Enter a prompt
    const promptInput = page.locator('textarea[placeholder*="Describe"]').first();
    await promptInput.fill('A majestic mountain landscape at sunset with vibrant colors');

    // Take screenshot before generation
    await page.screenshot({ path: 'tests/02-openai-prompt-ready.png', fullPage: true });

    // Click generate button
    const generateButton = page.locator('button:has-text("Generate")').first();
    await generateButton.click();

    // Wait for image to appear (increased timeout for API call)
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 30000 });

    // Take screenshot of result
    await page.screenshot({ path: 'tests/03-openai-result.png', fullPage: true });

    // Verify image was generated
    const generatedImage = page.locator('img[alt*="Generated"]').first();
    expect(await generatedImage.isVisible()).toBeTruthy();

    console.log('✅ OpenAI DALL-E 3 generation successful');
  });

  test('Google Gemini/Imagen Generation', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ path: 'tests/04-google-start.png', fullPage: true });

    // Select Google provider
    const googleRadio = page.locator('input[value="google"]');
    if (await googleRadio.isVisible()) {
      await googleRadio.click();
      await page.waitForTimeout(500); // Wait for UI to update
    }

    // Take screenshot after selecting Google
    await page.screenshot({ path: 'tests/05-google-selected.png', fullPage: true });

    // Enter a prompt
    const promptInput = page.locator('textarea[placeholder*="Describe"]').first();
    await promptInput.fill('A futuristic cityscape with flying cars and neon lights');

    // Select number of images (Google feature)
    const numberSelector = page.locator('select').filter({ hasText: /Number of Images/i });
    if (await numberSelector.isVisible()) {
      await numberSelector.selectOption('2');
    }

    // Take screenshot before generation
    await page.screenshot({ path: 'tests/06-google-prompt-ready.png', fullPage: true });

    // Click generate button
    const generateButton = page.locator('button:has-text("Generate")').first();
    await generateButton.click();

    // Wait for images to appear (Google can generate multiple)
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 30000 });

    // Take screenshot of result
    await page.screenshot({ path: 'tests/07-google-result.png', fullPage: true });

    // Verify images were generated
    const generatedImages = page.locator('img[alt*="Generated"]');
    const imageCount = await generatedImages.count();
    console.log(`✅ Google Gemini generated ${imageCount} image(s)`);
    expect(imageCount).toBeGreaterThan(0);
  });

  test('Provider Switching', async ({ page }) => {
    // Test switching between providers
    const openaiRadio = page.locator('input[value="openai"]');
    const googleRadio = page.locator('input[value="google"]');

    if (await openaiRadio.isVisible() && await googleRadio.isVisible()) {
      // Switch to Google
      await googleRadio.click();
      await page.waitForTimeout(300);
      
      // Check Google-specific options appear
      const aspectRatioSelector = page.locator('select').filter({ hasText: /Aspect Ratio/i });
      expect(await aspectRatioSelector.isVisible()).toBeTruthy();

      // Switch back to OpenAI
      await openaiRadio.click();
      await page.waitForTimeout(300);

      // Check OpenAI-specific options appear
      const styleSelector = page.locator('select').filter({ hasText: /Style/i });
      expect(await styleSelector.isVisible()).toBeTruthy();

      console.log('✅ Provider switching works correctly');
    }
  });

  test('Check for Auth Warnings', async ({ page }) => {
    // Listen for console warnings
    const warnings: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('getSession')) {
        warnings.push(msg.text());
      }
    });

    // Navigate and perform some actions
    await page.goto('http://localhost:3500');
    await page.waitForLoadState('networkidle');

    // Try generating an image to trigger API calls
    const promptInput = page.locator('textarea[placeholder*="Describe"]').first();
    await promptInput.fill('Test prompt');
    
    const generateButton = page.locator('button:has-text("Generate")').first();
    if (await generateButton.isEnabled()) {
      await generateButton.click();
      await page.waitForTimeout(3000);
    }

    // Check if any auth warnings were logged
    if (warnings.length > 0) {
      console.log('⚠️ Auth warnings found:', warnings);
    } else {
      console.log('✅ No auth warnings detected');
    }

    expect(warnings.length).toBe(0);
  });
});