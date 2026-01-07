# Phase 2: Real Data Integration Guide

## What's Been Implemented

### 1. Database Migration
**File:** `/lib/migrations/add-gamification-columns.ts`

Adds gamification columns to the database:
- **users table**: power_level, current_tier, current_belt, streaks, statistics
- **user_badges table**: Tracks earned badges and progress
- **user_statistics table**: Detailed performance metrics

### 2. Profile API Endpoint
**File:** `/app/api/user/profile/route.ts`

GET endpoint that returns:
- User info (username, email, member since)
- Current power level and belt
- Next belt milestone
- Streak information with multipliers
- All 12 badges with earned status and progress
- Performance statistics

### 3. Updated ProfileDropdownModal
**File:** `/components/ProfileDropdownModal.tsx`

Now supports:
- Loading state with spinner
- Null userData handling
- Real API data structure

##  Step-by-Step Integration

### Step 1: Run Database Migration

**IMPORTANT:** Run this ONCE to add the gamification columns:

```bash
# Option 1: Using ts-node
npx ts-node lib/migrations/add-gamification-columns.ts

# Option 2: Using tsx
npx tsx lib/migrations/add-gamification-columns.ts
```

This will add:
- `power_level`, `current_tier`, `current_belt` columns to users
- `current_streak`, `longest_streak`, `last_login_date` for streaks
- `total_calls`, `total_minutes`, `total_badges_earned` for stats
- New tables: `user_badges` and `user_statistics`

### Step 2: Add Profile Fetching to Dashboard

Update `/app/dashboard/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import ProfileDropdownModal from '@/components/ProfileDropdownModal';

function DashboardContent() {
  // Existing state...
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch profile data when modal opens
  useEffect(() => {
    if (showProfileDropdown && !profileData) {
      fetchProfileData();
    }
  }, [showProfileDropdown]);

  async function fetchProfileData() {
    setProfileLoading(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }

  return (
    <div>
      {/* Your dashboard content */}

      {/* Profile Avatar Button - add to header */}
      <button
        onClick={() => setShowProfileDropdown(true)}
        className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#9d4edd] p-0.5 transition hover:scale-105"
      >
        <div className="h-full w-full rounded-full bg-[#1A1F2E] flex items-center justify-center">
          <span className="text-sm font-bold text-white">
            {user?.firstName?.charAt(0) || 'U'}
          </span>
        </div>
        {/* Streak badge - show when profile is loaded */}
        {profileData?.streak?.currentStreak > 0 && (
          <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
            🔥 {profileData.streak.currentStreak}
          </div>
        )}
      </button>

      {/* Profile Dropdown Modal */}
      <ProfileDropdownModal
        isOpen={showProfileDropdown}
        onClose={() => setShowProfileDropdown(false)}
        userData={profileData}
        loading={profileLoading}
      />
    </div>
  );
}
```

### Step 3: Test the Integration

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Sign in as a user**

3. **Click the avatar button** in the top-right

4. **You should see:**
   - Loading spinner briefly
   - Profile modal with real data
   - Power level: 0 (new users start at 0)
   - Bronze White Belt
   - 0 badges earned (new user)
   - Statistics all at 0

### Step 4: Test With Mock Power Level

To test the belt progression system without completing calls, temporarily give yourself power:

```sql
-- Connect to your database and run:
UPDATE users
SET power_level = 1850,
    current_streak = 14,
    total_calls = 18
WHERE clerk_id = 'YOUR_CLERK_USER_ID';
```

Now refresh and open the profile - you should see:
- Bronze Black Belt (1850 power)
- 14-day streak with +15% multiplier active
- Progress bar showing path to Silver White Belt

## What Happens Next

### Automatic Badge Awards
When users complete actions, badges are automatically checked:
- Badges unlock when conditions are met
- Progress bars update for badges in progress
- Power level increases (+25-250 per badge)

### Belt Progression
- As power increases, belt automatically updates
- 49 total levels from Bronze White to Sales Predator Black
- Progress bar shows % to next belt

### Streak System
- Track daily logins
- Multipliers unlock at 14, 30, 180, 365 days
- Multipliers apply to ALL power gains

## Next: Connect Real Activity Tracking

### When User Completes a Call

Update `/app/api/calls/save-transcript/route.ts` (or wherever you save call results):

```typescript
// After saving call transcript...

// 1. Increment total_calls and total_minutes
await dbPool.query(`
  UPDATE users
  SET
    total_calls = total_calls + 1,
    total_minutes = total_minutes + $1,
    power_level = power_level + (5 * streak_multiplier)
  WHERE id = $2
