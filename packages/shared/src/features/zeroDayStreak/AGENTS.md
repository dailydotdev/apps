# Zero-day streak

The first-week run for brand-new accounts: seven days, one claim a day, gated on
reading a post. Gotchas and product rules the code does not make obvious.

## It is a reading streak, not a visiting streak

Opening the app is not the qualifying act — a post has to be read. Any copy that
says "come back" teaches the wrong habit: someone who returns, finds a dead
button and leaves has done exactly what we asked. The headline states the price
of entry and never changes: **"Read a daily post to claim"**. Which day is live
is on the tiles, what it pays is on the tile, and what to do next is the button.

## Week one is failable

A missed day costs the run. This replaces an earlier, forgiving model — no
auto-claim, no "we kept it for you" — and it is deliberate: the run asks for one
thing, and it has to mean it.

**Reading keeps the run alive. Claiming advances it.** Two acts, two jobs, and
most of the rules fall out of keeping them apart:

1. **A day that ends with no post read breaks the run.** A banked freeze is
   spent to cover it; with none left, the ladder resets and the next day is
   day 1 again.
2. **Read but not claimed? Nothing is collected for the user.** The reward
   stays claimable and the run still advances, because reading is what moves
   it. Someone who read yesterday and never tapped opens today with two claims
   waiting.
3. **Unclaimed rewards stack.** They do not expire inside the run and they can
   be collected out of order — the card shows a live button on every day that
   has been earned, not only on today. A pending day is not marked in any other
   way: same stroke, same fill and same plain day number as a day still ahead,
   because the live button on it is the whole difference. Today keeps the
   travelling border and the filled pill — more than one day can be claimable,
   but only one is today.
4. **Cores already claimed are never clawed back.** A reset restarts the
   ladder, not the balance. Banked freezes survive it too.

**A freeze is spent in the background.** No dialog, no "we saved you" banner on
the card. Asking is pointless — the day is already gone by the time anyone could
answer. But now that a freeze is the difference between keeping the run and
starting over, spending one is worth saying in the **push notification**, which
is the only surface that reaches someone who is not looking at the card.

**The card still only shows the run as it now stands.** No banner, no recovery
notice: a `freezeCovered` prop was built and removed, and nothing has changed
about that. What the card now *lacks* is a way to say the run is at risk — see
*Open questions*.

**The notification changed job with this rule.** It was a nudge; it is now also
a warning, because missing the day has a consequence worth naming. It still has
to name the act rather than the app — read a post, then claim — and per the
original brief, name a human where it can. It is also why the switch pays a
freeze for turning it on, and that trade is a better one than it was: the thing
it pays in now does real work.

**Why failable.** The counter-argument is on the record and still stands: loss
aversion pulls only while the user holds something, and once a streak is gone it
repels — the cheapest way never to lose it again is never to come back. That is
the risk this model takes in exchange for the run meaning something. It is worth
watching for in the numbers, as a drop-off that starts the day after a reset.

**The consequence for copy:** consecutive days are enforced, so *streak* is the
right word again. Earlier copy that framed week one as a welcome run to finish
in any order is no longer true.

## Rules for an unclaimed day

Two inputs: was a post read, and has the day ended.

| | Day open | Day ended |
|---|---|---|
| **Read** | Claim is live | Claim stays live and the run advances anyway. Nothing auto-claims; the reward waits for the tap. |
| **Not read** | Claim is visible but disabled | A freeze is spent, or the ladder resets to day 1. |

- An unclaimed day is not forfeited by the day ending — only by the run
  resetting under it. Several can be pending at once, which is what the panel's
  "3 rewards ready" row counts.
- The disabled claim stays on screen: the headline states the condition, the
  greyed button is what it unlocks.

## Open questions

Three, all opened by making week one failable:

1. **The modal has no "at risk" state.** Nothing on the card says a missed day
   costs the run, or that a freeze is about to be spent to cover one. With a
   real consequence in play that is the biggest gap in the design.
2. **The freeze rewards need more prominence.** Days 3 and 6 went from inert to
   load-bearing, and they are still drawn as the smallest rungs on the ladder.
3. **Does a reset take pending unclaimed rewards with it?** Assumed yes — they
   were earned by reading but never collected, and carrying them across a reset
   means the ladder restarts holding a debt. This matters more now that claims
   stack: a reset could wipe several at once, which is a far worse moment than
   losing one. Worth confirming.

## Cycles

The run does not end at day 7 — it **repeats**, and the rewards may be re-tuned
between cycles. Two consequences:

