# Phase 1: Core Experience Polish - Test Plan

## Overview
This test plan covers all features implemented in Phase 1 to enhance the user experience with empty states, loading states, onboarding, and feedback improvements.

---

## 1. Empty States Testing

### 1.1 Profile Modal - Statistics Tab
**Scenario:** New user with no calls
**Steps:**
1. Create a fresh trial account
2. Navigate to dashboard
3. Click profile avatar to open ProfileDropdownModal
4. Verify Statistics tab shows empty state with:
   - 📊 icon
   - "No Statistics Yet" title
   - Helpful description
   - "Make Your First Call" action button
5. Click action button → should navigate to /dashboard

**Expected Result:** Empty state displays correctly with actionable CTA

---

### 1.2 Profile Modal - Notifications Tab
**Scenario:** User with no notifications
**Steps:**
1. Login to account with no notifications
2. Open ProfileDropdownModal
3. Navigate to Notifications tab
4. Verify empty state shows:
   - 🔔 icon
   - "No Notifications Yet" title
   - Description about future notifications
   - "Start Practicing" action button

**Expected Result:** Clear guidance for new users about notification system

---

### 1.3 Profile Modal - Badges Tab
**Scenario:** User with no earned badges
**Steps:**
1. Login to account with badges defined but none earned
2. Open ProfileDropdownModal → Badges tab
3. Verify empty state shows:
   - 🏅 icon
   - "No Badges Earned Yet" title
   - Encouragement to start earning
   - "Start Your First Call" action button

**Alternative Scenario:** No badges in system at all
- Should show "No Badges Yet" variant

**Expected Result:** Motivating empty state encouraging first call

---

### 1.4 Profile Modal - Leaderboard Tab
**Scenario:** New user with 0 power level
**Steps:**
1. Fresh account with no calls
2. Open ProfileDropdownModal → Leaderboard tab
3. Wait for loading to complete
4. Verify empty state shows:
   - 🏆 icon
   - "Climb the Leaderboard" title
   - Description about earning power
   - "Start Your Journey" action button

**Expected Result:** Inspiring message to encourage participation

---

### 1.5 Call History Page
**Scenario:** User with no completed calls
**Steps:**
1. Navigate to /history
2. Verify existing empty state still works:
   - "No calls yet" message
   - "Start Practicing" button linking to dashboard

**Expected Result:** Existing empty state remains functional

---

## 2. Loading States / Skeleton Loaders

### 2.1 Profile Modal Tabs - Initial Load
**Scenario:** Profile data loading
**Steps:**
1. Open ProfileDropdownModal (first time)
2. While profile data loads, observe:
   - Loading spinner in modal center
   - "Loading profile..." message
3. Switch to different tabs and verify skeleton loaders:
   - Statistics: Stat card skeleton loaders
   - Notifications: Notification skeleton loaders (5 items)
   - Badges: Badge grid skeleton loaders
   - Leaderboard: Leaderboard row skeleton loaders (8 items)

**Expected Result:** Smooth skeleton loading animations, no blank screens

---

### 2.2 Start Call Button Loading State
**Scenario:** Initiating a call
**Steps:**
1. Click "Start Call" button
2. Click "Start Call" in confirmation modal
3. Observe button state:
   - Spinning loader icon appears
   - Text changes to "Starting Call..."
   - Button disabled during loading
   - No duplicate clicks possible

**Expected Result:** Clear loading feedback, prevents double-clicks

---

## 3. Onboarding Flow

### 3.1 First-Time User Onboarding
**Scenario:** Brand new user
**Steps:**
1. Create new account and login
2. Land on dashboard
3. Onboarding modal should auto-appear with:
   - Step 1/4: "Welcome to DialDrill!" (👋)
   - 4 key features listed
4. Click "Next" through all 4 steps:
   - Step 2: "Earn Power & Level Up" (⚡)
   - Step 3: "Collect Badges" (🏅)
   - Step 4: "Choose Your Challenge" (🎯)
5. On final step, click "Let's Start!"
6. Modal closes, localStorage key "onboardingComplete" = "true"
7. Refresh page → modal should NOT reappear

**Expected Result:** Smooth 4-step onboarding, only shown once

---

### 3.2 Onboarding Skip
**Scenario:** User wants to skip tutorial
**Steps:**
1. Clear localStorage: `localStorage.removeItem('onboardingComplete')`
2. Refresh dashboard
3. Onboarding modal appears
4. Click "Skip Tutorial" button
5. Modal closes immediately
6. localStorage key set to "true"