`, [callDurationMinutes, userId]);

// 2. Update statistics (if you calculate them)
await dbPool.query(`
  INSERT INTO user_statistics (user_id, average_score, objection_success_rate, closing_rate)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (user_id)
  DO UPDATE SET
    average_score = $2,
    objection_success_rate = $3,
    closing_rate = $4,
    updated_at = NOW()
`, [userId, averageScore, objectionRate, closingRate]);

// 3. Check and award badges
// (You'll implement this next)
```

### When User Logs In

Update login handler to track streaks:

```typescript
const today = new Date().toISOString().split('T')[0];
const lastLogin = user.last_login_date;

if (lastLogin) {
  const lastLoginDate = new Date(lastLogin);
  const daysSinceLastLogin = Math.floor(
    (new Date(today).getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastLogin === 1) {
    // Consecutive day - increment streak
    await dbPool.query(`
      UPDATE users
      SET
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_login_date = $1,
        power_level = power_level + (2 * streak_multiplier)
      WHERE id = $2
    `, [today, userId]);
  } else if (daysSinceLastLogin > 1) {
    // Streak broken - reset
    await dbPool.query(`
      UPDATE users
      SET
        current_streak = 1,
        last_login_date = $1,
        streak_multiplier = 1.0,
        power_level = power_level + 2
      WHERE id = $2
    `, [today, userId]);
  }
  // Same day = no change
} else {
  // First login ever
  await dbPool.query(`
    UPDATE users
    SET current_streak = 1, last_login_date = $1, power_level = power_level + 2
    WHERE id = $2
  `, [today, userId]);
}
```

## API Endpoint Reference

### GET /api/user/profile

**Auth Required:** Yes (Clerk)

**Response:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "memberSince": "January 2025",
  "currentPower": 1850,
  "currentBelt": {
    "tier": "Bronze",
    "belt": "Black",
    "color": "#cd7f32",
    "minPower": 1751,
    "maxPower": 3500
  },
  "nextBelt": {
    "tier": "Silver",
    "belt": "White",
    "color": "#c0c0c0",
    "minPower": 3501,
    "maxPower": 4500
  },
  "streak": {
    "currentStreak": 14,
    "longestStreak": 21,
    "lastLogin": "2025-01-07T00:00:00.000Z"
  },
  "multiplier": {
    "active": true,
    "percentage": 15,
    "daysToNext": 16,
    "nextMultiplier": 17
  },
  "badges": [
    {
      "id": "badge_5_calls",
      "name": "First Steps",
      "description": "Complete 5 total calls",
      "category": "volume",
      "rarity": "common",
      "earned": true,
      "earnedDate": "2025-01-05T12:34:56.789Z"
    },
    {
      "id": "badge_25_calls",
      "name": "Quarter Century",
      "description": "Complete 25 total calls",
      "category": "volume",
      "rarity": "uncommon",
      "earned": false,
      "progress": 18,
      "total": 25
    }
  ],
  "statistics": {
    "totalCalls": 18,
    "totalMinutes": 87,
    "averageScore": 72.5,
    "objectionSuccessRate": 68.3,
    "closingRate": 55.6,
    "averageWPM": 142,
    "fillerWordAverage": 7.2
  }
}
```

## Troubleshooting

### "Column does not exist" Error
- Run the migration script: `npx tsx lib/migrations/add-gamification-columns.ts`
- Check your DATABASE_URL environment variable

### Profile Shows All Zeros
- Normal for new users
- Manually update database to test: `UPDATE users SET power_level = 1000, total_calls = 10 WHERE clerk_id = 'your_id'`

### Loading Spinner Never Stops
- Check browser console for API errors
- Verify `/api/user/profile` returns 200 status
- Check authentication is working (Clerk session valid)

### Badges Not Showing
- Check that ALL_BADGES array in `/app/api/user/profile/route.ts` is defined
- Verify badge unlock conditions match user stats

## What's Next (Phase 3)

1. **Real-time Power Calculation**
   - Hook into call completion
   - Apply streak multipliers
   - Award power immediately

2. **Auto-Award Badges**
   - Check badge conditions after each call
   - Insert into user_badges table
   - Show toast notification

3. **Streak Tracking**
   - Update on daily login
   - Calculate multipliers
   - Break streak on missed day

4. **Belt Auto-Upgrade**
   - Recalculate belt after power changes
   - Update users.current_tier and current_belt
   - Show celebration animation

See `PHASE3_IMPLEMENTATION.md` for detailed implementation steps.
