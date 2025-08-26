import { test, expect } from '@playwright/test';

test.describe('Visual UI Testing', () => {
  test('Landing page displays correctly', async ({ page }) => {
    await page.goto('http://localhost:3500');
    
    // Check trust badge is visible and not breaking
    const trustBadge = page.locator('text=Rated #1 AI Image Generator');
    await expect(trustBadge).toBeVisible();
    
    // Verify trust badge text is on single line on desktop
    const badgeBox = await trustBadge.boundingBox();
    if (badgeBox) {
      // On desktop, height should be less than 50px for single line
      expect(badgeBox.height).toBeLessThan(50);
    }
    
    // Check navigation links work
    await page.click('text=Features');
    await page.waitForURL('**/dashboard/image-generator');
    await page.goBack();
    
    await page.click('text=Pricing');
    await page.waitForURL('**/checkout');
    await page.goBack();
    
    // Check hero section animations
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Start Creating for Free')).toBeVisible();
    
    // Take screenshot for visual reference
    await page.screenshot({ path: 'screenshots/landing-page.png', fullPage: true });
  });

  test('Sign up flow works', async ({ page }) => {
    await page.goto('http://localhost:3500');
    
    // Click sign up button
    await page.click('text=Sign Up');
    await page.waitForURL('**/sign-up');
    
    // Check Clerk sign up form is loaded
    await expect(page.locator('input[name="emailAddress"]')).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: 'screenshots/signup-page.png' });
  });

  test('Sign in flow works', async ({ page }) => {
    await page.goto('http://localhost:3500');
    
    // Click login button
    await page.click('text=Login');
    await page.waitForURL('**/sign-in');
    
    // Check Clerk sign in form is loaded
    await expect(page.locator('input[name="identifier"]')).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: 'screenshots/signin-page.png' });
  });

  test('Checkout page displays correctly', async ({ page }) => {
    await page.goto('http://localhost:3500/checkout');
    
    // Check checkout form elements
    await expect(page.locator('text=Complete Your Purchase')).toBeVisible();
    await expect(page.locator('text=AI Image Generation - Pro Plan')).toBeVisible();
    await expect(page.locator('text=$29.99')).toBeVisible();
    
    // Check demo mode notification
    await expect(page.locator('text=Demo Mode')).toBeVisible();
    
    // Fill demo data
    await page.click('text=Fill Demo Data');
    
    // Verify fields are filled
    await expect(page.locator('input[id="email"]')).toHaveValue('demo@example.com');
    await expect(page.locator('input[id="cardNumber"]')).toHaveValue('4242 4242 4242 4242');
    
    await page.screenshot({ path: 'screenshots/checkout-page.png', fullPage: true });
  });

  test('Footer links are functional', async ({ page }) => {
    await page.goto('http://localhost:3500');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer is visible
    await expect(page.locator('footer')).toBeVisible();
    
    // Test footer navigation links
    const footerLinks = [
      { text: 'Features', url: '/dashboard/image-generator' },
      { text: 'Dashboard', url: '/dashboard' },
      { text: 'Pricing', url: '/checkout' }
    ];
    
    for (const link of footerLinks) {
      const linkElement = page.locator(`footer >> text=${link.text}`);
      await expect(linkElement).toBeVisible();
      const href = await linkElement.getAttribute('href');
      expect(href).toBe(link.url);
    }
    
    // Check social links open in new tab
    const socialLinks = ['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'TikTok'];
    for (const social of socialLinks) {
      const socialLink = page.locator(`footer >> [aria-label="${social}"]`);
      await expect(socialLink).toHaveAttribute('target', '_blank');
    }
    
    await page.screenshot({ path: 'screenshots/footer.png' });
  });

  test('Responsive design works', async ({ page }) => {
    await page.goto('http://localhost:3500');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'screenshots/mobile-view.png', fullPage: true });
    
    // Check mobile menu button is visible
    await expect(page.locator('button[aria-label*="Menu"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'screenshots/tablet-view.png', fullPage: true });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: 'screenshots/desktop-view.png', fullPage: true });
    
    // Verify trust badge stays on one line on desktop
    const trustBadge = page.locator('text=Rated #1 AI Image Generator');
    const badgeBox = await trustBadge.boundingBox();
    if (badgeBox) {
      expect(badgeBox.height).toBeLessThan(50);
    }
  });
});