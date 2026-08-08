# Teaching the new sidebar: the finalized solution

One folder, one system. Twelve concepts were explored and reviewed before this
one was chosen; they are recoverable from commit `9a439940d` if the comparison
is ever needed again.

Stories: `Experiments/Sidebar Tutorial/00 Full experience` (the whole system,
both personas), `01 Tour (existing users)`, `02 Intent teaching (new users)`,
`03 Replay from help`.

## The decision

**Two audiences, two treatments.**

- **Existing users** are the only people whose muscle memory broke, so they get
  a **three-step spotlight tour**, once, right after they land on the new
  layout. A `Skip tour` control sits in the actions row of every step;
  finishing or skipping sets the seen-flag and it never runs again on its own.
- **New users** never see the tour. Nothing moved for them, so there is nothing
  to un-learn. They get **intent-based teaching** at the moment they can act:
  - **In-panel pin coaching** the first time they hover-open a rail panel. If
    the user has squads that panel is Squads; if not, the same lesson runs on
    whichever panel they open first. The lesson: drag any row into the dock, or
    use its pin button.
  - **A ••• coach.** Hovering or opening the dock's tray shows one line saying
    everything can be added, reordered and removed from there.
  - Both **decay**: they retire on success (a pin happens, the tray is opened)
    or after three exposures, whichever comes first.

**Tour content: exactly three steps.**

1. **The reorganized rail.** "Your navigation moved into this rail, and panels
   open on hover." This step also carries the compact teaching as an inline
   `Compact mode` switch that flips the rail live: the rail visibly narrowing is
   the explanation, so there is no caption. The setting lives in
   Settings → Appearance in the real product.
2. **The shortcuts dock.** "Drag anything from the sidebar into the dock, or add
   it from the ••• menu." The rows are sidebar options rather than pages, so the
   sentence names them that way. Drag from any panel, drag pins to reorder, •••
   as the click-only alternative.
3. **Game Center.** "Your streak and quests now share one Game Center." The
   Streak tab glows alone and the Game Center panel opens beside it (streak
   block + quest rows). Final CTA: **Got it**.

There is **no step for the replay entry**. A tour that teaches its own escape
hatch spends its last step on itself.

**Replay** lives in the support ("?") dropdown at the foot of the rail, as a
`Learn the sidebar` item. It restarts the tour from step one for anyone who
skipped, closed, or never saw it, new users included. It is an available
option, never advertised.

## Coach card anatomy (all coaches in this folder)

One sentence, nothing else: no title, no subtitle, no disclaimer. The card is
224px wide with a hairline border and 14px of padding (16px on the top and left
edges), the sentence at `Footnote`, and the primary button at `ButtonSize.Small`
(32px tall, the comfortable floor).

- **Leaving** is an explicit `Skip tour` text button, present on every step. It
  replaced a corner X, which could only say "close" and read as dismissing the
  current step rather than abandoning the tour.
- **Progress** is the shared `ProgressCircle` ring at 18px on the left of the
  actions row, aligned with the sentence above it, sweeping a third at a time.
  It stops at 99 rather than 100 because the component swaps to a check icon at
  full, which would claim the tour is over while the last step is still open.
  There is no oval pill and no "1 of 3" prose.
- **Actions** are a right-aligned pair: `Skip tour` as a smaller, padding-trimmed
  tertiary button beside `Next` / `Got it`, which carries an 88px minimum width
  so the primary action stays the heavier of the two. There is no `Back`: three
  steps do not need one, and the support menu can replay the whole tour.
- **Motion** is a 180ms blur-and-lift enter on `cubic-bezier(0.16, 1, 0.3, 1)`,
  keyed on the step id so the copy re-animates while the shell and the progress
  fill stay put. No overshoot anywhere, and the whole thing is off under
  `prefers-reduced-motion`.
- A **pointer** on the card's left edge ties it to the region it is talking
  about, and the tour runs over a real spotlight: a full-stage scrim with the
  rail lifted above it. Clicking the scrim does nothing. Only `Skip tour` and
  the buttons end the tour.

**How this card was chosen.** Five treatments (Quiet, Counter, Segments, Dialog
footer, Wayfinding) were built and reviewed side by side; Quiet won and the
other four were removed.

## Where it shipped

This folder is the design reference. The product implementation lives in
`packages/shared/src/features/sidebarTour/`, wired into the rail from
`SidebarDesktopV2.tsx` and gated on the `sidebar_tour` flag, which defaults off.

Three things resolved differently in the product than they are drawn here, all
deliberately:

- **Anchoring.** The mock positions cards against fixed rail geometry. The
  product measures the live DOM instead, because the rail is user-reorderable,
  folds tabs into the More menu on short viewports, and drops the Streak tab
  when gamification is off. A step whose target is not on screen is skipped
  rather than pointed blind, so the tour can legitimately run two steps.
- **Seen-flags.** They ride `usePersistentContext` (device-local) rather than
  `SettingsFlags`, because the API rejects flags it does not declare and one
  undeclared key fails the whole `updateUserSettings` mutation. The cross-device
  home is a `useActions` / `ActionType` field once daily-api declares it, and
  the swap is isolated to `useSidebarTourState.ts`.
- **Step 3** opens the real streak and quests panel rather than a mock, since
  the Streak tab already is the Game Center.

Log events are `start sidebar tour`, `view sidebar tour step`,
`skip sidebar tour`, `complete sidebar tour`, `end sidebar tour`,
`view sidebar pin coach`, `sidebar pin coach success` and
`view sidebar dots coach`. Skip-by-step is the one that tells us whether three
steps is still one too many, so it only ever counts a user pressing `Skip tour`
or Escape. Everything the user did not choose (a navigation, another rail popup
taking over, a modal opening, a step whose target went away on the last step)
logs `end sidebar tour` with its reason instead, and only the last of those
sets the seen-flag.

## Deliberately not shipped

Each of these was built during the exploration and left behind:

- **Hotspot beacons.** Pull-based, but they add permanent visual noise to a rail
  we just asked people to relearn.
- **Make-it-yours checklist.** Measurable, but it is a second onboarding surface
  for a navigation change nobody asked for.
- **Teaching empty dock.** The dock ships with pins, so the empty state almost
  never renders.
- **What's-new announcement card.** The tour already is the one sanctioned
  interruption; two pushes is one too many.
- **Interactive playground.** A sandbox teaches the sandbox; the real panel is
  right there.
- **"New" pills.** Every pill is a promise to remove it later, and the Game
  Center step covers the one genuinely merged surface.
- **Autoplaying tour.** Takes reading control away from the user to save three
  clicks.
- **The oval progress pill.** It read as a chip you could press, and it spent
  the card's most valuable row on three dots.
