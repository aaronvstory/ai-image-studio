// Manual test script to verify authentication flow
// Run this in browser console at http://localhost:3500

console.log('🧪 Starting manual authentication test...');

// Test 1: Check if Clerk is loaded
setTimeout(() => {
  console.log('1️⃣ Testing Clerk loading...');
  if (window.Clerk) {
    console.log('✅ Clerk is loaded:', window.Clerk);
  } else {
    console.log('❌ Clerk is NOT loaded');
  }
}, 2000);

// Test 2: Check if Login button works
setTimeout(() => {
  console.log('2️⃣ Testing Login button...');
  const loginButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Login'));
  if (loginButton) {
    console.log('✅ Login button found:', loginButton);
    // Click the login button
    loginButton.click();
    console.log('🖱️ Login button clicked');
  } else {
    console.log('❌ Login button NOT found');
  }
}, 3000);

// Test 3: Check if auth modal appears
setTimeout(() => {
  console.log('3️⃣ Testing auth modal...');
  const modal = document.querySelector('[role="dialog"]');
  if (modal) {
    console.log('✅ Auth modal found:', modal);
  } else {
    console.log('❌ Auth modal NOT found');
  }
}, 4000);

// Test 4: Test switching to Text to Image tab
setTimeout(() => {
  console.log('4️⃣ Testing Text to Image tab...');
  const textTab = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Text to Image'));
  if (textTab) {
    console.log('✅ Text to Image tab found:', textTab);
    textTab.click();
    console.log('🖱️ Text to Image tab clicked');
    
    // Check placeholder text
    setTimeout(() => {
      const textInput = document.querySelector('input[placeholder*="futuristic"]');
      if (textInput) {
        console.log('✅ Text input found with correct placeholder:', textInput.placeholder);
      } else {
        console.log('❌ Text input with correct placeholder NOT found');
      }
    }, 500);
  } else {
    console.log('❌ Text to Image tab NOT found');
  }
}, 5000);

console.log('✅ Manual test script loaded. Watch console for results...');
