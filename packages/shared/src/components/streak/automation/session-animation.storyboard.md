# Streak Milestone Feature Animation (30s)

This sequence showcases the updated streak popup, milestones timeline, and reward claim animations.

## Capture setup

- Resolution: 1920x1080
- Frame rate: 60fps
- Theme: dark (recommended for contrast on glow effects)
- Cursor: enabled with click highlight
- Zoom: subtle auto zoom only on interaction moments

## Demo preconditions

- Use an account with:
  - streak `>= 4` to show sponsored day-4 coupon claim
  - at least one additional unlocked reward milestone to show regular claim state
- Ensure streak popup can be opened from the top navigation streak button.
- Keep wallet button visible in the top nav to support cores fly-to-wallet effect.

## Shot list

### Shot 1: Open and orient (0:00 - 0:04)

- Start on feed home in idle state.
- Move cursor to streak trigger in header.
- Click to open `ReadingStreakPopup`.
- Hold for 0.8s on title area + current streak and calendar.
- Overlay text: `New streak milestones & rewards`.

### Shot 2: Reveal timeline polish (0:04 - 0:10)

- Slow pan down to milestones section.
- Let timeline auto-scroll settle to active milestone.
- Brief pause while "days away" badge is visible on next milestone.
- Overlay text: `Progress is now timeline-first`.

### Shot 3: Claim sponsored reward (0:10 - 0:17)

- Move cursor to the day-4 sponsored row.
- Click `Claim` (or `Show` if already claimed in current session).
- Record full-screen coupon modal reveal:
  - glow logo reveal
  - coupon code appearance
  - CTA + close button
- Click `Copy` and pause 0.5s on `Copied` state.
- Overlay text: `Milestone rewards now claimable in-flow`.

### Shot 4: Cores reward animation (0:17 - 0:23)

- Close coupon modal.
- Click `Claim` on a non-sponsored unlocked milestone.
- Capture cores reward animation:
  - center pop + amount
  - fly-to-wallet motion
- Keep wallet area in frame until animation completes.
- Overlay text: `Rewards animate straight to wallet`.

### Shot 5: End state and CTA (0:23 - 0:30)

- Return focus to timeline with claimed states visible.
- Add gentle zoom out to include popup context (calendar + timeline).
- Final text card:
  - line 1: `Stay consistent. Unlock more.`
  - line 2: `daily.dev streak milestones`
- Fade out.

## Editing notes

- Keep cuts tight; avoid hard jumps during modal transitions.
- Prefer 150-220ms cross-dissolves between shots.
- Do not speed up claim animations; show them at 1x for clarity.
- Keep total runtime between 26s and 32s.
