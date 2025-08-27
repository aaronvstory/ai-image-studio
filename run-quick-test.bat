@echo off
cd /d "C:\claude\gpt-new-image-gen"
echo Running quick visual test...
npx playwright test tests/quick-visual-test.spec.ts --headed --reporter=line
echo.
echo Opening test results...
if exist "test-results" explorer test-results
pause