# Incomplete Features & Quick Wins
**DialDrill - Features That Need Attention**

---

## 🔴 **CRITICAL (Fix Before Launch)**

### 1. **How-It-Works Page - Missing Demo Video**
**Location:** `app/how-it-works/page.tsx` (line 16)  
**Status:** Placeholder still present  
**Impact:** Users see "Video Coming Soon" instead of actual demo  
**Time to Fix:** 5 minutes  
**Fix:**
```typescript
const LOOM_VIDEO_URL = "https://www.loom.com/embed/YOUR_ACTUAL_VIDEO_ID";
```

**Priority:** 🔴 **CRITICAL** - Marketing page incomplete

---

### 2. **Performance Page - Wrong Navigation Links**
**Location:** `app/performance/page.tsx` (line 270)  
**Status:** Links to `/history` instead of `/call-summary/[callLogId]`  
**Impact:** Users can't navigate to call details from performance page  
**Time to Fix:** 2 minutes  
**Fix:**
```typescript
// Change from:
href="/history"

// To:
href={`/call-summary/${call.callLogId}`}
```

**Priority:** 🔴 **CRITICAL** - Broken user flow

---

### 3. **Alert() Instead of Toast**
**Location:** `app/how-it-works/page.tsx`  
**Status:** Uses `alert()` for error messages (poor UX)  
**Impact:** Browser alert popup instead of styled toast  
**Time to Fix:** 5 minutes  
**Fix:** Replace with existing `Toast` component

**Priority:** 🔴 **CRITICAL** - Poor user experience

---

## 🟡 **IMPORTANT (Fix Soon)**

### 4. **Call Summary - Missing Badge/Belt Data**
**Location:** `app/call-summary/[callLogId]/page.tsx` (lines 88-94)  
**Status:** TODOs present, data not being queried  
**Impact:** Belt upgrades and badges don't show in call summary  
**Time to Fix:** 1-2 hours  
**What's needed:**
```typescript
// Currently:
badgesUnlocked: [], // TODO: Query from badge system
beltUpgrade: {
  upgraded: false, // TODO: Check if user upgraded
}

// Need to:
// 1. Query badges_earned table for this call
// 2. Check if belt was upgraded during this call
// 3. Return actual data instead of empty arrays
```

**Files to modify:**
- `app/call-summary/[callLogId]/page.tsx` - Add badge/belt queries
- Database queries to `badges_earned` and `users` tables

**Priority:** 🟡 **MEDIUM-HIGH** - Gamification incomplete

---

### 5. **Dashboard - Hidden Quick Stats Section**
**Location:** `app/dashboard/page.tsx` (line 796)  
**Status:** Section exists but hidden with `{false && ...}`  
**Impact:** Users don't see their call statistics on dashboard  
**Time to Fix:** 30 minutes - 1 hour  
**What's needed:**
```typescript
// Currently:
{false && (
  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Quick Stats */}
  </div>
)}

// Need to:
// 1. Query call history data
// 2. Calculate stats (total calls, avg score, success rate)
// 3. Unhide section and populate with real data
```

**Priority:** 🟡 **MEDIUM** - Missing dashboard feature

---

### 6. **Missing Error Boundary**
**Location:** Root layout  
**Status:** No React Error Boundary component  
**Impact:** Unhandled errors show blank white screen  
**Time to Fix:** 30 minutes  
**What's needed:**
```typescript
// Create app/error-boundary.tsx
'use client';
import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  // Catch React errors and show friendly message
}
```

**Priority:** 🟡 **MEDIUM-HIGH** - Prevents white screen crashes

---

## 🟢 **NICE TO HAVE (Future Enhancements)**

### 7. **Analytics Dashboard (Phase 4 - 60% Complete)**
**Status:** Missing charts and visualizations  
**What's missing:**
- ❌ Score trends chart (line graph over time)
- ❌ Calls per week bar chart
- ❌ Category performance radar chart
- ❌ Weekly activity heatmap
- ✅ Summary statistics cards (partially done)

