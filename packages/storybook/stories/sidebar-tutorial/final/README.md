# Teaching the new sidebar — the finalized solution

One folder, one system. The exploration gallery (`../`) spanned twelve concepts;
this is the decision that came out of it, built to be handed to engineering.

Stories: `Sidebar Tutorial/Final/00 Full experience` (the whole system, both
personas), `01 Tour (existing users)`, `02 Intent teaching (new users)`,
`03 Replay from help`.

## The decision

**Two audiences, two treatments.**

- **Existing users** — the only people whose muscle memory broke — get a
  **three-step spotlight tour**, once, right after they land on the new layout.
  Skippable on every step (X in the top-right corner); finishing or skipping
  sets the seen-flag and it never runs again on its own.
- **New users** never see the tour. Nothing moved for them, so there is nothing
  to un-learn. They get **intent-based teaching** at the moment they can act:
  - **In-panel pin coaching** the first time they hover-open a rail panel. If
    the user has squads that panel is Squads; if not, the same lesson runs on
    whichever panel they open first. The lesson: drag any row into the dock, or
    use its pin button.
  - **A ••• coach** — hovering or opening the dock's tray shows one line saying
    everything can be added, reordered and removed from there.
  - Both **decay**: they retire on success (a pin happens, the tray is opened)
    or after three exposures, whichever comes first.

**Tour content — exactly three steps.**

1. **The reorganized rail.** "Your navigation now lives in this rail — hover any
   tab to open it." This step also carries the compact teaching as an inline
   `Compact mode` switch that flips the rail live: the rail visibly narrowing is
   the explanation, so there is no caption. The setting lives in
   Settings → Appearance in the real product.
2. **The shortcuts dock.** "Pin the pages you use most — drag them here or add
   them from •••." Drag from any panel, drag pins to reorder, ••• as the
   click-only alternative.
3. **Game Center.** "Your streak and quests now share one Game Center." The
   Streak tab glows alone and the Game Center panel opens beside it (streak
   block + quest rows). Final CTA: **Got it**.

There is **no step for the replay entry**. A tour that teaches its own escape
hatch spends its last step on itself.

**Replay** lives in the support ("?") dropdown at the foot of the rail, as a
`Learn the sidebar` item. It restarts the tour from step one for anyone who
skipped, closed, or never saw it — including new users who want the full
walkthrough. It is an available option, never advertised.

## Coach card anatomy (all coaches in this folder)

One sentence, nothing else — no title, no subtitle, no disclaimer. Progress is
carried by dots in the top-left (active = accent pill), skip by an X in the
top-right on every step, and the actions row is Back (from step 2 on) and
Next / Got it at `ButtonSize.Medium` with a `justify-between` layout so nothing
shifts between steps. A pointer on the card's left edge ties it to the region it
is talking about, and the tour runs over a real spotlight: a full-stage scrim
with the rail lifted above it. Clicking the scrim does nothing — only the X and
the buttons end the tour.

## Productionization map

| Piece here | Lands in |
| --- | --- |
| `FinalRail` regions, glow ring, spotlight scrim | `packages/shared/src/components/sidebar/SidebarDesktopV2.tsx` — the rail is already region-shaped; the tour needs a scrim sibling and a `relative z-*` wrapper on the rail column |
| Tour engine (`SIDEBAR_TOUR_STEPS`, `SidebarTour`) | New `features/sidebarTour/` module rendered once from the v2 layout; steps stay data so copy changes are not code changes |
| Step 1 compact switch | Reuses the existing `sidebarCompact` settings flag (`packages/shared/src/graphql/settings.ts`) — the switch writes the same flag Settings → Appearance writes |
| Step 2 dock + drag/drop | `SidebarShortcutsDock.tsx` and its ••• tray (`RailMoreMenu.tsx`) — both already exist; the coach only anchors to them |
| Step 3 Game Center panel | The real Streak tab panel — the tour opens it rather than mocking it |
| In-panel pin coaching | The panel sections behind `RailHoverPanel.tsx`; the coach anchors to the first pinnable row and the dock |
| ••• coach | `RailMoreMenu` trigger on the dock |
| `Learn the sidebar` replay item | `SidebarSupportButton`'s popup in `SidebarDesktopV2.tsx`, alongside the existing support/legal sections |

**Seen-flags.** Three booleans decide everything above:
`sidebarTourCompletedAt`, `sidebarPinCoachRetired`, `sidebarDotsCoachSeen`
(the last one a counter, retiring at 3). They belong in `SettingsFlags`
(`packages/shared/src/graphql/settings.ts`). The API rejects flags it does not
declare, so until daily-api adds the fields they have to ride the client-only
settings-flag seam rather than being sent in `updateUserSettings`.

**Log events.** `tour_start`, `tour_step` (step id), `tour_skip` (step id),
`tour_complete`, `tour_replay`, `pin_from_coach` (drag | button),
`dots_coach_seen`. Skip-by-step is the one that tells us whether three steps is
still one too many.

## Deliberately not shipped

Each of these was built in the exploration folder and left there:

- **Hotspot beacons** (02) — pull-based, but they add permanent visual noise to
  a rail we just asked people to relearn.
- **Make-it-yours checklist** (03) — measurable, but it is a second onboarding
  surface for a navigation change nobody asked for.
- **Teaching empty dock** (05) — the dock ships with pins, so the empty state
  almost never renders.
- **What's-new announcement card** (07) — the tour already is the one sanctioned
  interruption; two pushes is one too many.
- **Interactive playground** (08) — a sandbox teaches the sandbox; the real
  panel is right there.
- **"New" pills** (09) — every pill is a promise to remove it later, and the
  Game Center step covers the one genuinely merged surface.
- **Autoplaying tour** (01 Autoplay) — takes reading control away from the user
  for a saving of three clicks.
