import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { StreakBadge } from '@dailydotdev/shared/src/components/sidebar/StreakBadge';
import { GiftIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  DEFAULT_SIGNAL,
  GLYPH,
  GlyphBox,
  isReadState,
  Legend,
  microNumeral,
  MiniRail,
  OnRail,
  RailTab,
  RING_PATH_RADIUS,
  SectionHeading,
  STREAK_STATES,
  TodayBaseline,
  Variant,
} from './railQuestMark.mocks';
import type { RailSignal } from './railQuestMark.mocks';

// ROUND 2 — refining the three directions that survived review.
//
// The rejected round-1 options (segmented ring, liquid fill, inner concentric
// arc, two tabs) all failed the same way: any second PROGRESS indicator on the
// badge visually fuses with the streak's own ring and reads as a broken control
// rather than two facts. So the rule for this round:
//
//   The streak owns the ring. Quests get a DISCRETE TOKEN or a MOMENT IN TIME —
//   never an arc, never a fill, never a second progress track.
//
// That leaves exactly three mechanics, developed below:
//   A — the gem   : a token set into the ring          (round 1, option 02)
//   B — the chip  : a counted token in the corner      (round 1, option 04)
//   C — the moment: a one-shot reveal on arrival       (round 1, option 08)
//
// A and B are resting states; C is an event. They are not rivals — the endgame
// is one of A/B as the resting mark plus C as the arrival. See "Recommended".

const CABBAGE = 'bg-accent-cabbage-default';

// ─── A · the gem ─────────────────────────────────────────────────────────────

// A token placed ON the ring's stroke centre line at a given angle (0 = top,
// measured clockwise), so it belongs to the ring instead of floating near it.
const RingGem = ({
  angle,
  size = 7,
  square = false,
  separator = true,
  index = 0,
}: {
  angle: number;
  size?: number;
  square?: boolean;
  separator?: boolean;
  index?: number;
}): ReactElement => {
  const radians = (angle * Math.PI) / 180;
  const cx = GLYPH / 2 + RING_PATH_RADIUS * Math.sin(radians);
  const cy = GLYPH / 2 - RING_PATH_RADIUS * Math.cos(radians);

  return (
    <span
      key={index}
      aria-hidden
      className={classNames(
        'absolute',
        CABBAGE,
        square ? 'rounded-[2px]' : 'rounded-full',
        // The separator is what makes it read as ON the ring rather than
        // smeared into it — but it only works while the tab background matches.
        separator && 'ring-1 ring-background-default',
      )}
      style={{
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
      }}
    />
  );
};

// Carves circular holes out of whatever it is applied to, so a mark nests INTO
// the badge instead of sitting on top of it. This is the one mechanic shared by
// the gem and the chip.
//
// It replaced an earlier attempt that opened a gap in the ring's stroke: on the
// `safe` state the disc is filled pink and the ring is the same pink, so a gap
// in the stroke was completely invisible — and `safe` is the state most users
// see. Masking the whole badge cuts through fill and ring together, so it reads
// on every state.
const biteMask = (
  holes: { x: number; y: number; r: number }[],
): CSSProperties => {
  const gradients = holes
    .map(
      ({ x, y, r }) =>
        `radial-gradient(circle ${r}px at ${x}px ${y}px, transparent 98%, #000 100%)`,
    )
    .join(',');

  return {
    WebkitMaskImage: gradients,
    maskImage: gradients,
    WebkitMaskComposite: 'source-in',
    maskComposite: 'intersect',
  };
};

// Where a gem's centre lands for a given angle on the ring.
const gemCentre = (angle: number) => {
  const radians = (angle * Math.PI) / 180;

  return {
    x: GLYPH / 2 + RING_PATH_RADIUS * Math.sin(radians),
    y: GLYPH / 2 - RING_PATH_RADIUS * Math.cos(radians),
  };
};

// A1 — round 1 as shipped: gem laid over an unbroken ring.
const GemOverRing = (signal: RailSignal, angle = 45): ReactElement => (
  <GlyphBox>
    <StreakBadge state={signal.streakState} hasReadToday={signal.hasReadToday} />
    {signal.claimable > 0 && <RingGem angle={angle} />}
  </GlyphBox>
);

