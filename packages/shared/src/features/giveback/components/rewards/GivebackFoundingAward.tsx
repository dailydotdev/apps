import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CoreIcon, GiftIcon, VIcon } from '../../../../components/icons';
import { FlexCol, FlexRow } from '../../../../components/utilities';
import type { FoundingAwardState } from './rewardReveal';
import { FOUNDING_AWARD, PATCHY_FOUNDING_AWARD } from './rewardReveal';
import { GivebackReveal as Reveal } from '../GivebackReveal';
import { RevealDialogShell } from './GivebackRewardReveal';

// The journey's special first step: a one-time, limited "First 1,000
// contributors" gift (a Patchy award + Cores from the CEO).
//
// PLACEHOLDER: there is no backend contract for the founding award yet, so the
// spot count, member number, and CEO note are frontend placeholders (see
// `FOUNDING_AWARD`) to be wired to live data before this leaves the flag.

const coresLabel = `${PATCHY_FOUNDING_AWARD.coresValue.toLocaleString()} Cores`;

// The award artwork on its glow — the same "floating award" treatment the post
// Awards use. `celebrate` fires the claim pop.
const AwardBadge = ({
  sizeClassName,
  celebrate = false,
}: {
  sizeClassName: string;
  celebrate?: boolean;
}): ReactElement => (
  <span className="relative flex shrink-0 items-center justify-center">
    <span
      aria-hidden
      className="bg-accent-cabbage-default/25 absolute inset-0 m-auto size-3/4 rounded-full blur-2xl motion-safe:animate-glow-pulse"
    />
    <img
      src={PATCHY_FOUNDING_AWARD.image}
      alt={PATCHY_FOUNDING_AWARD.name}
      loading="lazy"
      className={classNames(
        'relative w-auto select-none object-contain',
        sizeClassName,
        celebrate && 'motion-safe:animate-reward-pop',
      )}
    />
  </span>
);

const CeoAttribution = (): ReactElement => (
  <FlexRow className="items-center gap-2">
    <span className="flex size-6 items-center justify-center rounded-full bg-accent-cabbage-default font-bold text-white typo-caption2">
      {FOUNDING_AWARD.ceoName.charAt(0)}
    </span>
    <Typography type={TypographyType.Caption2} color={TypographyColor.Tertiary}>
      Gifted by {FOUNDING_AWARD.ceoName} · {FOUNDING_AWARD.ceoTitle}
    </Typography>
  </FlexRow>
);

// Scarcity as a compact ring — saves vertical height vs. a bar. The ring fills
// by % claimed (same colorful gradient as the border), spots-left in the centre.
const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const ScarcityRing = ({
  claimedCount,
}: {
  claimedCount: number;
}): ReactElement => {
  const { totalSpots } = FOUNDING_AWARD;
  const remaining = Math.max(0, totalSpots - claimedCount);
  const pct = Math.min(100, Math.round((claimedCount / totalSpots) * 100));
  return (
    <FlexCol className="shrink-0 items-center gap-1 self-start pt-1">
      <div className="relative size-14">
        <svg viewBox="0 0 48 48" className="size-full -rotate-90">
          <defs>
            <linearGradient
              id="foundingRingGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--theme-accent-avocado-default)"
              />
              <stop
                offset="50%"
                stopColor="var(--theme-accent-cabbage-default)"
              />
              <stop
                offset="100%"
                stopColor="var(--theme-accent-cheese-default)"
              />
            </linearGradient>
          </defs>
          <circle
            cx="24"
            cy="24"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="4"
            className="stroke-background-default"
          />
          <circle
            cx="24"
            cy="24"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            stroke="url(#foundingRingGradient)"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - pct / 100)}
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="font-black tabular-nums text-text-primary typo-footnote">
            {remaining > 0 ? remaining.toLocaleString() : '0'}
          </span>
          <span className="mt-0.5 text-[0.5rem] font-medium tracking-wide text-text-tertiary">
            {remaining > 0 ? 'left' : 'done'}
          </span>
        </span>
      </div>
    </FlexCol>
  );
};

// The claim celebration: the award pops in on its glow, +Cores, the founding
// number, and a signed note from the CEO.
const FoundingAwardReveal = ({
  memberNumber,
  onClose,
}: {
  memberNumber: number;
  onClose: () => void;
}): ReactElement => (
  <RevealDialogShell onClose={onClose}>
    <FlexCol className="items-center gap-4 text-center">
      <Reveal delay={0}>
        <AwardBadge sizeClassName="h-40" celebrate />
      </Reveal>
      <Reveal delay={70}>
        <span className="bg-accent-cheese-default/15 flex items-center gap-1 rounded-8 px-3 py-1 text-accent-cheese-default [&_svg]:size-5">
          <CoreIcon />
          <Typography bold type={TypographyType.Title3}>
            +{coresLabel}
          </Typography>
        </span>
      </Reveal>
      <Reveal delay={140}>
        <FlexCol className="gap-1">
          <Typography tag={TypographyTag.H3} bold type={TypographyType.Title2}>
            You&apos;re a founding contributor.
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            #{memberNumber.toLocaleString()} of{' '}
            {FOUNDING_AWARD.totalSpots.toLocaleString()} ·{' '}
            {PATCHY_FOUNDING_AWARD.name} is yours to keep.
          </Typography>
        </FlexCol>
      </Reveal>
      <Reveal delay={210}>
        <FlexCol className="w-full max-w-sm gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-left">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="[text-wrap:pretty]"
          >
            &ldquo;{FOUNDING_AWARD.ceoNote}&rdquo;
          </Typography>
          <CeoAttribution />
        </FlexCol>
      </Reveal>
      <Reveal delay={280}>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={onClose}
        >
          Wear it proud
        </Button>
      </Reveal>
    </FlexCol>
  </RevealDialogShell>
);

