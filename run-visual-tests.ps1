#!/usr/bin/env pwsh

Write-Host "🎯 Visual Testing for AI Image Generation App" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if port 3500 is already in use
$portInUse = Get-NetTCPConnection -LocalPort 3500 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "✅ Development server appears to be running on port 3500" -ForegroundColor Green
} else {
    Write-Host "🚀 Starting development server on port 3500..." -ForegroundColor Yellow
    
    # Start dev server in background
    $devServer = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "C:\claude\gpt-new-image-gen" -PassThru -WindowStyle Minimized
    
    Write-Host "⏳ Waiting 15 seconds for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

Write-Host ""
Write-Host "📸 Running Playwright visual tests..." -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\claude\gpt-new-image-gen"

# Run the visual tests
try {
    & npx playwright test tests/visual-testing.spec.ts --reporter=line
    
    Write-Host ""
    Write-Host "📁 Opening test results..." -ForegroundColor Green
    
    if (Test-Path "test-results") {
        # Open test results folder
        Invoke-Item "test-results"
        Write-Host "✅ Visual test screenshots have been saved to test-results folder" -ForegroundColor Green
    } else {
        Write-Host "❌ No test results folder found - tests may have failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error running visual tests: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Visual testing complete! Check the test-results folder for screenshots." -ForegroundColor Green
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")