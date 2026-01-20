# Revert Reactbits.dev Components Plan

## Files Using Reactbits Components

1. **app/page.tsx**
   - `BlurText` - Used for hero text
   - `ChromaGrid` - Used for background effect
   - `ShimmerButton` - Used for CTA buttons

2. **app/dashboard/page.tsx**
   - `BlurText` - Used for headings
   - `ShimmerButton` - Used for action buttons

3. **components/ProfileDropdownModal.tsx**
   - `PillNavigation` - Used for tab navigation
   - `AnimatedNumber` - Used for stats display
   - `LetterGlitch` - Used for belt names
   - `Spotlight` - Used for highlight effects

4. **components/PersonalitySelector.tsx**
   - `TiltCard` - Used for personality cards
   - `LetterGlitch` - Used for personality names

## Revert Strategy

### Option 1: Remove and Replace with Simple Alternatives (Recommended)
- Replace `BlurText` with regular `<h1>`, `<h2>` with text effects via CSS
- Replace `ShimmerButton` with regular buttons with gradient backgrounds
- Replace `ChromaGrid` with simple CSS gradients or remove
- Replace `TiltCard` with regular cards
- Replace `PillNavigation` with regular tab buttons
- Replace `AnimatedNumber` with regular numbers (or simple CSS animation)
- Replace `LetterGlitch` with regular text
- Replace `Spotlight` with CSS gradients

### Option 2: Revert via Git (If commit history available)
- Find commit before reactbits components were added
- Revert those specific files

## Action Items

1. ✅ Identify all files using reactbits components
2. ⏳ Replace BlurText components
3. ⏳ Replace ShimmerButton components
4. ⏳ Replace ChromaGrid components
5. ⏳ Replace TiltCard components
6. ⏳ Replace PillNavigation components
7. ⏳ Replace AnimatedNumber components
8. ⏳ Replace LetterGlitch components
9. ⏳ Replace Spotlight components
10. ⏳ Delete `components/ui/react-bits/` directory
11. ⏳ Test all pages still work correctly

