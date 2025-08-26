const { chromium } = require("playwright");

async function inspectSignupPage() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🔍 Inspecting signup page...");
  
  try {
    await page.goto("https://ai-image-studio-gamma.vercel.app/auth/signup");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    
    // Get page HTML
    const pageContent = await page.content();
    console.log("Page HTML length:", pageContent.length);
    
    // Look for any forms
    const forms = await page.$$("form");
    console.log("Forms found:", forms.length);
    
    // Look for inputs
    const inputs = await page.$$("input");
    console.log("Input fields found:", inputs.length);
    
    // Get all input details
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute("type") || "text";
      const name = await input.getAttribute("name") || "no-name";
      const placeholder = await input.getAttribute("placeholder") || "no-placeholder";
      console.log("Input " + (i+1) + ":", type, name, placeholder);
    }
    
    // Look for buttons
    const buttons = await page.$$("button");
    console.log("Buttons found:", buttons.length);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute("type") || "button";
      console.log("Button " + (i+1) + ":", type, text?.trim());
    }
    
    // Check page title and URL
    console.log("Page title:", await page.title());
    console.log("Current URL:", page.url());
    
    // Take screenshot
    await page.screenshot({ 
      path: "signup-page-inspection.png", 
      fullPage: true 
    });
    
    // Check if there are any error messages
    const errorElements = await page.$$("[class*=\"error\"], .text-red, .text-destructive");
    console.log("Error elements found:", errorElements.length);
    
    for (let i = 0; i < errorElements.length; i++) {
      const element = errorElements[i];
      const text = await element.textContent();
      console.log("Error " + (i+1) + ":", text?.trim());
    }
    
  } catch (error) {
    console.error("Inspection Error:", error.message);
  } finally {
    await browser.close();
  }
}

inspectSignupPage();
