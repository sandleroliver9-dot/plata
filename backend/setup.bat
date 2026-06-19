@echo off
REM Plata Backend Setup Script for Windows

echo.
echo 🚀 Plata Backend Setup
echo =====================
echo.

REM Check Node.js
echo ✓ Checking Node.js...
call node --version

REM Check npm
echo ✓ Checking npm...
call npm --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

REM Create .env if not exists
if not exist .env (
  echo.
  echo 📝 Creating .env from .env.example...
  copy .env.example .env
  echo ⚠️  Please fill in your Supabase credentials in .env
) else (
  echo ✓ .env already exists
)

REM Build TypeScript
echo.
echo 🔨 Building TypeScript...
call npm run build

echo.
echo ✅ Setup complete!
echo.
echo 📚 Documentation: http://localhost:3000/api/docs
echo.
echo To start development:
echo   npm run dev
echo.
echo To start production:
echo   npm start
echo.
