# Notifications System Implementation Guide

## Overview

A comprehensive notification system has been implemented for the gamification features. Users receive real-time notifications for achievements, belt upgrades, power gains, and more.

## What's Been Implemented

### 1. Database Schema
**File:** `/lib/migrations/add-notifications-table.ts`

**Migration completed:** ✅

Created `user_notifications` table with:
- Notification types: `badge_earned`, `belt_upgrade`, `power_gained`, `streak_milestone`, `level_up`
- Read/unread tracking
- Metadata support for rich notification data
- Optimized indexes for fast queries

### 2. Notification API Endpoints
**File:** `/app/api/notifications/route.ts`

**GET /api/notifications**
- Fetch user notifications
- Filter by unread only (`?unreadOnly=true`)
- Limit results (`?limit=50`)
- Returns notifications + unread count

**POST /api/notifications**
- Mark single notification as read (`{ notificationId: "..." }`)
- Mark all notifications as read (`{ markAllRead: true }`)

### 3. Profile Modal - Notifications Tab
**File:** `/components/ProfileDropdownModal.tsx`

**New Features:**
- Added "Notifications" tab between "Information" and "Badges"
- Red badge counter showing unread notification count
- Click notifications to mark as read
- "Mark all as read" button
- Different icons for each notification type:
  - 🏆 Badge earned
  - 🥋 Belt upgrade
  - ⚡ Power gained
  - 🔥 Streak milestone
  - 📈 Level up
- Visual distinction between read/unread notifications
- Timestamp display for each notification

### 4. Automatic Notification Creation
**File:** `/app/api/calls/save-transcript/route.ts`

Notifications are automatically created when:

**Power Gained (after every call):**
```
⚡ Power Gained!
You earned X power from completing a call! (with streak bonus if applicable)
```

**Belt Upgrade:**
```
🥋 Belt Upgrade!
Congratulations! You've been promoted to [Tier] [Belt]!
```

**Badge Earned:**
```
🏆 Badge Earned!
You've unlocked the "[Badge Name]" badge!
```

### 5. Notification Badge on Profile Avatar
**File:** `/app/dashboard/page.tsx`

**Features:**
- Red badge in top-right of profile avatar
- Shows number of unread notifications (9+ if more than 9)
- Auto-refreshes every 30 seconds
- Updates when profile modal is opened
- Positioned above streak badge

## How It Works

### User Journey

1. **User completes a call**
   - Gamification system calculates power, checks for belt upgrades and badges
   - Notifications are created automatically via `createNotification()`

2. **User sees notification badge**
   - Profile avatar shows red badge with unread count
   - Badge updates every 30 seconds automatically

3. **User opens profile modal**
   - Clicks on "Notifications" tab
   - Sees list of all notifications (newest first)
   - Unread notifications are highlighted with cyan border
   - Click any unread notification to mark as read
   - Or click "Mark all as read" button

4. **Reading notifications**
   - Clicking unread notification marks it as read
   - Visual opacity changes to indicate read status
   - Unread count decreases
   - Badge updates on profile avatar

## Notification Helper Function

**File:** `/lib/create-notification.ts`

Reusable function for creating notifications:

```typescript
await createNotification({
  userId: 'internal-user-id',
  type: 'badge_earned',
  title: '🏆 Badge Earned!',
  message: 'You've unlocked the "First Steps" badge!',
  metadata: { badgeId: 'badge_5_calls', badgeName: 'First Steps' },
});
```

## Database Structure

### user_notifications table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users table |
| type | TEXT | Notification type enum |
| title | TEXT | Short title (e.g., "🏆 Badge Earned!") |
| message | TEXT | Detailed message |
| metadata | JSONB | Additional structured data |
| read | BOOLEAN | Read status (default: FALSE) |
| created_at | TIMESTAMP | Creation timestamp |
| read_at | TIMESTAMP | When notification was read |