// A2 — the badge opens to receive the gem.
const GemInNotch = (
  signal: RailSignal,
  { angle = 45, gemSize = 7, clearance = 1.5 } = {},
): ReactElement => {
  const holes = [{ ...gemCentre(angle), r: gemSize / 2 + clearance }];

  return (
    <GlyphBox>
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={signal.claimable > 0 ? biteMask(holes) : undefined}
      >
        <StreakBadge
          state={signal.streakState}
          hasReadToday={signal.hasReadToday}
        />
      </span>
      {signal.claimable > 0 && (
        <RingGem angle={angle} size={gemSize} separator={false} />
      )}
    </GlyphBox>
  );
};

// A6 — one gem per waiting reward. Discrete tokens, so it stays a count rather
// than becoming an arc — but see the note: at three it starts to drift.
const GemCluster = (signal: RailSignal): ReactElement => {
  const count = Math.min(3, signal.claimable);
  const gemSize = 6;
  // Centres must be at least a gem apart plus a gap, or the beads merge into the
  // dashed arc this whole round exists to avoid.
  const circumference = 2 * Math.PI * RING_PATH_RADIUS;
  const spacing = ((gemSize + 2.5) / circumference) * 360;
  const start = 45 - ((count - 1) * spacing) / 2;
  const angles = Array.from({ length: count }, (_, i) => start + i * spacing);
  const holes = angles.map((angle) => ({
    ...gemCentre(angle),
    r: gemSize / 2 + 1.25,
  }));

  return (
    <GlyphBox>
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={count > 0 ? biteMask(holes) : undefined}
      >
        <StreakBadge
          state={signal.streakState}
          hasReadToday={signal.hasReadToday}
        />
      </span>
      {angles.map((angle) => (
        <RingGem key={angle} angle={angle} size={gemSize} separator={false} />
      ))}
    </GlyphBox>
  );
};

// ─── B · the chip ────────────────────────────────────────────────────────────

const CHIP = 13;
// Where the chip's centre lands when it is pinned to the box's bottom-right.
const CHIP_CENTRE = GLYPH - CHIP / 2;

