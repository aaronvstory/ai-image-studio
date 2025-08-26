const { chromium } = require("playwright");

async function testSignupWithCorrectSelectors() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🚀 Testing signup with correct selectors...");
  
  // Capture network and console activity
  const networkLogs = [];
  const consoleMessages = [];
  
  page.on("request", request => {
    if (request.url().includes("/api/") || request.url().includes("/auth/")) {
      networkLogs.push({
        type: "REQUEST",
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on("response", response => {
    if (response.url().includes("/api/") || response.url().includes("/auth/")) {
      networkLogs.push({
        type: "RESPONSE",
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on("requestfailed", request => {
    networkLogs.push({
      type: "FAILED",
      url: request.url(),
      error: request.failure()?.errorText,
      timestamp: new Date().toISOString()
    });
  });
  
  page.on("console", msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
    
    if (msg.type() === "error" || msg.type() === "warning") {
      console.log("Console " + msg.type().toUpperCase() + ": " + msg.text());
    }
  });
  
  try {
    // Navigate to signup
    console.log("📝 Navigating to signup page...");
    await page.goto("https://ai-image-studio-gamma.vercel.app/auth/signup");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    
    // Fill form using input order (since no names)
    console.log("✍️ Filling signup form...");
    
    // Email (first input)
    const emailInput = await page.$("input[type=\"email\"]");
    if (emailInput) {
      await emailInput.fill("test@example.com");
      console.log("✅ Email filled: test@example.com");
    } else {
      console.log("❌ Email input not found");
    }
    
    // Password (first password input)
    const passwordInputs = await page.$$("input[type=\"password\"]");
    if (passwordInputs.length >= 1) {
      await passwordInputs[0].fill("Test123\!");
      console.log("✅ Password filled");
    } else {
      console.log("❌ Password input not found");
    }
    
    // Confirm Password (second password input)
    if (passwordInputs.length >= 2) {
      await passwordInputs[1].fill("Test123\!");
      console.log("✅ Confirm password filled");
    } else {
      console.log("❌ Confirm password input not found");
    }
    
    // Take screenshot before submission
    await page.screenshot({ 
      path: "before-final-submit.png", 
      fullPage: true 
    });
    console.log("📸 Screenshot taken: before-final-submit.png");
    
    // Submit form
    console.log("🔄 Submitting form...");
    
    const submitButton = await page.$("button[type=\"submit\"]");
    if (submitButton) {
      // Wait for potential navigation or API response
      const navigationPromise = page.waitForNavigation({ timeout: 10000 }).catch(() => null);
      const responsePromise = page.waitForResponse(response => 
        response.url().includes("/api/") || 
        response.url().includes("/auth/")
      , { timeout: 10000 }).catch(() => null);
      
      await submitButton.click();
      console.log("✅ Submit button clicked");
      
      // Wait for either navigation or response
      const [navigation, response] = await Promise.all([navigationPromise, responsePromise]);
      
      if (response) {
        console.log("📡 API Response: " + response.url() + " - Status: " + response.status());
        try {
          const responseBody = await response.text();
          console.log("Response Body:", responseBody.substring(0, 500));
        } catch (e) {
          console.log("Cannot read response body");
        }
      }
      
      if (navigation) {
        console.log("🔄 Navigation occurred to: " + page.url());
      }
      
      // Wait a bit more to see final state
      await page.waitForTimeout(5000);
    }
    
    // Final results
    const finalUrl = page.url();
    const finalTitle = await page.title();
    
    console.log("\n📋 FINAL TEST RESULTS:");
    console.log("=".repeat(60));
    console.log("Final URL: " + finalUrl);
    console.log("Final Title: " + finalTitle);
    
    // Check for success/error messages on page
    const successMessages = await page.$$("[class*=\"success\"], .text-green");
    const errorMessages = await page.$$("[class*=\"error\"], .text-red, .text-destructive");
    
    console.log("\n📋 PAGE MESSAGES:");
    console.log("Success messages: " + successMessages.length);
    console.log("Error messages: " + errorMessages.length);
    
    for (let i = 0; i < errorMessages.length; i++) {
      const element = errorMessages[i];
      const text = await element.textContent();
      console.log("  Error: " + text?.trim());
    }
    
    // Console errors summary
    const errors = consoleMessages.filter(msg => msg.type === "error");
    const warnings = consoleMessages.filter(msg => msg.type === "warning");
    
    console.log("\n📋 CONSOLE SUMMARY:");
    console.log("Console errors: " + errors.length);
    console.log("Console warnings: " + warnings.length);
    
    // Network activity summary
    const requests = networkLogs.filter(log => log.type === "REQUEST");
    const responses = networkLogs.filter(log => log.type === "RESPONSE");
    const failures = networkLogs.filter(log => log.type === "FAILED");
    
    console.log("\n🌐 NETWORK SUMMARY:");
    console.log("API requests made: " + requests.length);
    console.log("API responses received: " + responses.length);
    console.log("Failed requests: " + failures.length);
    
    requests.forEach(req => {
      console.log("  → " + req.method + " " + req.url);
    });
    
    responses.forEach(resp => {
      console.log("  ← " + resp.status + " " + resp.url);
    });
    
    failures.forEach(fail => {
      console.log("  ❌ " + fail.url + " - " + fail.error);
    });
    
    // Final screenshot
    await page.screenshot({ 
      path: "final-signup-result.png", 
      fullPage: true 
    });
    console.log("\n📸 Final screenshot: final-signup-result.png");
    
  } catch (error) {
    console.error("❌ Test Error:", error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testSignupWithCorrectSelectors();
