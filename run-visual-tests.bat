@echo off
echo Starting Visual Testing for AI Image Generation App
echo ================================================

echo.
echo Step 1: Starting development server on port 3500...
echo.

start /min "Dev Server" cmd /c "cd /d C:\claude\gpt-new-image-gen && npm run dev"

echo Waiting 15 seconds for server to start...
timeout /t 15 /nobreak >nul

echo.
echo Step 2: Running Playwright visual tests...
echo.

cd /d C:\claude\gpt-new-image-gen
npx playwright test tests/visual-testing.spec.ts --reporter=line

echo.
echo Step 3: Opening test results...
echo.

if exist "test-results" (
    explorer test-results
    echo Visual test screenshots have been saved to test-results folder
) else (
    echo No test results folder found - tests may have failed
)

echo.
echo Visual testing complete! Check the test-results folder for screenshots.
pause