// A rounded-rect hole, for the squircle chip. A radial-gradient bite cannot
// match a square: on the axes it clears 2px past the chip's edge while the
// chip's own corners poke out along the diagonal, which is exactly the mismatch
// the first squircle attempt showed. This punches the real shape instead.
//
// CSS `mask-image` on an HTML element masks by ALPHA, so the kept area is opaque
// and the hole must be fully transparent — hence one path, filled opaque, with
// the hole as a second subpath under `evenodd`.
const squircleBiteMask = (
  x: number,
  y: number,
  size: number,
  radius: number,
): CSSProperties => {
  const r = Math.min(radius, size / 2);
  const hole =
    `M${x + r},${y} h${size - 2 * r} a${r},${r} 0 0 1 ${r},${r}` +
    ` v${size - 2 * r} a${r},${r} 0 0 1 ${-r},${r}` +
    ` h${-(size - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r}` +
    ` v${-(size - 2 * r)} a${r},${r} 0 0 1 ${r},${-r} z`;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${GLYPH}' height='${GLYPH}'>` +
    `<path fill='#000' fill-rule='evenodd' d='M0,0 H${GLYPH} V${GLYPH} H0 Z ${hole}'/>` +
    `</svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

  return { WebkitMaskImage: url, maskImage: url };
};

const Chip = ({
  count,
  square = false,
  separator = true,
}: {
  count: number;
  square?: boolean;
  separator?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'absolute bottom-0 right-0 flex items-center justify-center px-[3px] text-white',
      CABBAGE,
      square ? 'rounded-[4px]' : 'rounded-full',
      // A BORDER, not a ring: a border sits inside the chip's own box, so the
      // chip cannot push past the 26px glyph.
      separator && 'border-2 border-background-default',
      microNumeral,
    )}
    style={{ height: CHIP, minWidth: CHIP }}
  >
    {count > 9 ? '9+' : count}
  </span>
);

// B1 — round 1 as shipped: badge shrunk to 82% to make room.
const ChipWithShrunkBadge = (signal: RailSignal): ReactElement => (
  <GlyphBox>
    <span className="inline-block scale-[0.82]">
      <StreakBadge
        state={signal.streakState}
        hasReadToday={signal.hasReadToday}
      />
    </span>
    {signal.claimable > 0 && <Chip count={signal.claimable} />}
  </GlyphBox>
);

// B2 — badge at full size; the chip simply overlaps its corner.
const ChipOverBadge = (signal: RailSignal, square = false): ReactElement => (
  <GlyphBox>
    <StreakBadge state={signal.streakState} hasReadToday={signal.hasReadToday} />
    {signal.claimable > 0 && <Chip count={signal.claimable} square={square} />}
  </GlyphBox>
);

// B3/B4 — the badge has a bite taken out of it and the chip nests in the hole.
// No border on the chip, so there is no colour to mismatch when the tab is
// hovered. The hole is shape-matched to the chip.
const ChipInBite = (signal: RailSignal, square = false): ReactElement => {
  const clearance = 1.5;
  const mask = square
    ? squircleBiteMask(
        CHIP_CENTRE - CHIP / 2 - clearance,
        CHIP_CENTRE - CHIP / 2 - clearance,
        CHIP + clearance * 2,
        4 + clearance,
      )
    : biteMask([{ x: CHIP_CENTRE, y: CHIP_CENTRE, r: CHIP / 2 + clearance }]);

  return (
    <GlyphBox>
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={signal.claimable > 0 ? mask : undefined}
      >
        <StreakBadge
          state={signal.streakState}
          hasReadToday={signal.hasReadToday}
        />
      </span>
      {signal.claimable > 0 && (
        <Chip count={signal.claimable} square={square} separator={false} />
      )}
    </GlyphBox>
  );
};

// ─── C · the moment ──────────────────────────────────────────────────────────

type Arrival = 'pop' | 'flip' | 'drop';

const REVEAL_MS = 1500;

// A one-shot reveal, NOT a loop: the reward lands, the glyph announces it once,
// then hands the tab back to the streak and leaves the resting mark behind.
// Looping was round 1's real flaw — persistent motion in a rail gets tuned out.
const ArrivalMoment = ({
  signal,
  arrival,
  rest,
  autoPlay = true,
}: {
  signal: RailSignal;
  arrival: Arrival;
  rest: (signal: RailSignal) => ReactElement;
  autoPlay?: boolean;
}): ReactElement => {
  const [revealing, setRevealing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const play = useCallback(() => {
    clearTimeout(timer.current);
    setRevealing(true);
    timer.current = setTimeout(() => setRevealing(false), REVEAL_MS);
  }, []);

  useEffect(() => {
    if (autoPlay) {
      play();
    }
    return () => clearTimeout(timer.current);
  }, [autoPlay, play]);

  const springy = 'duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
  const hiddenByArrival: Record<Arrival, string> = {
    pop: 'scale-50 opacity-0',
    flip: 'opacity-0 [transform:rotateY(90deg)]',
    drop: '-translate-y-3 opacity-0',
  };
  const restHiddenByArrival: Record<Arrival, string> = {
    pop: 'scale-75 opacity-0',
    flip: 'opacity-0 [transform:rotateY(-90deg)]',
    drop: 'scale-90 opacity-0',
  };

  return (
    <span className="flex flex-col items-center gap-2">
      <OnRail>
        <RailTab
          label={signal.days}
          glyph={
            <GlyphBox>
              <span
                className={classNames(
                  'absolute flex transition-[opacity,transform] motion-reduce:transition-none',
                  springy,
                  revealing ? restHiddenByArrival[arrival] : 'opacity-100',
                )}
              >
                {rest(signal)}
              </span>
              <span
                aria-hidden
                className={classNames(
                  'absolute flex size-[23px] items-center justify-center rounded-full text-white transition-[opacity,transform] motion-reduce:transition-none',
                  CABBAGE,
                  springy,
                  revealing ? 'opacity-100' : hiddenByArrival[arrival],
                )}
              >
                <GiftIcon secondary size={IconSize.Size16} />
              </span>
            </GlyphBox>
          }
        />
      </OnRail>
      <button
        type="button"
        onClick={play}
        className="focus-outline rounded-8 bg-surface-float px-2 py-1 text-text-tertiary typo-caption2 hover:text-text-primary"
      >
        Replay
      </button>
    </span>
  );
};

// ─── the two finalists, as reusable marks ────────────────────────────────────

const RestGem = (signal: RailSignal): ReactElement => GemInNotch(signal);
const RestChip = (signal: RailSignal): ReactElement => ChipInBite(signal, true);

const withClaimable = (signal: RailSignal, claimable: number): RailSignal => ({
  ...signal,
  claimable,
});

const meta: Meta = {
  title: 'Components/Sidebar/Rail quest mark',
  decorators: [
    (Story) => (
      <div className="dark min-h-dvh bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] p-8">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
};

export default meta;

type Story = StoryObj;

// ─── stories ─────────────────────────────────────────────────────────────────

export const GemRefinements: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SectionHeading eyebrow="A · the gem" title="A token set into the badge">
        The round-1 gem sat on top of the badge, which is why it still read as a
        dot parked at the corner. Cutting a real hole for it is what turns two
        shapes into one object — and it removes the separator ring, a colour that
        has to match the tab background and stops matching the moment you hover.
        <br />
        <br />
        First attempt opened a gap in the ring&apos;s stroke instead. That failed:
        on the <b>safe</b> state the disc is filled pink and the ring is the same
        pink, so a gap in the stroke was invisible — and safe is the state most
        users see most days. Cutting through fill and ring together is the only
        version that reads on every state.
      </SectionHeading>
      <Legend />
      <div className="flex flex-wrap gap-4">
        <Variant
          code="A1"
          title="Over the ring"
          note="Round 1. The separator ring is a hard background-default edge — it only disappears while the tab is at rest."
        >
          <OnRail>
            <RailTab
              label={DEFAULT_SIGNAL.days}
              glyph={GemOverRing(DEFAULT_SIGNAL)}
            />
          </OnRail>
        </Variant>

        <Variant
          code="A2"
          title="Bitten badge"
          note="A hole is cut through fill and ring together. No separator colour, so nothing to mismatch on hover."
        >
          <OnRail>
            <RailTab
              label={DEFAULT_SIGNAL.days}
              glyph={GemInNotch(DEFAULT_SIGNAL)}
            />
          </OnRail>
        </Variant>

        <Variant
          code="A3"
          title="Bite clearance"
          note="How much badge is cut away around the gem. 0.5px reads as a printing error; 2.5px starts to look like a chunk is missing."
        >
          {[0.5, 1.5, 2.5].map((clearance) => (
            <OnRail key={clearance}>
              <RailTab
                label={clearance}
                glyph={GemInNotch(DEFAULT_SIGNAL, { clearance })}
              />
            </OnRail>
          ))}
        </Variant>

        <Variant
          code="A4"
          title="Position"
          note="45° is closest to the Activity bubble above. 135° (bottom-right) puts the most distance between the two purple marks."
        >
          {[45, 90, 135].map((angle) => (
            <OnRail key={angle}>
              <RailTab
                label={`${angle}°`}
                glyph={GemInNotch(DEFAULT_SIGNAL, { angle })}
              />
            </OnRail>
          ))}
        </Variant>

        <Variant
          code="A5"
          title="Gem size"
          note="6px reads as a bead, 8px starts to dominate the ring it sits in."
        >
          {[6, 7, 8].map((gemSize) => (
            <OnRail key={gemSize}>
              <RailTab
                label={gemSize}
                glyph={GemInNotch(DEFAULT_SIGNAL, { gemSize })}
              />
            </OnRail>
          ))}
        </Variant>

        <Variant
          code="A6"
          title="One gem per reward"
          note="Discrete beads, so it stays countable and never becomes an arc. Caps at 3 — beyond that it turns into the thing we rejected."
        >
          {[1, 2, 3].map((claimable) => (
            <OnRail key={claimable}>
              <RailTab
                label={claimable}
                glyph={GemCluster(withClaimable(DEFAULT_SIGNAL, claimable))}
              />
            </OnRail>
          ))}
        </Variant>
      </div>
    </div>
  ),
};

export const ChipRefinements: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="B · the chip"
        title="A counted token in the corner"
      >
        The chip is the only direction that carries an exact number. Round 1 paid
        for it by shrinking the badge to 82%, which broke the icon-size
        consistency the rail just went through. It does not need to: the badge can
        stay full size and have a bite taken out of it instead.
      </SectionHeading>
      <Legend />
      <div className="flex flex-wrap gap-4">
        <Variant
          code="B1"
          title="Shrunken badge"
          note="Round 1. The streak badge is visibly smaller than every neighbouring glyph."
        >
          <OnRail>
            <RailTab
              label={DEFAULT_SIGNAL.days}
              glyph={ChipWithShrunkBadge(DEFAULT_SIGNAL)}
            />
          </OnRail>
        </Variant>

        <Variant
          code="B2"
          title="Full-size, overlapping"
          note="Badge back to full size. The chip's 2px border cuts a flat bar across the flame."
        >
          <OnRail>
            <RailTab
              label={DEFAULT_SIGNAL.days}
              glyph={ChipOverBadge(DEFAULT_SIGNAL)}
            />
          </OnRail>
        </Variant>

        <Variant
          code="B3"
          title="Bitten badge"
          note="The badge is masked so the chip nests in a hole. No border colour at all, so hover cannot break it."
        >
          <OnRail>
            <RailTab
              label={DEFAULT_SIGNAL.days}
              glyph={ChipInBite(DEFAULT_SIGNAL)}
            />
          </OnRail>
        </Variant>

        <Variant
          code="B4"
          title="Squircle chip"
          note="Matches the Activity bell's own rounded-square badge, so the rail speaks one badge language."
        >
          <OnRail>
            <RailTab
              label={DEFAULT_SIGNAL.days}
              glyph={ChipInBite(DEFAULT_SIGNAL, true)}
            />
          </OnRail>
        </Variant>

        <Variant
          code="B5"
          title="Counts"
          note="The chip grows rightward into the box; 9+ is the cap before it would overflow the glyph."
        >
          {[1, 3, 9, 12].map((claimable) => (
            <OnRail key={claimable}>
              <RailTab
                label={claimable > 9 ? '9+' : claimable}
                glyph={ChipInBite(withClaimable(DEFAULT_SIGNAL, claimable), true)}
              />
            </OnRail>
          ))}
        </Variant>
      </div>

      <SectionHeading
        eyebrow="B · the hover problem"
        title="Why the separator colour matters"
      >
        A chip or gem separated by a hard `background-default` edge only looks
        right while the tab is at rest. Hovering paints `surface-hover` behind it
        and the separator becomes a visible halo. The bitten variants have no
        separator colour, so they are identical in all three states.
      </SectionHeading>
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'rest', bg: 'bg-background-default' },
          { label: 'hover', bg: 'bg-surface-hover' },
          { label: 'selected', bg: 'bg-background-default' },
        ].map(({ label, bg }) => (
          <Variant key={label} code={label} title="B2 bordered / B3 bitten">
            <span className={classNames('inline-block rounded-12 p-1', bg)}>
              <RailTab
                label={DEFAULT_SIGNAL.days}
                glyph={ChipOverBadge(DEFAULT_SIGNAL)}
                selected={label === 'selected'}
              />
            </span>
            <span className={classNames('inline-block rounded-12 p-1', bg)}>
              <RailTab
                label={DEFAULT_SIGNAL.days}
                glyph={ChipInBite(DEFAULT_SIGNAL, true)}
                selected={label === 'selected'}
              />
            </span>
          </Variant>
        ))}
      </div>
    </div>
  ),
};

export const ArrivalMoments: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="C · the moment"
        title="One-shot reveal, then hand the tab back"
      >
        Round 1 looped this forever, which is why it read as noise. It should fire
        ONCE when a reward actually lands, hold about a second, then settle to the
        resting mark. That is the answer to &ldquo;the streak loses its
        home&rdquo;: the streak only ever gives up the glyph for a moment. Each
        plays on load — hit Replay to see it again.
      </SectionHeading>
      <Legend />
      <div className="flex flex-wrap gap-6">
        {(
          [
            ['C1', 'Pop → gem', 'pop', RestGem],
            ['C2', 'Flip → chip', 'flip', RestChip],
            ['C3', 'Drop → gem', 'drop', RestGem],
          ] as [string, string, Arrival, (s: RailSignal) => ReactElement][]
        ).map(([code, title, arrival, rest]) => (
          <Variant key={code} code={code} title={title}>
            <ArrivalMoment
              signal={DEFAULT_SIGNAL}
              arrival={arrival}
              rest={rest}
            />
          </Variant>
        ))}
      </div>
    </div>
  ),
};

export const Recommended: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="recommendation"
        title="Bitten squircle chip at rest, pop on arrival"
      >
        The chip is the only finalist that carries a count, and once it nests in a
        bite it costs the badge nothing — full size, no separator colour, no
        second progress track. Pair it with the one-shot pop so arrival still has
        a moment. The gem stays the fallback if we decide the exact number is not
        worth the corner.
      </SectionHeading>
      <Legend />

      <div className="flex flex-wrap items-start gap-6">
        <Variant code="—" title="Today (control)">
          <OnRail>
            <TodayBaseline signal={DEFAULT_SIGNAL} />
          </OnRail>
        </Variant>
        <Variant code="B4" title="Recommended · chip">
          <OnRail>
            <RailTab
              label={DEFAULT_SIGNAL.days}
              glyph={RestChip(DEFAULT_SIGNAL)}
            />
          </OnRail>
        </Variant>
        <Variant code="A2" title="Fallback · gem">
          <OnRail>
            <RailTab
              label={DEFAULT_SIGNAL.days}
              glyph={RestGem(DEFAULT_SIGNAL)}
            />
          </OnRail>
        </Variant>
      </div>

      <SectionHeading title="Nothing waiting → something waiting">
        The resting tab must be completely unchanged when there is nothing to
        claim, or the mark stops meaning anything.
      </SectionHeading>
      <div className="flex flex-wrap gap-4">
        {[0, 1, 2, 5].map((claimable) => (
          <Variant key={claimable} code={`${claimable}`} title="waiting">
            <OnRail>
              <RailTab
                label={DEFAULT_SIGNAL.days}
                glyph={RestChip(withClaimable(DEFAULT_SIGNAL, claimable))}
              />
            </OnRail>
            <OnRail>
              <RailTab
                label={DEFAULT_SIGNAL.days}
                glyph={RestGem(withClaimable(DEFAULT_SIGNAL, claimable))}
              />
            </OnRail>
          </Variant>
        ))}
      </div>

      <SectionHeading title="Against every streak state">
        The danger states are the test: at-risk and critical must stay the loudest
        thing on the tab even with a reward waiting.
      </SectionHeading>
      <div className="flex flex-wrap gap-3">
        {STREAK_STATES.map((streakState) => {
          const signal: RailSignal = {
            ...DEFAULT_SIGNAL,
            streakState,
            hasReadToday: isReadState(streakState),
          };

          return (
            <Variant key={streakState} code="" title={streakState}>
              <OnRail>
                <RailTab label={signal.days} glyph={RestChip(signal)} />
              </OnRail>
              <OnRail>
                <RailTab label={signal.days} glyph={RestGem(signal)} />
              </OnRail>
            </Variant>
          );
        })}
      </div>

      <SectionHeading title="In the rail">
        Under the Activity bell, which owns the other purple mark in this column.
      </SectionHeading>
      <div className="flex flex-wrap gap-6">
        {(
          [
            ['Recommended · chip', RestChip],
            ['Fallback · gem', RestGem],
            ['Today (control)', null],
          ] as [string, ((s: RailSignal) => ReactElement) | null][]
        ).map(([title, mark]) => (
          <div key={title} className="flex flex-col items-center gap-2">
            <MiniRail>
              {mark ? (
                <RailTab
                  label={DEFAULT_SIGNAL.days}
                  glyph={mark(DEFAULT_SIGNAL)}
                />
              ) : (
                <TodayBaseline signal={DEFAULT_SIGNAL} />
              )}
            </MiniRail>
            <span className="text-text-tertiary typo-caption2">{title}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

// Every finalist at 3x, because these live or die on detail that is invisible at
// 26px — the notch gap, the bite clearance, the chip's corner radius.
export const Zoomed: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <SectionHeading title="Finalists at 3x" />
      <div className="grid grid-cols-2 gap-x-8 gap-y-14 laptop:grid-cols-4">
        {(
          [
            ['A1', 'Gem over ring', GemOverRing(DEFAULT_SIGNAL)],
            ['A2', 'Gem in notch', GemInNotch(DEFAULT_SIGNAL)],
            ['A6', 'Gem cluster ×3', GemCluster(withClaimable(DEFAULT_SIGNAL, 3))],
            ['B1', 'Chip, shrunk badge', ChipWithShrunkBadge(DEFAULT_SIGNAL)],
            ['B2', 'Chip, bordered', ChipOverBadge(DEFAULT_SIGNAL)],
            ['B3', 'Chip in bite', ChipInBite(DEFAULT_SIGNAL)],
            ['B4', 'Squircle in bite', ChipInBite(DEFAULT_SIGNAL, true)],
            ['B5', 'Squircle, 9+', ChipInBite(withClaimable(DEFAULT_SIGNAL, 12), true)],
          ] as [string, string, ReactNode][]
        ).map(([code, title, glyph]) => (
          <div key={code} className="flex flex-col items-center gap-8">
            <span className="flex h-24 items-center justify-center">
              <span className="inline-block scale-[3]">{glyph}</span>
            </span>
            <span className="text-center text-text-tertiary typo-caption1">
              {code} {title}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: { ...DEFAULT_SIGNAL, claimable: 2 },
  argTypes: {
    streakState: { control: 'select', options: STREAK_STATES },
    hasReadToday: { control: 'boolean' },
    days: { control: { type: 'number', min: 0, max: 999 } },
    claimable: { control: { type: 'range', min: 0, max: 12, step: 1 } },
    done: { table: { disable: true } },
    total: { table: { disable: true } },
  },
  render: (args) => {
    const signal = args as RailSignal;

    return (
      <div className="flex flex-col gap-6">
        <SectionHeading
          eyebrow="playground"
          title="Drive the finalists from one control set"
        >
          Change `claimable` and `streakState` in the controls panel. Watch the
          zero state especially — the tab has to be indistinguishable from today
          when nothing is waiting.
        </SectionHeading>
        <Legend />
        <div className="flex flex-wrap gap-4">
          {(
            [
              ['—', 'Today (control)', null],
              ['A2', 'Gem in notch', RestGem],
              ['A6', 'Gem cluster', GemCluster],
              ['B4', 'Squircle in bite', RestChip],
              ['B2', 'Chip, bordered', (s: RailSignal) => ChipOverBadge(s, true)],
            ] as [string, string, ((s: RailSignal) => ReactElement) | null][]
          ).map(([code, title, mark]) => (
            <Variant key={title} code={code} title={title}>
              <OnRail>
                {mark ? (
                  <RailTab label={signal.days} glyph={mark(signal)} />
                ) : (
                  <TodayBaseline signal={signal} />
                )}
              </OnRail>
            </Variant>
          ))}
        </div>
        <div className="flex flex-wrap gap-6">
          {(
            [
              ['C1', 'Pop → gem', 'pop', RestGem],
              ['C2', 'Flip → chip', 'flip', RestChip],
            ] as [string, string, Arrival, (s: RailSignal) => ReactElement][]
          ).map(([code, title, arrival, rest]) => (
            <Variant key={code} code={code} title={title}>
              <ArrivalMoment signal={signal} arrival={arrival} rest={rest} />
            </Variant>
          ))}
        </div>
      </div>
    );
  },
};
