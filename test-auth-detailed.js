const { chromium } = require("playwright");

async function testAuthenticationDetailed() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🚀 Starting detailed authentication test...");
  
  // Capture all network activity
  const networkLogs = [];
  const consoleMessages = [];
  
  page.on("request", request => {
    networkLogs.push({
      type: "REQUEST",
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      timestamp: new Date().toISOString()
    });
  });
  
  page.on("response", response => {
    networkLogs.push({
      type: "RESPONSE",
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
      timestamp: new Date().toISOString()
    });
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
    
    if (msg.type() === "error") {
      console.log("Console " + msg.type().toUpperCase() + ": " + msg.text());
    }
  });
  
  try {
    // Step 1: Check Supabase connection
    console.log("📊 Testing /api/debug endpoint...");
    await page.goto("https://ai-image-studio-gamma.vercel.app/api/debug");
    await page.waitForTimeout(2000);
    
    const debugData = await page.textContent("body");
    console.log("Debug Response:", JSON.stringify(JSON.parse(debugData), null, 2));
    
    // Step 2: Navigate to signup
    console.log("📝 Navigating to signup page...");
    await page.goto("https://ai-image-studio-gamma.vercel.app/auth/signup");
    await page.waitForLoadState("networkidle");
    
    // Step 3: Fill complete form
    console.log("✍️ Filling signup form completely...");
    
    // Email field
    await page.fill("input[name=\"email\"]", "test@example.com");
    console.log("✅ Email filled");
    
    // Password field
    await page.fill("input[name=\"password\"]", "Test123\!");
    console.log("✅ Password filled");
    
    // Confirm password field - try multiple selectors
    const confirmFields = await page.$$("input[type=\"password\"]");
    if (confirmFields.length >= 2) {
      await confirmFields[1].fill("Test123\!");
      console.log("✅ Confirm password filled");
    } else {
      console.log("❌ Confirm password field not found");
    }
    
    // Take screenshot before submission
    await page.screenshot({ 
      path: "before-submit.png", 
      fullPage: true 
    });
    
    // Step 4: Submit form
    console.log("🔄 Submitting form...");
    
    const submitButton = await page.$("button[type=\"submit\"]");
    if (submitButton) {
      // Listen for navigation or response
      const responsePromise = page.waitForResponse(response => 
        response.url().includes("/auth/") || 
        response.url().includes("/api/") ||
        response.url().includes("/sign-up") ||
        response.url().includes("/dashboard")
      ).catch(() => null);
      
      await submitButton.click();
      const response = await responsePromise;
      
      if (response) {
        console.log("Response received: " + response.url() + " - Status: " + response.status());
        try {
          const responseBody = await response.text();
          console.log("Response Body:", responseBody.substring(0, 1000));
        } catch (e) {
          console.log("Unable to read response body");
        }
      }
      
      // Wait for any changes
      await page.waitForTimeout(5000);
    }
    
    // Step 5: Check final state
    const currentUrl = page.url();
    const pageTitle = await page.title();
    
    console.log("\n📋 DETAILED TEST RESULTS:");
    console.log("=".repeat(50));
    console.log("Final URL: " + currentUrl);
    console.log("Page Title: " + pageTitle);
    
    // Console Messages Summary
    console.log("\n📋 CONSOLE MESSAGES:");
    const errorMessages = consoleMessages.filter(msg => msg.type === "error");
    const warningMessages = consoleMessages.filter(msg => msg.type === "warning");
    
    console.log("Errors: " + errorMessages.length);
    errorMessages.forEach(msg => {
      console.log("  Error: " + msg.text);
    });
    
    console.log("Warnings: " + warningMessages.length);
    warningMessages.forEach(msg => {
      console.log("  Warning: " + msg.text);
    });
    
    // Network Activity Summary
    console.log("\n🌐 NETWORK ACTIVITY:");
    const failedRequests = networkLogs.filter(log => log.type === "FAILED");
    const apiRequests = networkLogs.filter(log => 
      log.type === "REQUEST" && 
      (log.url.includes("/api/") || log.url.includes("/auth/"))
    );
    
    console.log("Failed requests: " + failedRequests.length);
    failedRequests.forEach(req => {
      console.log("  Failed: " + req.url + " - " + req.error);
    });
    
    console.log("API/Auth requests: " + apiRequests.length);
    apiRequests.forEach(req => {
      console.log("  Request: " + req.method + " " + req.url);
    });
    
    // Take final screenshot
    await page.screenshot({ 
      path: "auth-test-detailed-final.png", 
      fullPage: true 
    });
    
    console.log("\n📸 Screenshots saved: before-submit.png, auth-test-detailed-final.png");
    
  } catch (error) {
    console.error("Test Error:", error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testAuthenticationDetailed();
