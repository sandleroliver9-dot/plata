#!/bin/bash

# Plata Backend Setup Script

echo "🚀 Plata Backend Setup"
echo "====================="

# Check Node.js
echo "✓ Checking Node.js..."
node --version

# Check npm
echo "✓ Checking npm..."
npm --version

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env if not exists
if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please fill in your Supabase credentials in .env"
else
  echo "✓ .env already exists"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Documentation: http://localhost:3000/api/docs"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "To start production:"
echo "  npm start"
