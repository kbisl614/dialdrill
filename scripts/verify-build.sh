#!/bin/bash
set -e

echo "🔍 Vercel Build Preflight Check"
echo "================================"
echo ""

# Check Node version
echo "📦 Node version:"
node --version
echo ""

# Check for required env vars in .env.local
echo "🔐 Checking .env.local exists..."
if [ ! -f .env.local ]; then
  echo "❌ ERROR: .env.local not found!"
  echo "   Copy .env.local.example to .env.local and fill in your values"
  exit 1
fi
echo "✅ .env.local exists"
echo ""

# Check required env vars are set
echo "🔐 Checking required environment variables..."
REQUIRED_VARS=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "DATABASE_URL"
  "WEBHOOK_SECRET"
  "ELEVENLABS_API_KEY"
  "ELEVENLABS_AGENT_IDS"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=" .env.local; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "❌ ERROR: Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "   Add these to your .env.local file"
  exit 1
fi
echo "✅ All required environment variables are set"
echo ""

# Check .env.local is in .gitignore
echo "🔒 Checking .env.local is ignored by git..."
if git check-ignore -q .env.local; then
  echo "✅ .env.local is properly ignored"
else
  echo "⚠️  WARNING: .env.local is NOT ignored by git!"
  echo "   This is a security risk. Ensure .env*.local is in .gitignore"
fi
echo ""

# Run TypeScript check
echo "📝 Running TypeScript check..."
npx tsc --noEmit
echo "✅ TypeScript check passed"
echo ""

# Run build
echo "🏗️  Running production build (same as Vercel)..."
npm run build
echo ""

echo "✅ Build preflight check passed!"
echo ""
echo "Your code is ready to deploy to Vercel."
