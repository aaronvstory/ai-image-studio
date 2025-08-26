const puppeteer = require('puppeteer');

const BASE_URL = 'https://ai-image-studio-gamma.vercel.app';
const TEST_EMAIL = `testuser${Date.now()}@gmail.com`;
const TEST_PASSWORD = 'SecureTest123!';

async function testFullUserJourney() {
  console.log('🚀 Starting Full User Journey Test');
  console.log('================================');
  console.log(`URL: ${BASE_URL}`);
  console.log(`Test Email: ${TEST_EMAIL}`);
  console.log(`Test Password: ${TEST_PASSWORD}`);
  console.log('================================\n');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    // Step 1: Test Sign Up
    console.log('📝 Step 1: Testing Sign Up...');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle2' });
    
    // Fill signup form
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', TEST_EMAIL);
    await page.type('input[type="password"]', TEST_PASSWORD);
    
    // Find confirm password field and fill it
    const passwordFields = await page.$$('input[type="password"]');
    if (passwordFields.length > 1) {
      await passwordFields[1].type(TEST_PASSWORD);
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect or success message
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    
    const currentUrl = page.url();
    console.log(`✅ Signup complete. Redirected to: ${currentUrl}`);
    
    // Step 2: Navigate to Dashboard
    console.log('\n📊 Step 2: Navigating to Dashboard...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    
    // Step 3: Test First Free Image Generation
    console.log('\n🎨 Step 3: Testing Free Image Generation...');
    
    // Wait for the prompt input
    await page.waitForSelector('textarea, input[type="text"]', { timeout: 5000 });
    
    // Enter a prompt
    const promptInput = await page.$('textarea') || await page.$('input[type="text"]');
    await promptInput.type('A beautiful sunset over mountains with golden clouds');
    
    // Find and click generate button
    const generateButton = await page.$('button:has-text("Generate"), button:has-text("Create")');
    if (generateButton) {
      await generateButton.click();
    } else {
      // Try clicking any button with Generate-like text
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const generateBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('generate') || 
          btn.textContent.toLowerCase().includes('create')
        );
        if (generateBtn) generateBtn.click();
      });
    }
    
    console.log('⏳ Waiting for image generation...');
    
    // Wait for image to appear or error message
    await page.waitForSelector('img[src*="blob"], img[src*="openai"], img[src*="unsplash"], .error-message', { 
      timeout: 30000 
    }).catch(() => console.log('⚠️ Image generation timeout'));
    
    // Check if image was generated
    const imageGenerated = await page.$('img[src*="blob"], img[src*="openai"], img[src*="unsplash"]');
    if (imageGenerated) {
      console.log('✅ Free image generated successfully!');
    } else {
      console.log('❌ Image generation failed or payment required');
    }
    
    // Step 4: Test Second Image (Should Trigger Payment)
    console.log('\n💳 Step 4: Testing Payment Gate (2nd Image)...');
    
    // Clear the prompt and enter new one
    await promptInput.click({ clickCount: 3 }); // Select all
    await promptInput.type('A futuristic city skyline at night');
    
    // Try to generate again
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const generateBtn = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('generate') || 
        btn.textContent.toLowerCase().includes('create')
      );
      if (generateBtn) generateBtn.click();
    });
    
    // Check for payment modal
    await page.waitForSelector('.modal, [role="dialog"], .checkout-modal', { timeout: 5000 })
      .then(() => console.log('✅ Payment modal appeared!'))
      .catch(() => console.log('❌ Payment modal did not appear'));
    
    // Step 5: Test Payment Process
    console.log('\n💰 Step 5: Testing Payment Process...');
    
    // Look for card input field
    const cardInput = await page.$('input[placeholder*="Card"], input[placeholder*="4242"]');
    if (cardInput) {
      await cardInput.type('4242424242424242');
      
      // Fill other payment fields if present
      const expiryInput = await page.$('input[placeholder*="MM/YY"], input[placeholder*="Expiry"]');
      if (expiryInput) await expiryInput.type('12/25');
      
      const cvvInput = await page.$('input[placeholder*="CVV"], input[placeholder*="CVC"]');
      if (cvvInput) await cvvInput.type('123');
      
      const nameInput = await page.$('input[placeholder*="Name"]');
      if (nameInput) await nameInput.type('Test User');
      
      // Submit payment
      const payButton = await page.$('button:has-text("Pay"), button:has-text("Subscribe"), button:has-text("Upgrade")');
      if (payButton) {
        await payButton.click();
        console.log('✅ Payment submitted');
        
        // Wait for payment processing
        await page.waitForTimeout(3000);
        
        // Check if payment succeeded
        const successMessage = await page.$('.success, .toast-success');
        if (successMessage) {
          console.log('✅ Payment processed successfully!');
        }
      }
    } else {
      console.log('⚠️ Could not find payment form');
    }
    
    // Final Status Check
    console.log('\n📋 Final Status Check...');
    
    // Check user metadata
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/debug');
        return await res.json();
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('Debug API Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    console.log('\n🏁 Test Complete!');
    // Keep browser open for manual inspection
    console.log('Browser will remain open for inspection. Press Ctrl+C to exit.');
  }
}

// Run the test
testFullUserJourney().catch(console.error);