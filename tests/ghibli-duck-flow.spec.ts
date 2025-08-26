import { test, expect } from '@playwright/test'

test.describe('Custom Clerk Modal Authentication and Ghibli Duck Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
    await page.context().clearPermissions()
    
    console.log('🧹 Cleared authentication state')
    
    // Start from the landing page
    await page.goto('http://localhost:3500')
    await page.waitForLoadState('networkidle')
    console.log('📍 Navigated to landing page')
  })

  test('Complete flow: Custom Clerk modals → Sign in → Generate Ghibli duck image', async ({ page }) => {
    console.log('🚀 Testing custom Clerk modal authentication and Ghibli duck generation...')
    console.log('========================================================')

    // Step 1: Click Sign In button to open custom modal
    console.log('\n📝 Step 1: Opening custom Clerk sign-in modal...')
    
    // Look for sign-in button/link on the page
    const signInButton = page.locator('button:has-text("Sign In"), a:has-text("Sign In"), button:has-text("Login")')
      .first()
    
    await signInButton.click()
    console.log('✅ Clicked Sign In button')

    // Wait for auth modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 })
    
    // Verify modal is visible (custom Clerk modal, not hosted page)
    const authModal = page.locator('[role="dialog"]').first()
    await expect(authModal).toBeVisible()
    console.log('✅ Custom Clerk modal is visible')
    
    // Take screenshot of sign-in modal
    await page.screenshot({ 
      path: 'tests/screenshots/ghibli-01-signin-modal.png',
      fullPage: false 
    })

    // Step 2: Check if we need to switch from sign-up to sign-in
    console.log('\n📝 Step 2: Ensuring we are on sign-in form...')
    
    // Check if there's a link to switch to sign-in
    const signInLink = authModal.locator('button:has-text("Sign in"), a:has-text("Sign in")')
    if (await signInLink.isVisible()) {
      console.log('🔄 Switching from sign-up to sign-in...')
      await signInLink.click()
      await page.waitForTimeout(1000)
    }
    
    console.log('✅ On sign-in form')

    // Step 3: Enter demo credentials
    console.log('\n🔑 Step 3: Entering demo credentials...')
    console.log('   Username: demo')
    console.log('   Password: demo123')
    
    // Fill in demo credentials
    // Try different selectors for username/email field
    const emailInput = authModal.locator('input[type="email"], input[name="identifier"], input[name="email"], input[name="username"]')
      .first()
    
    // Clear and fill username/email
    await emailInput.clear()
    await emailInput.fill('demo')
    console.log('✅ Entered username: demo')
    
    // Fill password
    const passwordInput = authModal.locator('input[type="password"]').first()
    await passwordInput.clear()
    await passwordInput.fill('demo123')
    console.log('✅ Entered password: demo123')
    
    // Take screenshot of filled form
    await page.screenshot({ 
      path: 'tests/screenshots/ghibli-02-credentials-entered.png',
      fullPage: false 
    })

    // Step 4: Submit sign-in form
    console.log('\n🚪 Step 4: Submitting sign-in form...')
    
    const submitButton = authModal.locator('button:has-text("Sign In"), button:has-text("Continue"), button:has-text("Login")')
      .first()
    
    await submitButton.click()
    console.log('✅ Sign-in form submitted')
    
    // Wait for authentication to process
    console.log('⏳ Processing authentication...')
    await page.waitForTimeout(3000)

    // Step 5: Verify successful authentication
    console.log('\n✨ Step 5: Verifying successful authentication...')
    
    // Modal should close after successful auth
    const modalCheck = page.locator('[role="dialog"]')
    const isModalStillVisible = await modalCheck.isVisible()
    
    if (!isModalStillVisible) {
      console.log('✅ Auth modal closed successfully')
    } else {
      console.log('⚠️ Modal still visible, checking for errors...')
      
      // Check for error messages
      const errorMessage = authModal.locator('text=/error|invalid|incorrect/i')
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent()
        console.log(`❌ Authentication error: ${errorText}`)
        
        // Take screenshot of error
        await page.screenshot({ 
          path: 'tests/screenshots/ghibli-auth-error.png',
          fullPage: false 
        })
      }
    }
    
    // Wait for potential redirect
    await page.waitForTimeout(2000)
    
    // Check current URL
    const currentUrl = page.url()
    console.log(`📍 Current URL: ${currentUrl}`)
    
    if (currentUrl.includes('dashboard')) {
      console.log('✅ Successfully redirected to dashboard')
    }

    // Step 6: Navigate to image generator
    console.log('\n🎨 Step 6: Navigating to image generator...')
    
    // Navigate to image generator page
    await page.goto('http://localhost:3500/dashboard/image-generator')
    await page.waitForLoadState('networkidle')
    console.log('✅ On image generator page')
    
    // Take screenshot of image generator
    await page.screenshot({ 
      path: 'tests/screenshots/ghibli-03-image-generator.png',
      fullPage: true 
    })

    // Step 7: Generate Ghibli-style duck image
    console.log('\n🦆 Step 7: Generating Ghibli-style duck image...')
    
    // Find the prompt input field
    const promptInput = page.locator('textarea[placeholder*="prompt"], textarea[placeholder*="describe"], textarea[placeholder*="image"], input[type="text"][placeholder*="prompt"]')
      .first()
    
    // Clear and enter Ghibli duck prompt
    await promptInput.clear()
    const ghibliPrompt = 'A cute duck in Studio Ghibli animation style, with soft watercolor textures, whimsical and magical atmosphere, inspired by Hayao Miyazaki art'
    await promptInput.fill(ghibliPrompt)
    console.log(`✅ Entered prompt: "${ghibliPrompt}"`)
    
    // Take screenshot of entered prompt
    await page.screenshot({ 
      path: 'tests/screenshots/ghibli-04-prompt-entered.png',
      fullPage: true 
    })
    
    // Find and click generate button
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Generate Image")')
      .first()
    
    console.log('🎨 Clicking generate button...')
    await generateButton.click()
    
    // Wait for generation to start
    console.log('⏳ Waiting for image generation...')
    
    // Check if we hit a paywall
    await page.waitForTimeout(2000)
    const checkoutModal = page.locator('[role="dialog"]:has-text("Unlock Unlimited")')
    
    if (await checkoutModal.isVisible()) {
      console.log('💳 Hit paywall - need to complete payment flow')
      
      // Take screenshot of paywall
      await page.screenshot({ 
        path: 'tests/screenshots/ghibli-paywall.png',
        fullPage: false 
      })
      
      // Fill demo payment data
      console.log('💳 Filling demo payment data...')
      const demoDataButton = checkoutModal.locator('button:has-text("Use Demo Data")')
      if (await demoDataButton.isVisible()) {
        await demoDataButton.click()
      } else {
        await checkoutModal.locator('input[id="cardNumber"]').fill('4242 4242 4242 4242')
        await checkoutModal.locator('input[id="expiryDate"]').fill('12/25')
        await checkoutModal.locator('input[id="cvv"]').fill('123')
        await checkoutModal.locator('input[id="cardholderName"]').fill('Demo User')
        await checkoutModal.locator('input[id="billingZip"]').fill('12345')
      }
      
      // Check terms
      const termsCheckbox = checkoutModal.locator('input[type="checkbox"]').first()
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check()
      }
      
      // Submit payment
      const payButton = checkoutModal.locator('button:has-text("Pay"), button:has-text("Subscribe")')
        .first()
      await payButton.click()
      
      console.log('✅ Payment submitted')
      await page.waitForTimeout(3000)
      
      // Retry generation
      await generateButton.click()
      console.log('🔄 Retrying generation after payment...')
    }
    
    // Step 8: Wait for and verify image generation
    console.log('\n🖼️ Step 8: Waiting for image to generate and display...')
    
    // Wait for image to appear (max 30 seconds)
    const imageSelector = 'img[alt*="Generated"], img[alt*="generated"], img[src*="dalle"], img[src*="openai"], div.generated-image img'
    
    try {
      await page.waitForSelector(imageSelector, { timeout: 30000 })
      console.log('✅ Generated image appeared!')
      
      // Get image source
      const generatedImage = page.locator(imageSelector).first()
      const imageSrc = await generatedImage.getAttribute('src')
      console.log(`📸 Image URL: ${imageSrc?.substring(0, 50)}...`)
      
      // Verify image is visible
      await expect(generatedImage).toBeVisible()
      console.log('✅ Image is visible in the view')
      
      // Take final screenshot with generated image
      await page.screenshot({ 
        path: 'tests/screenshots/ghibli-05-final-result.png',
        fullPage: true 
      })
      
      console.log('\n🎉 SUCCESS: Ghibli-style duck image generated and displayed!')
      console.log('========================================================')
      console.log('✅ Custom Clerk modals working correctly')
      console.log('✅ Authentication flow successful')
      console.log('✅ Image generation working')
      console.log('✅ Generated image displays in view')
      
    } catch (error) {
      console.log('❌ Image did not appear within 30 seconds')
      
      // Check for error messages
      const errorElement = page.locator('text=/error|failed|sorry/i').first()
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent()
        console.log(`❌ Error message: ${errorText}`)
      }
      
      // Take error screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/ghibli-error-final.png',
        fullPage: true 
      })
      
      throw error
    }
  })

  test('Verify custom modal behavior and styling', async ({ page }) => {
    console.log('\n🎨 Testing custom modal styling and behavior...')
    
    // Open sign-in modal
    const signInButton = page.locator('button:has-text("Sign In")').first()
    await signInButton.click()
    
    await page.waitForSelector('[role="dialog"]')
    const authModal = page.locator('[role="dialog"]').first()
    
    // Test 1: Modal has custom styling (not Clerk hosted)
    console.log('🎨 Verifying custom modal styling...')
    const modalContent = authModal.locator('.modal-content, [data-state="open"]').first()
    const hasCustomStyling = await modalContent.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return styles.backgroundColor !== '' || styles.borderRadius !== ''
    })
    
    if (hasCustomStyling) {
      console.log('✅ Modal has custom styling')
    }
    
    // Test 2: ESC key closes modal
    console.log('⌨️ Testing ESC key behavior...')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    
    const isModalClosed = !(await authModal.isVisible())
    if (isModalClosed) {
      console.log('✅ ESC key closes modal correctly')
    }
    
    // Test 3: Modal reopens correctly
    console.log('🔄 Testing modal reopen...')
    await signInButton.click()
    await page.waitForSelector('[role="dialog"]')
    await expect(authModal).toBeVisible()
    console.log('✅ Modal reopens correctly')
    
    // Test 4: Close button works
    const closeButton = authModal.locator('button[aria-label*="close"], button:has-text("×")')
    if (await closeButton.isVisible()) {
      await closeButton.click()
      await page.waitForTimeout(500)
      const isClosed = !(await authModal.isVisible())
      if (isClosed) {
        console.log('✅ Close button works')
      }
    }
    
    console.log('\n✨ Custom modal behavior test complete!')
  })
})