// The right-hand action changes with state; everything else stays put so the
// card doesn't jump between states.
const FoundingAwardAction = ({
  state,
  memberNumber,
  onClaim,
  onTakeAction,
}: {
  state: FoundingAwardState;
  memberNumber: number;
  onClaim: () => void;
  onTakeAction: () => void;
}): ReactElement => {
  if (state === 'claimed') {
    return (
      <FlexRow className="items-center gap-1.5 text-accent-avocado-default [&_svg]:size-4">
        <VIcon />
        <Typography bold type={TypographyType.Footnote}>
          Claimed · founder #{memberNumber.toLocaleString()}
        </Typography>
      </FlexRow>
    );
  }
  if (state === 'soldOut') {
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        bold
      >
        All {FOUNDING_AWARD.totalSpots.toLocaleString()} claimed
      </Typography>
    );
  }
  if (state === 'claimable') {
    return (
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cheese}
        icon={<GiftIcon />}
        onClick={onClaim}
      >
        Claim your award
      </Button>
    );
  }
  return (
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      onClick={onTakeAction}
    >
      Take action
    </Button>
  );
};

interface GivebackFoundingAwardProps {
  initialState?: FoundingAwardState;
  claimedCount?: number;
  memberNumber?: number;
  onTakeAction?: () => void;
}

export const GivebackFoundingAward = ({
  initialState = 'intro',
  claimedCount = 0,
  memberNumber = 0,
  onTakeAction = () => undefined,
}: GivebackFoundingAwardProps): ReactElement => {
  // The award is auto-granted on the backend on the first approved action, so
  // claiming here is a one-way local reveal of the already-earned award; the
  // spot count and founding number come from the live query via props.
  const [claimed, setClaimed] = useState(initialState === 'claimed');
  const [revealing, setRevealing] = useState(false);
  const state: FoundingAwardState = claimed ? 'claimed' : initialState;

  const onClaim = () => {
    setClaimed(true);
    setRevealing(true);
  };

  const isDone = state === 'claimed';
  const isSoldOut = state === 'soldOut';
  // Once claimed, the visitor is one of the counted spots.
  const shownClaimed = isDone
    ? Math.max(claimedCount, memberNumber)
    : claimedCount;

  return (
    <>
      {/* Colorful gradient border (a 1px gradient frame). Sold-out drops to a
          quiet hairline. */}
      <div
        className={classNames(
          'rounded-16 p-px shadow-2 motion-safe:animate-funnel-step-in',
          isSoldOut
            ? 'opacity-80 bg-border-subtlest-tertiary'
            : 'bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default',
        )}
      >
        <FlexRow
          className={classNames(
            'items-center gap-3 rounded-[15px] p-4',
            // Opaque base so the gradient BORDER can't bleed through.
            isSoldOut ? 'bg-surface-float' : 'bg-background-default',
          )}
          // The colorful border gradient at a true 8% via color-mix (the
          // Tailwind `/opacity` modifier doesn't take on these token gradient
          // stops). Sits over the opaque base as a faint wash.
          style={
            isSoldOut
              ? undefined
              : {
                  backgroundImage:
                    'linear-gradient(to right, color-mix(in srgb, var(--theme-accent-avocado-default) 8%, transparent), color-mix(in srgb, var(--theme-accent-cabbage-default) 8%, transparent), color-mix(in srgb, var(--theme-accent-cheese-default) 8%, transparent))',
                }
          }
        >
          <ScarcityRing claimedCount={shownClaimed} />
          <FlexCol className="min-w-0 flex-1 items-start gap-0.5">
            <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text font-bold uppercase tracking-wide text-transparent typo-caption2">
              Founding reward
            </span>
            <Typography bold type={TypographyType.Callout}>
              First 1,000 contributors
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
              className="[text-wrap:pretty]"
            >
              {PATCHY_FOUNDING_AWARD.name} award + {coresLabel} from{' '}
              {FOUNDING_AWARD.ceoName}
            </Typography>
            <div className="mt-3">
              <FoundingAwardAction
                state={state}
                memberNumber={memberNumber}
                onClaim={onClaim}
                onTakeAction={onTakeAction}
              />
            </div>
          </FlexCol>
          <AwardBadge sizeClassName="h-24 mobileL:h-28" celebrate={false} />
        </FlexRow>
      </div>

      {revealing && (
        <FoundingAwardReveal
          memberNumber={memberNumber}
          onClose={() => setRevealing(false)}
        />
      )}
    </>
  );
};