**Indexes:**
- `idx_user_notifications_user_id` - Fast user lookup
- `idx_user_notifications_read` - Fast unread queries
- `idx_user_notifications_created_at` - Chronological sorting

## Notification Types

| Type | Icon | When Triggered |
|------|------|----------------|
| `power_gained` | ⚡ | After every completed call |
| `badge_earned` | 🏆 | When user unlocks a badge |
| `belt_upgrade` | 🥋 | When user advances to new belt |
| `streak_milestone` | 🔥 | Future: At 7, 14, 30, 180, 365 day streaks |
| `level_up` | 📈 | Future: Custom level milestones |

## Testing the System

### 1. Test Power Gain Notification
```bash
# Complete a call to trigger power gain
# Check profile modal > Notifications tab
# Should see: "⚡ Power Gained! You earned X power..."
```

### 2. Test Badge Notification
```sql
-- Manually trigger badge by setting stats
UPDATE users SET total_calls = 5 WHERE clerk_id = 'YOUR_CLERK_ID';
-- Complete one more call to trigger badge check
-- Should see: "🏆 Badge Earned! You've unlocked the 'First Steps' badge!"
```

### 3. Test Belt Upgrade Notification
```sql
-- Set power level just below next belt threshold
UPDATE users SET power_level = 499 WHERE clerk_id = 'YOUR_CLERK_ID';
-- Complete a call to cross threshold
-- Should see: "🥋 Belt Upgrade! Congratulations! You've been promoted to Bronze Yellow!"
```

### 4. Test Mark as Read
1. Have unread notifications
2. Open profile modal → Notifications tab
3. Click an unread notification
4. Notification should become semi-transparent (opacity-60)
5. Unread badge count should decrease

### 5. Test Mark All as Read
1. Have multiple unread notifications
2. Open profile modal → Notifications tab
3. Click "Mark all as read" button
4. All notifications should become read
5. Badge should disappear from profile avatar

## API Examples

### Fetch All Notifications
```javascript
const response = await fetch('/api/notifications');
const { notifications, unreadCount } = await response.json();
```

### Fetch Only Unread Notifications
```javascript
const response = await fetch('/api/notifications?unreadOnly=true');
const { notifications, unreadCount } = await response.json();
```

### Mark Single Notification as Read
```javascript
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notificationId: 'uuid-here' }),
});
```

### Mark All as Read
```javascript
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markAllRead: true }),
});
```

## Future Enhancements

### Planned for Phase 4 & 5:
- [ ] Streak milestone notifications (automatic at 7, 14, 30, etc. days)
- [ ] Leaderboard position change notifications
- [ ] Weekly achievement summary notifications
- [ ] Push notifications (browser/mobile)
- [ ] Email digest of achievements
- [ ] Notification preferences (enable/disable types)
- [ ] Celebration animations on new notifications
- [ ] Sound effects for important achievements
- [ ] In-app toast notifications (instead of just badge)

## Troubleshooting

### Notifications Not Showing
1. Check database table exists: `SELECT * FROM user_notifications LIMIT 1;`
2. Check API endpoint works: Visit `/api/notifications` in browser (should return JSON)
3. Check console for errors in dashboard
4. Verify user is completing calls successfully

### Badge Count Not Updating
1. Check browser console for fetch errors
2. Verify 30-second polling is working
3. Manually refresh by opening/closing profile modal
4. Check that notifications table has unread notifications: `SELECT * FROM user_notifications WHERE user_id = 'X' AND read = FALSE;`

### Notifications Not Created After Call
1. Check server logs for gamification errors
2. Verify `createNotification` function is being called
3. Check that notification migration ran successfully
4. Ensure user_id is valid UUID in database

## Summary

✅ **Complete Notification System Implemented:**
- Database schema with optimized indexes
- API endpoints for fetching and marking read
- Notifications tab in profile modal
- Automatic notification creation on achievements
- Visual badge on profile avatar
- Real-time polling every 30 seconds
- Click-to-read functionality
- Mark all as read feature

The system is fully operational and integrated with the existing gamification features!
