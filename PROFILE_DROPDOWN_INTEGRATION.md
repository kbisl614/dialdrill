# Profile Dropdown Modal - Integration Guide

## Overview
The Profile Dropdown Modal is a comprehensive gamification interface showing user progress, badges, belt progression, and statistics for DialDrill.

## Files Created
1. `/components/ProfileDropdownModal.tsx` - Main modal component
2. `/lib/mockProfileData.ts` - Mock data structure for testing

## Features Implemented

### 1. Header Section
- User avatar with initial letter
- Username display
- Current belt tier and color indicator
- Streak counter with fire emoji
- Power level display with gradient
- Close button (X)

### 2. Next Milestone Card
- Progress bar showing current belt to next belt
- Percentage and remaining power display
- Gradient progress indicator (cyan to purple)

### 3. Multiplier Status Card
- Shows active multiplier percentage
- Days remaining to next multiplier unlock
- Only visible when user has active multiplier

### 4. Tab Navigation
Four tabs with full content:
- **Information**: Email, member since, streaks, badges, calls
- **Badges**: Grid of earned/unearned badges with progress bars
- **Hero's Journey**: Visual belt progression across all 7 tiers
- **Statistics**: Key performance metrics with icons

### 5. Styling
- Dark theme (#1A1F2E background)
- Cyan (#00d9ff) and purple (#9d4edd) accents
- Responsive scrolling with custom scrollbar
- Border glows and gradient effects
- Badge rarity colors (common → legendary)

## How to Integrate

### Step 1: Add State to Dashboard

Add to your dashboard page component:

```typescript
import ProfileDropdownModal from '@/components/ProfileDropdownModal';
import { mockUserData } from '@/lib/mockProfileData';

function DashboardContent() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // ... rest of your code
}
```

### Step 2: Add Avatar Button

Replace your existing avatar button (usually in top-right corner) with:

```tsx
{/* Profile Avatar Button */}
<button
  onClick={() => setShowProfileDropdown(true)}
  className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#9d4edd] p-0.5 transition hover:scale-105"
>
  <div className="h-full w-full rounded-full bg-[#1A1F2E] flex items-center justify-center">
    <span className="text-sm font-bold text-white">
      {user?.firstName?.charAt(0) || 'U'}
    </span>
  </div>
  {/* Optional streak badge */}
  <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
    🔥 14
  </div>
</button>
```

### Step 3: Render the Modal

Add at the end of your component (with other modals):

```tsx
{/* Profile Dropdown Modal */}
<ProfileDropdownModal
  isOpen={showProfileDropdown}
  onClose={() => setShowProfileDropdown(false)}
  userData={mockUserData}
/>
```

### Complete Example Integration

```typescript
'use client';

import { useState } from 'react';
import ProfileDropdownModal from '@/components/ProfileDropdownModal';
import { mockUserData } from '@/lib/mockProfileData';

export default function Dashboard() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <div>
      {/* Your dashboard header */}
      <header className="flex items-center justify-between p-6">
        <h1>Dashboard</h1>

        {/* Avatar button in top-right */}
        <button
          onClick={() => setShowProfileDropdown(true)}
          className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#9d4edd] p-0.5 transition hover:scale-105"
        >
          <div className="h-full w-full rounded-full bg-[#1A1F2E] flex items-center justify-center">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
            🔥 14
          </div>
        </button>
      </header>

      {/* Your dashboard content */}
      <main>
        {/* ... */}
      </main>

      {/* Profile Dropdown Modal */}
      <ProfileDropdownModal
        isOpen={showProfileDropdown}
        onClose={() => setShowProfileDropdown(false)}
        userData={mockUserData}
      />
    </div>
  );
}
```

## TypeScript Interface

The component expects this data structure:

```typescript
interface UserProfileData {
  username: string;
  avatar: string;
  email: string;
  memberSince: string;
  currentPower: number;
  currentBelt: {
    tier: string;
    belt: string;
    color: string;
    minPower: number;
    maxPower: number;
  };
  nextBelt: {
    tier: string;
    belt: string;
    color: string;
    minPower: number;
    maxPower: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastLogin: string;
  };
  multiplier: {
    active: boolean;
    percentage: number;
    daysToNext: number | null;
    nextMultiplier: number | null;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    earned: boolean;
    earnedDate?: string;
    progress?: number;
    total?: number;
  }>;
  statistics: {
    totalCalls: number;
    totalMinutes: number;
    averageScore: number;
    objectionSuccessRate: number;
    closingRate: number;
    averageWPM: number;
    fillerWordAverage: number;
  };
}
```

## Next Steps

### Phase 1 (Current - UI Working with Mock Data)
- ✅ Component structure complete
- ✅ All tabs functional
- ✅ Mock data displaying
- ✅ Styling matches DialDrill theme

### Phase 2 (Connect Real Data)
- Create API endpoint `/api/user/profile` to fetch user data
- Replace `mockUserData` with real data fetching
- Add loading states during data fetch
- Error handling for failed requests

### Phase 3 (Real-time Updates)
- Calculate power level based on user activities
- Track streak in database
- Award badges when conditions met
- Update belt tier automatically

### Phase 4 (Enhancements)
- Add animations when badges are earned
- Toast notifications for milestone achievements
- Export belt progression as shareable image
- Add "Share Progress" button

## Customization

### Changing Colors
The component uses these color variables:
- Primary: `#00d9ff` (cyan)
- Secondary: `#9d4edd` (purple)
- Background: `#1A1F2E` (dark blue-gray)

To change, find and replace these hex values in `ProfileDropdownModal.tsx`.

### Adding New Tabs
1. Add tab name to the `TabType` type
2. Create new component function (e.g., `NewTab`)
3. Add tab button to navigation array
4. Add conditional render in tab content section

### Adjusting Modal Size
Current size: `w-[480px]` and `max-h-[calc(100vh-120px)]`

Change in the root div:
```tsx
<div className="fixed top-20 right-6 z-50 w-[YOUR_WIDTH] max-h-[YOUR_HEIGHT]">
```

## Testing

To test the component:
1. Click avatar in top-right
2. Modal should open with mock data
3. Switch between tabs - all should work
4. Scroll through content - scrollbar should be visible
5. Click X or backdrop to close
6. Check responsive behavior on different screen sizes

## Troubleshooting

**Modal not showing:**
- Check `isOpen` prop is true
- Verify z-index isn't conflicting (currently z-50)
- Check for CSS that might hide fixed positioned elements

**Styling issues:**
- Ensure Tailwind CSS is configured
- Check for global CSS overriding component styles
- Verify gradient colors are rendering correctly

**TypeScript errors:**
- Make sure all required fields in `UserProfileData` are provided
- Check badge rarity values match the union type
- Verify number types aren't strings

## Support

For issues or questions about this component, refer to:
- `/components/ProfileDropdownModal.tsx` - Main component code
- `/lib/mockProfileData.ts` - Data structure example
- This file - Integration instructions
