import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { BriefGradientIcon } from '@dailydotdev/shared/src/components/icons/BriefGradient';
import { MicrophoneIcon } from '@dailydotdev/shared/src/components/icons/Microphone';
import { CalendarIcon } from '@dailydotdev/shared/src/components/icons/Calendar';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import type { Tone } from '../data';
import { toneClass } from '../data';
import { WidgetContent, WidgetSurface } from './catalog';

/**
 * A campaign strip: a slim button above the ad, the way Polymarket stacks two
 * small promos at the top of its hero. Ours (briefing, podcast, events) or a
 * paid one; the campaign decides which, and whether any show at all.
 */
export type CampaignStrip = {
  id: string;
  eyebrow: string;
  title: string;
  tone: Tone;
  icon: (size: IconSize) => ReactElement;
  isPaid?: boolean;
};

export const campaignStrips: CampaignStrip[] = [
  {
    id: 'briefing',
    eyebrow: 'Presidential briefing',
    title: 'Your morning brief is ready',
    tone: 'onion',
    icon: (size) => <BriefGradientIcon secondary size={size} />,
  },
  {
    id: 'podcast',
    eyebrow: 'daily.dev podcast',
    title: 'Ep. 42: Shipping with agents',
    tone: 'bacon',
    icon: (size) => <MicrophoneIcon secondary size={size} />,
  },
  {
    id: 'hackathon',
    eyebrow: 'Hackathon · starts in 3 days',
    title: 'Build an agent, win a MacBook',
    tone: 'avocado',
    icon: (size) => <CalendarIcon secondary size={size} />,
  },
  {
    id: 'squad',
    eyebrow: 'Promoted · Supabase',
    title: 'Join the Supabase squad',
    tone: 'water',
    isPaid: true,
    icon: (size) => <SquadIcon secondary size={size} />,
  },
];

/*
 * The production ad card, reshaped for the slot: its creative takes every
 * pixel the strips leave, and the advertiser and remove links stop taking a
 * row of their own. They float over the creative and appear on hover or
 * keyboard focus, the way media controls do.
 */
const adSlotCss = `
.ad-slot [data-testid="adItem"] { display: flex; flex-direction: column; }
.ad-slot [data-testid="adItem"] > div:has(> img.h-40) {
  flex: 1; min-height: 5rem; margin-bottom: 0.25rem;
}
.ad-slot [data-testid="adItem"] img.h-40 { height: 100% !important; }
.ad-slot-compact-2 [data-testid="adItem"] .flex-wrap { display: none; }
.ad-slot [data-testid="adItem"] > .\\!mx-1 {
  position: absolute; left: 0.75rem; right: 0.75rem; bottom: 0.75rem;
  z-index: 2; margin: 0 !important; opacity: 0;
  transition: opacity 150ms ease-out; pointer-events: none;
}
.ad-slot [data-testid="adItem"]:hover > .\\!mx-1,
.ad-slot [data-testid="adItem"]:focus-within > .\\!mx-1 {
  opacity: 1; pointer-events: auto;
}
.ad-slot [data-testid="adItem"] > .\\!mx-1 :is(a, button) {
  height: 1.75rem; padding: 0 0.625rem; border-radius: 0.625rem;
  background: rgba(14, 18, 23, 0.64); backdrop-filter: blur(12px);
  color: #fff !important;
}
@media (prefers-reduced-motion: reduce) {
  .ad-slot [data-testid="adItem"] > .\\!mx-1 { transition: none; }
}
`;

export const StripButton = ({
  strip,
}: {
  strip: CampaignStrip;
}): ReactElement => (
  <a
    href="#"
    onClick={(event) => event.preventDefault()}
    className="group/strip flex h-14 shrink-0 items-center gap-3 rounded-14 border border-border-subtlest-tertiary bg-background-subtle px-3 transition-colors hover:border-border-subtlest-secondary"
  >
    <span
      className={classNames(
        'flex size-8 shrink-0 items-center justify-center rounded-10',
        toneClass[strip.tone].subtle,
      )}
    >
      {strip.icon(IconSize.Size16)}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span
        className={classNames(
          'truncate font-bold typo-caption2',
          toneClass[strip.tone].text,
        )}
      >
        {strip.eyebrow}
      </span>
      <span className="truncate font-bold text-text-primary typo-footnote">
        {strip.title}
      </span>
    </span>
    <ArrowIcon
      className="shrink-0 rotate-90 text-text-quaternary transition-transform group-hover/strip:translate-x-0.5 group-hover/strip:text-text-primary"
      size={IconSize.Size16}
    />
  </a>
);

/**
 * The locked second slot of the rail: up to two campaign strips over the ad.
 * Always Tall, always second, never removable; Plus readers get the strips
 * without the ad.
 */
export const AdSlot = ({
  strips = [],
  isEditing,
  isPlus,
  className,
}: {
  strips?: CampaignStrip[];
  isEditing?: boolean;
  isPlus?: boolean;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex min-h-0 min-w-0 flex-col gap-2 transition-opacity',
      isEditing && 'opacity-60',
      className,
    )}
  >
    {strips.slice(0, 2).map((strip) => (
      <StripButton key={strip.id} strip={strip} />
    ))}
    {isPlus ? (
      strips.length < 2 &&
      campaignStrips
        .filter((strip) => !strips.includes(strip) && !strip.isPaid)
        .slice(0, 3 - strips.length)
        .map((strip) => <StripButton key={strip.id} strip={strip} />)
    ) : (
      <WidgetSurface
        className={classNames(
          'ad-slot min-h-0 flex-1',
          strips.length > 1 && 'ad-slot-compact-2',
        )}
        isBare
      >
        <style>{adSlotCss}</style>
        <WidgetContent kind="ad" size="m" />
      </WidgetSurface>
    )}
    {isEditing && (
      <span className="absolute -right-2 -top-2 z-2 flex h-6 items-center gap-1 rounded-max bg-surface-float px-2 text-text-secondary shadow-2 typo-caption2">
        <LockIcon size={IconSize.Size16} />
        Pinned by daily.dev
      </span>
    )}
  </div>
);