- **The ladder is data, not a constant.** `weekPlan` being a module-level array
  only holds while there is exactly one week. A repeating run with changeable
  amounts needs the plan to arrive per cycle (flag payload or backend), and
  every prototype that reads `weekPlan` directly will need redirecting.
- **Copy that counts to seven stops being true on the second lap.** "Seven days,
  seven rewards" is a first-cycle line. A later cycle needs either its own
  framing or copy that does not promise a finish.

**The rules carry over unchanged.** Week one is failable, and so is every lap
after it — there is no longer a forgiving first week to graduate out of, which
is one thing the change above simplifies. What a reset means on lap three, when
the user has banked real Cores, is the same thing it means on lap one: the
ladder restarts, the balance does not.

## Measuring it

Judge any change here on D1→D7 retention for **assigned vs control**, never for
"kept the streak" vs "lost it". The second comparison regresses on itself:
keeping the streak is the outcome, not the input. Same trap as "claimed twice vs
claimed once".

## Code

- `lib/zeroDayStreak.ts` owns the week shape. `getZeroDayWeek` has a deliberate
  off-by-one: with `claimedToday`, the just-claimed day stays `Today` rather
  than becoming `Claimed`, so the live tile does not jump on claim. The spec
  pins this — read it before changing the indexing.
- `hooks/useZeroDayStreak.ts` claims **sequentially**. Each `claimQuestReward`
  returns a whole fresh dashboard, so parallel claims race the cache write.
- The flag is `featureZeroDayStreak`. Only zero-day accounts evaluate it, so the
  split is not diluted by users who would never see it.

## Design

The prototype lives in `packages/storybook/stories/features/zeroDayStreak/`.
`ZeroDayStreak.stories.tsx` is the one page to look at: the entry row in the
reading-streak panel, the three responsive arrangements side by side, and every
state of the run. `ZeroDayStreak Review` is the same card on its own, with a
story per breakpoint.

Both render `WeeklyRewardsModal`, which is the card. There is no second
implementation and no separate phone mock — the earlier `ArcadeWeekModal` and
`mobileLayouts`, and the exploration pages before them (eight day arrangements,
eight phone layouts, six entry points, six ways of speaking the streak's
language) were deleted once each was decided. The decisions, not the
alternatives, are what this file records.

`streakPopover.tsx` is a MOCK of the production popover, not the real one:
`ReadingStreakPopup` reads boot, the 30-day history, freeze dates, push state
and the timezone check out of six hooks that do not exist in Storybook. It
copies the parts the eye measures a new row against and nothing else, so do not
settle an argument about a few pixels with it.

Five things that bite anyone editing this:

- **The card is pinned dark in both themes.** Its surfaces are fixed hexes from
  `rewardArt.tsx`, so `text-text-*` and other theme tokens resolve against the
  APP theme and come out near-black on near-black in light mode. Use the frozen
  `ARCADE.ink*` values instead, and tell every design-system component dropped
  onto the card separately.
- **The arrangement follows the VIEWPORT, not the box.** A bottom sheet with a
  snap-scrolling day row under 656px, the seven days across above it, the cast
  only from 1120px. Dropping the card in a narrow div will not trigger any of
  it — which is why the page frames each breakpoint in an iframe, and why a
  stage that pads the card in on a phone squeezes it under the width its own
  breakpoints assume.
- **`min-[…]` arbitrary variants silently never compile.** The theme's `screens`
  include a raw `(pointer)` entry, which switches them off, so the cast's
  1120px rule is a plain media query in the card's `<style>` block.
- **One tile height, one slot height.** Tiles are `h-40` and the slot at the
  foot is `h-8` in every state — claim, tick, dashed outline or lock. That is
  what stops the row turning into a staircase, and what stops the live tile
  shrinking under the cursor at the moment of the claim.
- **More than one day can be claimable.** `pendingDays` marks days read and
  never collected; they keep their reward art and get a live button, and the
  claim flight starts from whichever tile was pressed. Only today gets the lit
  frame.

A claimed day is drawn with `ReadingStreakIcon secondary` and a check badge —
the same glyph the streak popover uses for a completed reading day. That is
deliberate: a claimed day IS a streak day, and it is the thing that ties the
two surfaces together.

The header never changes, with one exception: once the last reward is
collected the title and the rule give way to the finale copy and confetti runs
once. A card still saying "read one post a day to unlock" over a finished week
is talking past the person who just finished it.