**Time to Implement:** 4-6 hours  
**Files to create:**
- `app/analytics/page.tsx` - Main analytics page
- `components/ScoreTrendsChart.tsx` - Line chart component
- `components/CallsPerWeekChart.tsx` - Bar chart
- `components/CategoryRadarChart.tsx` - Radar chart
- `components/WeeklyHeatmap.tsx` - Activity heatmap

**Dependencies:**
- `npm install recharts` (or `chart.js`)
- `npm install react-calendar-heatmap` (optional)

**Priority:** 🟢 **LOW** - Future enhancement

---

### 8. **Call Comparison (Side-by-Side)**
**Status:** Not started  
**What's needed:**
- UI to select 2 calls from history
- Split-screen transcript view
- Score comparison table
- Highlighted differences
- Export comparison report

**Time to Implement:** 3-4 hours  
**Files to create:**
- `components/CallComparison.tsx` - Main comparison component
- `app/call-comparison/page.tsx` - Comparison page
- API route to fetch 2 calls for comparison

**Priority:** 🟢 **LOW** - Future enhancement

---

### 9. **Call Playback (Audio)**
**Status:** Not implemented  
**Requirements:**
- Check if ElevenLabs provides audio recordings
- Audio player component
- Transcript sync with playback
- Scrubbing, speed control, downloads

**Time to Implement:** 6-8 hours (depends on ElevenLabs API)  
**Priority:** 🟢 **LOW** - Requires API investigation first

---

## 📊 **Summary by Priority**

### Quick Wins (Under 1 Hour):
1. ✅ Fix Loom video placeholder (5 min)
2. ✅ Fix performance page links (2 min)
3. ✅ Replace alert() with Toast (5 min)
4. ✅ Unhide dashboard stats section (30 min - 1 hour)

**Total:** ~1 hour for all quick wins

### Medium Effort (1-3 Hours):
5. ✅ Add Error Boundary (30 min)
6. ✅ Fix badge/belt data in call summary (1-2 hours)

**Total:** ~2-3 hours

### Larger Features (4+ Hours):
7. Analytics Dashboard (4-6 hours)
8. Call Comparison (3-4 hours)
9. Call Playback (6-8 hours, requires API check)

---

## 🎯 **Recommended Action Plan**

### **This Week (Critical Fixes):**
1. Fix Loom video (5 min)
2. Fix performance page links (2 min)
3. Replace alert() with Toast (5 min)
4. Add Error Boundary (30 min)

**Total Time:** ~45 minutes

### **Next Week (Important Features):**
5. Fix badge/belt data queries (1-2 hours)
6. Unhide and populate dashboard stats (30 min - 1 hour)

**Total Time:** ~2-3 hours

### **Future (Nice to Have):**
7. Analytics Dashboard (4-6 hours)
8. Call Comparison (3-4 hours)

---

## 💡 **Quick Fixes You Can Do Right Now**

### Fix #1: Loom Video
```typescript
// app/how-it-works/page.tsx
const LOOM_VIDEO_URL = "https://www.loom.com/embed/YOUR_VIDEO_ID";
```

### Fix #2: Performance Page Links ✅ **ALREADY FIXED**
```typescript
// app/performance/page.tsx
// Status: Already correctly links to call-summary
href={`/call-summary/${call.callLogId}`}
```

### Fix #3: Replace Alert ✅ **ALREADY FIXED**
```typescript
// app/how-it-works/page.tsx
// Status: Already using Toast component, no alert() found
import Toast from '@/components/Toast';
// Toast component is already implemented
```

### Fix #4: Unhide Dashboard Stats ✅ **FIXED**
```typescript
// app/dashboard/page.tsx
// Changed from: {false && (
// Changed to: {profileData && profileData.statistics.totalCalls > 0 && (
// Now uses real data from profileData.statistics:
// - totalCalls
// - averageScore
// - objectionSuccessRate
```

---

**Total time to fix all critical issues: ~45 minutes**  
**Total time to fix all important issues: ~3-4 hours**