**Expected Result:** Can skip onboarding without going through all steps

---

### 3.3 Onboarding Navigation
**Scenario:** Testing step navigation
**Steps:**
1. Open onboarding modal (clear localStorage first)
2. Test progress indicators:
   - Click dot indicators to jump to specific steps
   - Use "Previous" button to go back
   - Use "Next" button to advance
3. Verify:
   - Active step highlighted in cyan gradient
   - Inactive steps show as gray dots
   - "Previous" only shows on steps 2-4
   - Last step button says "Let's Start!" instead of "Next"

**Expected Result:** Intuitive navigation between steps

---

## 4. Call Start Confirmation Modal

### 4.1 Confirmation Modal - Trial User
**Scenario:** Trial user with 3 calls remaining
**Steps:**
1. Login as trial user with 3 calls left
2. Select a personality
3. Click "Start Call" button
4. Confirmation modal appears showing:
   - Selected personality name or "Random Personality" (🗣️/🎲 icon)
   - "After this call: 2 calls remaining"
   - Quick tips section
   - "Cancel" and "Start Call" buttons
5. Click "Cancel" → modal closes, no call started
6. Click "Start Call" again → click "Start Call" in modal
7. Modal closes, call initialization begins

**Expected Result:** Clear credit information before call starts

---

### 4.2 Confirmation Modal - Last Trial Call Warning
**Scenario:** Trial user with 1 call remaining
**Steps:**
1. Set user to have 1 trial call left
2. Click "Start Call"
3. Confirmation modal shows:
   - ⚠️ Warning banner: "This is your last trial call!"
   - Suggestion to upgrade
   - Yellow-bordered warning box
4. Proceed with call confirmation

**Expected Result:** Clear warning about last call

---

### 4.3 Confirmation Modal - Paid User Overage
**Scenario:** Paid user with 0 tokens (overage mode)
**Steps:**
1. Login as paid user with tokensRemaining = 0, isOverage = true
2. Click "Start Call"
3. Confirmation modal shows:
   - "Overage billing active ($1.00/call)"
   - Warning: "You will be charged $1.00 for this call."
4. User can still proceed or cancel

**Expected Result:** Transparent billing information

---

### 4.4 Confirmation Modal - Random Mode
**Scenario:** Using random personality selection
**Steps:**
1. Select "Randomized (Best for Training)" mode
2. Click "Start Call"
3. Confirmation modal shows:
   - 🎲 icon
   - "Training with: Random Personality"
   - Credits information
4. Proceed with call

**Expected Result:** Clear indication of random mode

---

## 5. Feedback & Validation

### 5.1 Notification Mark as Read - Success Toast
**Scenario:** Marking single notification as read
**Steps:**
1. Have unread notifications
2. Open ProfileDropdownModal → Notifications tab
3. Click an unread notification
4. Verify:
   - Success toast appears (top-right, green gradient)
   - Message: "Notification marked as read"
   - Toast auto-dismisses after 3 seconds
   - Notification list refreshes
   - Unread count badge updates

**Expected Result:** Immediate visual feedback with toast

---

### 5.2 Mark All Notifications as Read - Success Toast
**Scenario:** Bulk marking notifications
**Steps:**
1. Have 5+ unread notifications
2. Open Notifications tab
3. Click "Mark all as read" button
4. Verify:
   - Success toast: "All notifications marked as read"
   - All notifications become grayed/read
   - Unread count badge disappears

**Expected Result:** Bulk action feedback with success confirmation

---

### 5.3 Notification Error Handling
**Scenario:** API failure
**Steps:**
1. Simulate API error (disconnect network or modify API response)
2. Try marking notification as read
3. Verify:
   - Error toast appears (red gradient)
   - Message: "Failed to mark notification as read"
   - Notification state unchanged

**Expected Result:** Graceful error handling with user-friendly message

---

### 5.4 Personality Selection Validation
**Scenario:** No personality selected in select mode
**Steps:**
1. Choose "Select Personality" mode
2. Don't click any personality card
3. Attempt to click "Start Call" button
4. Verify:
   - Button is disabled
   - Button text shows: "Select a Personality"
   - Cannot proceed without selection

**Expected Result:** Clear validation preventing invalid call start

---

### 5.5 Out of Credits Validation
**Scenario:** Trial user with 0 calls
**Steps:**
1. Set trialCallsRemaining = 0, canCall = false
2. View dashboard
3. Verify:
   - "Start Call" button disabled
   - Button text: "Out of Call Credits"
   - Error message displayed above button
   - "View Plans" upgrade CTA shown

