import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = 'http://localhost:3500'
const CLERK_SIGN_UP_URL = 'https://your-clerk-instance.accounts.dev/sign-up'
const CLERK_SIGN_IN_URL = 'https://your-clerk-instance.accounts.dev/sign-in'

// Test credentials (use unique email for each test run)
const testEmail = `test-${Date.now()}@example.com`
const testPassword = 'TestPassword123!'

test.describe('Seamless Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
  })

  test('Complete authentication and payment flow', async ({ page }) => {
    // Step 1: Try to generate without auth
    console.log('Step 1: Testing generation without authentication...')
    
    // Scroll to generator section
    await page.evaluate(() => {
      document.getElementById('image-generator')?.scrollIntoView({ behavior: 'smooth' })
    })
    await page.waitForTimeout(1000)

    // Enter a prompt
    await page.fill('textarea[placeholder*="Describe your vision"]', 'A beautiful sunset over mountains')
    
    // Click generate button
    await page.click('button:has-text("Generate")')
    
    // Should redirect to sign-up page
    await page.waitForURL(/sign-up/, { timeout: 10000 })
    expect(page.url()).toContain('sign-up')
    console.log('✓ Successfully redirected to sign-up page')

    // Step 2: Sign up with test credentials
    console.log('Step 2: Signing up with test credentials...')
    
    // Fill sign-up form (Clerk hosted page)
    await page.fill('input[name="emailAddress"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    
    // Submit sign-up
    await page.click('button[type="submit"]')
    
    // Wait for redirect back to app
    await page.waitForURL(`${BASE_URL}/**`, { timeout: 15000 })
    console.log('✓ Successfully signed up and redirected back')

    // Step 3: Generate free image
    console.log('Step 3: Testing free generation...')
    
    // Ensure we're on the dashboard
    if (!page.url().includes('/dashboard')) {
      await page.goto(`${BASE_URL}/dashboard`)
    }
    
    // Enter prompt again
    await page.fill('textarea[placeholder*="Describe your vision"]', 'A magical forest with glowing trees')
    
    // Click generate
    await page.click('button:has-text("Generate")')
    
    // Wait for image to generate (demo mode returns quickly)
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 10000 })
    console.log('✓ Successfully generated free image')

    // Step 4: Try second generation (should trigger paywall)
    console.log('Step 4: Testing paywall after free generation...')
    
    // Clear prompt and enter new one
    await page.fill('textarea[placeholder*="Describe your vision"]', 'A futuristic city skyline')
    
    // Click generate again
    await page.click('button:has-text("Generate")')
    
    // Should open checkout modal
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
    const modalTitle = await page.textContent('h2')
    expect(modalTitle).toContain('Upgrade')
    console.log('✓ Checkout modal opened successfully')

    // Step 5: Complete payment
    console.log('Step 5: Processing demo payment...')
    
    // Fill payment form
    await page.fill('input[placeholder*="John Doe"]', 'Test User')
    await page.fill('input[placeholder*="4242"]', '4242424242424242') // Demo card
    await page.fill('input[placeholder*="MM/YY"]', '12/25')
    await page.fill('input[placeholder*="123"]', '123')
    
    // Billing address
    await page.fill('input[placeholder*="123 Main St"]', '123 Test Street')
    await page.fill('input[placeholder*="New York"]', 'Test City')
    await page.selectOption('select', 'CA')
    await page.fill('input[placeholder*="10001"]', '90001')
    
    // Submit payment
    await page.click('button:has-text("Complete Purchase")')
    
    // Wait for success message
    await page.waitForSelector('text=/Payment successful/i', { timeout: 10000 })
    console.log('✓ Payment processed successfully')

    // Step 6: Generate unlimited images
    console.log('Step 6: Testing unlimited generation after payment...')
    
    // Generate first paid image
    await page.fill('textarea[placeholder*="Describe your vision"]', 'A dragon flying over a castle')
    await page.click('button:has-text("Generate")')
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 10000 })
    console.log('✓ First paid generation successful')

    // Generate second paid image
    await page.fill('textarea[placeholder*="Describe your vision"]', 'An underwater coral reef')
    await page.click('button:has-text("Generate")')
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 10000 })
    console.log('✓ Second paid generation successful')

    console.log('✅ All authentication flow tests passed!')
  })

  test('Existing user sign-in flow', async ({ page }) => {
    console.log('Testing sign-in flow for existing users...')
    
    // Navigate to sign-in
    await page.goto(`${BASE_URL}/sign-in`)
    
    // Use demo credentials
    await page.fill('input[name="identifier"]', 'demo@example.com')
    await page.fill('input[name="password"]', 'demo123')
    
    // Submit sign-in
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 })
    
    // Verify user is signed in by checking for UserButton
    await expect(page.locator('[aria-label="Open user button"]')).toBeVisible()
    
    console.log('✓ Successfully signed in existing user')
  })
})