const { chromium } = require("playwright");

async function testAuthentication() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🚀 Starting authentication test...");
  
  try {
    // Step 1: Check /api/debug for Supabase status
    console.log("📊 Checking /api/debug...");
    await page.goto("https://ai-image-studio-gamma.vercel.app/api/debug");
    await page.waitForTimeout(2000);
    
    const debugResponse = await page.textContent("body");
    console.log("Debug API Response:", debugResponse);
    
    // Step 2: Navigate to main app
    console.log("🏠 Navigating to main application...");
    await page.goto("https://ai-image-studio-gamma.vercel.app");
    await page.waitForTimeout(3000);
    
    // Check for console errors on main page
    const mainPageErrors = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        mainPageErrors.push(msg.text());
      }
    });
    
    // Step 3: Navigate to signup page
    console.log("📝 Navigating to signup page...");
    await page.goto("https://ai-image-studio-gamma.vercel.app/auth/signup");
    await page.waitForTimeout(3000);
    
    // Capture any console errors
    const consoleErrors = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
        console.log("❌ Console Error:", msg.text());
      }
    });
    
    // Check if signup form exists
    const signupForm = await page.$("form");
    if (!signupForm) {
      console.log("⚠️  No signup form found on page");
    }
    
    // Step 4: Try to fill signup form
    console.log("✍️  Attempting to fill signup form...");
    
    // Look for email input
    const emailInput = await page.$("input[type=\"email\"], input[name=\"email\"], input[placeholder*=\"email\" i]");
    if (emailInput) {
      await emailInput.fill("test@example.com");
      console.log("✅ Email filled: test@example.com");
    } else {
      console.log("❌ No email input found");
    }
    
    // Look for password input  
    const passwordInput = await page.$("input[type=\"password\"], input[name=\"password\"]");
    if (passwordInput) {
      await passwordInput.fill("Test123!");
      console.log("✅ Password filled");
    } else {
      console.log("❌ No password input found");
    }
    
    // Step 5: Monitor network requests
    const networkRequests = [];
    const networkErrors = [];
    
    page.on("request", request => {
      networkRequests.push({
        url: request.url(),
        method: request.method()
      });
    });
    
    page.on("requestfailed", request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure()?.errorText
      });
      console.log("🌐 Network Error:", request.url(), request.failure()?.errorText);
    });
    
    // Step 6: Try to submit form
    const submitButton = await page.$("button[type=\"submit\"], button:has-text(\"Sign Up\"), button:has-text(\"Create Account\")");
    if (submitButton) {
      console.log("🔄 Clicking submit button...");
      
      // Wait for network response
      const responsePromise = page.waitForResponse(response => 
        response.url().includes("/auth/") || response.url().includes("/api/")
      ).catch(() => null);
      
      await submitButton.click();
      
      const response = await responsePromise;
      if (response) {
        console.log("📡 Response received:", response.url(), response.status());
        const responseBody = await response.text().catch(() => "Unable to read response");
        console.log("Response body:", responseBody.substring(0, 500));
      }
      
      await page.waitForTimeout(5000);
    } else {
      console.log("❌ No submit button found");
    }
    
    // Step 7: Check final page state
    const currentUrl = page.url();
    const pageTitle = await page.title();
    
    console.log("\n📋 FINAL RESULTS:");
    console.log("Current URL:", currentUrl);
    console.log("Page Title:", pageTitle);
    console.log("Console Errors:", consoleErrors);
    console.log("Network Errors:", networkErrors);
    console.log("Main Page Errors:", mainPageErrors);
    
    // Take screenshot for visual debugging
    await page.screenshot({ 
      path: "auth-test-final.png", 
      fullPage: true 
    });
    console.log("📸 Screenshot saved: auth-test-final.png");
    
  } catch (error) {
    console.error("❌ Test Error:", error.message);
  } finally {
    await browser.close();
  }
}

testAuthentication();