**Expected Result:** Clear messaging about credit exhaustion

---

## 6. Integration & Edge Cases

### 6.1 Modal Stacking / Z-index
**Scenario:** Multiple modals open
**Steps:**
1. Open ProfileDropdownModal
2. Verify it overlays dashboard properly
3. Open onboarding modal (via localStorage clear + refresh)
4. Verify proper z-index layering
5. Close modals via backdrop click or X button

**Expected Result:** Modals layer correctly, no visual glitches

---

### 6.2 Mobile Responsiveness
**Scenario:** Testing on mobile viewport
**Steps:**
1. Resize browser to 375px width (mobile)
2. Test all modals:
   - ProfileDropdownModal adjusts positioning
   - OnboardingModal remains centered
   - CallStartConfirmationModal readable
3. Test empty states on mobile
4. Verify touch interactions work

**Expected Result:** All UX improvements work on mobile

---

### 6.3 Keyboard Accessibility
**Scenario:** Keyboard-only navigation
**Steps:**
1. Use Tab key to navigate dashboard
2. Press Enter on "Start Call" button
3. Tab through confirmation modal
4. Press Escape to close modals
5. Navigate onboarding with Tab + Enter

**Expected Result:** Full keyboard accessibility

---

### 6.4 Performance - Rapid Modal Toggling
**Scenario:** Stress testing modal state
**Steps:**
1. Rapidly open/close ProfileDropdownModal 10 times
2. Rapidly open/close CallStartConfirmationModal
3. Monitor for:
   - Memory leaks
   - Animation glitches
   - State inconsistencies
   - Console errors

**Expected Result:** Smooth performance, no errors

---

## 7. Data Scenarios

### 7.1 Empty to Populated Transition
**Scenario:** User completes first call
**Steps:**
1. Start with empty states everywhere
2. Complete first practice call
3. Return to dashboard → open ProfileDropdownModal
4. Verify:
   - Statistics tab now shows data (no empty state)
   - Notification received for "First Call" badge
   - Badges tab shows progress
   - Leaderboard tab shows user ranking

**Expected Result:** Seamless transition from empty to populated

---

### 7.2 Partial Data States
**Scenario:** User has some but not all data
**Steps:**
1. User with 5 calls but no badges earned yet
2. Open ProfileDropdownModal
3. Verify:
   - Statistics tab shows real data
   - Badges tab shows "No Badges Earned Yet" empty state
   - Leaderboard shows user in rankings
   - Notifications may or may not be empty

**Expected Result:** Mixed empty/populated states handled correctly

---

## 8. Regression Testing

### 8.1 Existing Functionality Preserved
**Verify these existing features still work:**
- [ ] Quick Practice modal opens and functions
- [ ] Objection Library modal opens and displays objections
- [ ] ProfileDropdownModal tabs all switch correctly
- [ ] Leaderboard podium displays for top 3 users
- [ ] Belt progression journey displays correctly
- [ ] Streak indicator shows on profile avatar
- [ ] Unread notifications badge displays correct count
- [ ] Credits/calls display accurately
- [ ] Personality selector mode toggle works
- [ ] Upgrade prompt modal for locked personalities

**Expected Result:** No regressions introduced

---

## Test Execution Checklist

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Account Types
- [ ] New trial user (0 calls)
- [ ] Trial user (3 calls remaining)
- [ ] Trial user (1 call remaining)
- [ ] Trial user (0 calls remaining)
- [ ] Paid user (normal tokens)
- [ ] Paid user (overage mode)

### Viewport Sizes
- [ ] Desktop (1920x1080)
- [ ] Laptop (1440x900)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Bug Reporting Template

**Bug Title:**
**Severity:** [Critical / High / Medium / Low]
**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**
**Actual Result:**
**Screenshot/Video:**
**Browser/Device:**
**Additional Context:**

---

## Success Criteria

✅ All empty states display with helpful messaging and CTAs
✅ Skeleton loaders prevent blank screens during data fetching
✅ Onboarding appears once for new users and can be skipped
✅ Call confirmation shows accurate credit/billing information
✅ Success toasts provide feedback for notification actions
✅ Validation prevents invalid call starts
✅ No regressions in existing functionality
✅ Mobile responsive on all screen sizes
✅ Accessible via keyboard navigation
✅ No console errors or warnings

---

**Test Plan Version:** 1.0
**Date Created:** 2026-01-09
**Author:** DialDrill Development Team
