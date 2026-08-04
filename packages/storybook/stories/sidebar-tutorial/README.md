# Sidebar customization tutorial — research + concept gallery

Exploration for teaching users the layout-v2 sidebar after the switch from the old
one. Three things need teaching, in this order of urgency:

1. **The reorganization** — navigation moved into a rail with tabs (Explore, You,
   Squads, Streak), Home lives on the logo, panels open on hover. Muscle memory
   breaks on day one; this is the "where did everything go?" moment.
2. **Drag-and-drop customization** — pins can be dragged out of panels into the
   dock and reordered. Invisible without signifiers.
3. **The shortcuts dock** — a customizable set of pinned pages (Tags, Sources,
   Bookmarks, History…) below the rail, managed via the ••• tray.

Each concept in this folder is one Storybook story built on the shared mock rail
in `mockSidebar.tsx`. They span the trigger spectrum from *attention-grabbing*
(we interrupt) to *intent-based* (the UI responds to what the user just did).

## What the research says

- **Upfront tours are overused and skipped.** NN/g: "push revelations" reveal
  info out of context and users skip them; contextual "pull" help wins because
  users are motivated at that moment. Industry data agrees — tours with 5+ steps
  see ~67% abandonment, while contextual tips measured ~61% higher engagement.
  If a tour exists at all, keep it to 3 steps and make it skippable.
- **A redesign still needs *some* push.** Shipping a nav reorg with only a
  changelog is "rearranging the office and explaining it by memo". One concise,
  benefit-framed announcement is warranted — then everything else should be
  contextual. Respect muscle memory: say where things went, not how great the
  process was.
- **Drag-and-drop is never discovered on its own.** NN/g: without signifiers
  (drag handles, cursor changes, lift/ghost feedback) the affordance is
  invisible; always provide an alternative non-drag path (the ••• tray).
- **Checklists work.** Checklist-based onboarding lifts feature adoption ~32%;
  progress bars exploit the completion instinct (Duolingo). Best when each item
  is an action in the real UI, not a slide.
- **Empty states are the cheapest teachers** (Slack pattern): the dock's own
  empty state can carry the entire "drag pages here" lesson with zero overlays.
- **Reveal on readiness** (Linear pattern): trigger education from behavior —
  third visit to the same page → "pin it?"; hover-linger on a new region →
  explain it. NN/g explicitly blesses hover-triggered instructional overlays.
- **Dismissible and retrievable.** Every overlay needs an easy out AND a way
  back in (a replayable "?" entry) so dismissing ≠ losing the lesson forever.

## Concept catalog

| # | Concept | Trigger style | Teaches |
|---|---------|--------------|---------|
| 01 | Spotlight tour (3 steps) | Push, once | Reorg → dock → customization |
| 02 | Hotspot beacons | Pull, self-paced | Any region, user picks order |
| 03 | "Make it yours" checklist | Push once, then pull | All three, by doing |
| 04 | Intent-based nudges | Pull, behavioral | Pinning, on the Nth visit |
| 05 | Empty dock that teaches | Ambient | Dock + drag target |
| 06 | Drag signifier layer | Ambient, first-run | Drag-and-drop affordance |
| 07 | What's-new announcement card | Push, in-flow | Reorg headline + tour entry |
| 08 | Interactive playground | Push, learn-by-doing | Drag-and-drop, sandboxed |
| 09 | "New" pills with hover reveal | Pull, per-element | Renamed/moved items |
| 10 | Replayable help menu | Pull, always | Everything, retrievable |
| 11 | Panel teaching moments | Pull, on hover-open | Pin/drag squads & pages from open panels |
| 12 | Game Center intro | Pull, first panel open | Streaks + Quests merged into one tab |

## Recommended combination (not a single winner)

The research points at a **layered system**, not one pattern:

- **Day one:** 07 (announcement card) with an optional 01 (3-step spotlight) —
  the single sanctioned push.
- **Always on:** 05 (teaching empty state) + 06 (drag signifiers) + 10 (replay
  entry) — ambient, zero-interruption.
- **Behavioral:** 04 (intent nudges) for pinning; 09 (pills) for moved items;
  11 (panel teaching) inside hover-opened panels — the highest-intent moment we
  get; 12 (Game Center intro) on the first Streak-tab open.
- **Optional engagement play:** 03 (checklist) if we want measurable activation.

## Sources

- [NN/g — Onboarding Tutorials vs. Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/)
- [NN/g — Drag-and-Drop: How to Design for Ease of Use](https://www.nngroup.com/articles/drag-drop/)
- [NN/g — Mobile-App Onboarding: Components and Techniques](https://www.nngroup.com/articles/mobile-app-onboarding/)
- [Appcues — Product tour UI patterns](https://www.appcues.com/blog/product-tours-ui-patterns)
- [Appcues — Onboarding UX patterns](https://www.appcues.com/blog/user-onboarding-ui-ux-patterns)
- [Userpilot — UI updates: communicate and guide for fast adoption](https://userpilot.com/blog/ui-updates/)
- [Userpilot — New feature onboarding](https://userpilot.com/blog/new-feature-onboarding/)
- [Userpilot — Progressive onboarding](https://userpilot.com/blog/progressive-onboarding/)
- [Chameleon — Onboarding UX patterns, data-backed](https://www.chameleon.io/blog/onboarding-ux-patterns)
- [UserGuiding — A guide to feature discovery](https://userguiding.com/blog/feature-discovery)
- [Pencil & Paper — Drag & drop UX best practices](https://www.pencilandpaper.io/articles/ux-pattern-drag-and-drop)
- [SaaSFactor — Why most product tours fail](https://www.saasfactor.co/blogs/why-most-product-tours-fail-and-how-to-implement-contextual-onboarding)
- Arc browser onboarding teardowns ([SaaSUI](https://www.saasui.design/pattern/onboarding/arc-browser), [video breakdown](https://www.youtube.com/watch?v=ALuiwEUJN6Q))
