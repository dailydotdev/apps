# Clickbait Shield Loading Issue Fix

## Problem Description
The "This title could be cleaner..." prompt was being shown to Plus users for a brief period when loading post pages. This occurred because the user's Plus subscription status wasn't resolved yet during the initial page load.

## Root Cause
The issue was in the `usePlusSubscription` hook and related components:

1. **`usePlusSubscription` hook**: Returns `isPlus: user?.isPlus || false` which defaults to `false` when `user` is `undefined` during loading
2. **Clickbait Shield components**: Check `if (!isPlus)` to decide whether to show the prompt, but this condition is `true` during loading even for Plus users
3. **Timing issue**: Components render before authentication is complete, showing the prompt briefly to all users

## Components Fixed

### 1. `usePlusSubscription` Hook
**File**: `packages/shared/src/hooks/usePlusSubscription.ts`

**Changes**:
- Added `isPlusLoading` state that combines `loadingUser`, `!isAuthReady`, and `!user` conditions
- This indicates when the user's Plus subscription status is still being determined

### 2. `PostClickbaitShield` Component  
**File**: `packages/shared/src/components/post/common/PostClickbaitShield.tsx`

**Changes**:
- Added early return `if (isPlusLoading) return null;` 
- Prevents prompt from showing while user status is loading

### 3. `ClickbaitShield` Component
**File**: `packages/shared/src/components/cards/common/ClickbaitShield.tsx` 

**Changes**:
- Added early return `if (isPlusLoading) return null;`
- Prevents prompt from showing in feed cards while user status is loading

### 4. `ToggleClickbaitShield` Component
**File**: `packages/shared/src/components/buttons/ToggleClickbaitShield.tsx`

**Changes**:
- Added early return `if (isPlusLoading) return null;`
- Prevents incorrect shield toggle button from showing while loading

### 5. `UpgradeToPlus` Component
**File**: `packages/shared/src/components/UpgradeToPlus.tsx`

**Changes**:
- Updated condition to `if (isPlusLoading || isPlus) return null;`
- Prevents upgrade button from briefly showing to Plus users

## Solution Summary

The fix ensures that clickbait shield prompts and related Plus-specific UI elements wait for the user's subscription status to be fully resolved before deciding what to display. This eliminates the brief "blink" of inappropriate content for Plus users during page load.

## Key Benefits

1. **No more false prompts**: Plus users no longer see clickbait shield prompts
2. **Better UX**: Eliminates confusing UI flicker during page load  
3. **Consistent behavior**: All Plus-related components now properly wait for status resolution
4. **Scalable solution**: The `isPlusLoading` state can be used by any component that needs to wait for Plus status

## Testing

To verify the fix:
1. **As a Plus user**: Load a post page and confirm no clickbait shield prompt appears
2. **As a non-Plus user**: Confirm the prompt still appears as expected
3. **Network throttling**: Test with slow network to ensure no flicker occurs during loading