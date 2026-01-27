#!/bin/bash

echo "Which layout would you like to switch to?"
echo ""
echo "  A - Sales teams, SDRs"
echo "  B - Solo sellers, founders"
echo "  C - Original"
echo ""
read -p "Enter A, B, or C: " choice

case "${choice^^}" in
  A)
    cp app/landing-a/page.tsx app/page.tsx
    sed -i '' 's/export default function LandingA/export default function Home/' app/page.tsx
    echo ""
    echo "Switched to Variant A"
    ;;
  B)
    cp app/landing-b/page.tsx app/page.tsx
    sed -i '' 's/export default function LandingB/export default function Home/' app/page.tsx
    echo ""
    echo "Switched to Variant B"
    ;;
  C)
    cp app/landing-c/page.tsx app/page.tsx
    sed -i '' 's/export default function LandingC/export default function Home/' app/page.tsx
    echo ""
    echo "Switched to Variant C"
    ;;
  *)
    echo ""
    echo "Invalid choice. Please enter A, B, or C."
    exit 1
    ;;
esac
