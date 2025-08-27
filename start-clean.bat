@echo off
echo Starting with clean environment (no OpenRouter)...

REM Clear any OpenRouter/OpenAI environment variables that might interfere
set OPENAI_BASE_URL=
set OPENAI_MODEL=
set OPENROUTER_API_KEY=

REM Start the dev server with clean environment
cmd /c "npm run dev"