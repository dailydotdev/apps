import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import type { Tip } from './tips';
import { tips } from './tips';

/*
 * An exploration of the tip over the ad slot, all at the slot's width and
 * on the same copy, so the only thing that changes is how the tip uses its
 * color and its icon. Base is the Polymarket layout as it stands; the rest
 * bring the icon out, the way Polymarket scatters its token icons.
 */

export type TipVariant =
  | 'base'
  | 'sticker'
  | 'constellation'
  | 'watermark'
  | 'split'
  | 'preview'
  | 'fan'
  | 'spotlight'
  | 'stamp'
  | 'rim';

export const tipVariants: {
  variant: TipVariant;
  name: string;
  idea: string;
}[] = [
  {
    variant: 'base',
    name: 'A · Base',
    idea: 'The Polymarket layout with your notes: the glow sits behind the icon at the top left, the line is a size up, the button a size down.',
  },
  {
    variant: 'sticker',
    name: 'B · Sticker',
    idea: 'Polymarket’s token: the icon as a big tilted tile peeking in from the top-right corner, like a sticker on the card.',
  },
  {
    variant: 'constellation',
    name: 'C · Constellation',
    idea: 'Tilted tiles scattered over the card: this tip’s icon in the corner and two neighbors around it, in their colors, as Polymarket scatters assets.',
  },
  {
    variant: 'watermark',
    name: 'D · Watermark',
    idea: 'The glyph huge and faint in the tip’s color, cropped by the right edge behind the button. Color without noise.',
  },
  {
    variant: 'split',
    name: 'E · Split',
    idea: 'A third of the card is the tip’s color with the glyph large and white; the copy and the button take the rest.',
  },
  {
    variant: 'preview',
    name: 'F · Preview',
    idea: 'A taste of the feature itself in the corner: the tags you’d follow, the keys to press, the days of a streak, as tilted chips. They take All tips’ corner, so this one needs All tips somewhere else.',
  },
  {
    variant: 'fan',
    name: 'G · Fan',
    idea: 'Three copies of the icon tile fanned like cards at the top right, the front one solid, the back ones fading.',
  },
  {
    variant: 'spotlight',
    name: 'H · Spotlight',
    idea: 'The icon lights the card: a soft beam of its color from the top left, brightest around the tile.',
  },
  {
    variant: 'stamp',
    name: 'I · Stamp',
    idea: 'The icon inside a dashed, turned ring on the left, like a badge you earn by trying it. It costs the copy some width.',
  },
  {
    variant: 'rim',
    name: 'J · Rim',
    idea: 'The color moves to the card’s edge: a thin rim that glows from the icon’s corner and fades along the border.',
  },
];

/** A taste of each feature for the preview variant. */
const previews: Record<string, string[]> = {
  'feed-tags': ['#react', '#rust', '#ai'],
  'custom-feeds': ['Work', 'Side project', 'Rust'],
  'read-later': ['Saved', '3 to read'],
  squads: ['Rust', 'AI', 'DevOps'],
  briefing: ['12 stories', '5 min'],
  streaks: ['Mon', 'Tue', 'Wed'],
  search: ['⌘', 'K'],
  history: ['Today', 'Yesterday'],
  appearance: ['Dark', 'Cards'],
  devcard: ['Reputation', 'Top 5%'],
  notifications: ['Replies', 'Mentions'],
  extension: ['New tab'],
};

const accent = (tone: string, percent?: number): string =>
  percent === undefined
    ? `var(--theme-accent-${tone}-default)`
    : `color-mix(in srgb, var(--theme-accent-${tone}-default) ${percent}%, transparent)`;

const preventDefault = (event: React.MouseEvent): void =>
  event.preventDefault();

const neighbors = (tip: Tip): Tip[] => {
  const index = tips.findIndex((item) => item.id === tip.id);
  const at = (offset: number) =>
    tips[(Math.max(0, index) + offset + tips.length) % tips.length];
  return [at(1), at(-1)];
};

const IconTile = ({
  tip,
  size = 'sm',
  className,
  style,
}: {
  tip: Tip;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}): ReactElement => {
  const { icon: Icon } = tip;
  const box = {
    xs: 'size-5 rounded-6',
    sm: 'size-7 rounded-8',
    md: 'size-10 rounded-12',
    lg: 'size-12 rounded-14',
  }[size];
  return (
    <span
      aria-hidden
      className={classNames(
        'flex shrink-0 items-center justify-center text-white',
        box,
        className,
      )}
      style={{ background: accent(tip.tone), ...style }}
    >
      <Icon secondary size={size === 'xs' ? IconSize.Size16 : IconSize.Small} />
    </span>
  );
};

const Cta = ({ tip }: { tip: Tip }): ReactElement => (
  <Button
    tag="a"
    href="#"
    onClick={preventDefault}
    variant={ButtonVariant.Float}
    size={ButtonSize.XSmall}
    className="relative shrink-0"
  >
    {tip.cta}
  </Button>
);

const AllTips = ({ className }: { className?: string }): ReactElement => (
  <a
    href="#"
    onClick={preventDefault}
    className={classNames(
      'relative shrink-0 text-text-tertiary typo-caption1 hover:text-text-primary',
      className,
    )}
  >
    All tips
  </a>
);

const Title = ({
  tip,
  hasIcon = true,
}: {
  tip: Tip;
  hasIcon?: boolean;
}): ReactElement => (
  <span className="relative flex min-w-0 flex-1 items-center gap-2">
    {hasIcon && <IconTile tip={tip} size="xs" />}
    <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-callout">
      {tip.headline}
    </span>
  </span>
);

const Line = ({ tip }: { tip: Tip }): ReactElement => (
  <span className="relative line-clamp-2 min-h-[2.5rem] min-w-0 flex-1 text-text-tertiary typo-subhead">
    {tip.blurb}
  </span>
);

const Shell = ({
  children,
  background,
  className,
  style,
}: {
  children: ReactNode;
  background?: string;
  className?: string;
  style?: CSSProperties;
}): ReactElement => (
  <div
    className={classNames(
      'relative isolate flex shrink-0 flex-col gap-1 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-3.5 py-3',
      className,
    )}
    style={style}
  >
    {background && (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1"
        style={{ backgroundImage: background }}
      />
    )}
    {children}
  </div>
);

/** The glow behind the icon, top left, as asked for the base. */
const iconGlow = (tip: Tip): string =>
  `radial-gradient(110% 100% at 0% 0%, ${accent(
    tip.tone,
    22,
  )} 0%, transparent 60%), radial-gradient(70% 70% at 100% 100%, ${accent(
    tip.tone,
    6,
  )} 0%, transparent 70%)`;

const Standard = ({
  tip,
  background,
  hasIcon = true,
  art,
  allTipsClassName,
}: {
  tip: Tip;
  background?: string;
  hasIcon?: boolean;
  /** Art on the right, behind the copy's line and the button. */
  art?: ReactNode;
  /** Room All tips leaves for art in the top-right corner. */
  allTipsClassName?: string;
}): ReactElement => (
  <Shell background={background}>
    {art}
    <div className="flex items-center gap-2">
      <Title tip={tip} hasIcon={hasIcon} />
      <AllTips className={allTipsClassName} />
    </div>
    <div className="flex items-end gap-3">
      <Line tip={tip} />
      <Cta tip={tip} />
    </div>
  </Shell>
);

export const TipVariantCard = ({
  tip,
  variant,
}: {
  tip: Tip;
  variant: TipVariant;
}): ReactElement => {
  switch (variant) {
    case 'sticker':
      return (
        <Standard
          tip={tip}
          hasIcon={false}
          background={iconGlow(tip)}
          allTipsClassName="mr-10"
          art={
            <IconTile
              tip={tip}
              size="lg"
              className="absolute -right-2 -top-3 rotate-12 shadow-2"
            />
          }
        />
      );
    case 'constellation': {
      const [next, previous] = neighbors(tip);
      return (
        <Standard
          tip={tip}
          hasIcon={false}
          background={iconGlow(tip)}
          allTipsClassName="mr-14"
          art={
            <>
              <IconTile
                tip={tip}
                size="md"
                className="absolute -right-1 -top-2 rotate-12 shadow-2"
              />
              <IconTile
                tip={next}
                size="xs"
                className="absolute right-12 top-1 -rotate-12 opacity-90"
              />
              <IconTile
                tip={previous}
                size="sm"
                className="absolute -bottom-3 right-[42%] rotate-6 opacity-90 shadow-2"
              />
            </>
          }
        />
      );
    }
    case 'watermark': {
      const { icon: Icon } = tip;
      return (
        <Standard
          tip={tip}
          background={iconGlow(tip)}
          art={
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -right-8 -rotate-12"
              style={{ color: accent(tip.tone, 14) }}
            >
              <Icon secondary style={{ width: 120, height: 120 }} />
            </span>
          }
        />
      );
    }
    case 'split': {
      const { icon: Icon } = tip;
      return (
        <div className="relative flex shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
          <div className="flex min-w-0 flex-1 flex-col gap-1 py-3 pl-3.5 pr-3">
            <span className="truncate font-bold text-text-primary typo-callout">
              {tip.headline}
            </span>
            <span className="line-clamp-2 min-h-[2.5rem] text-text-tertiary typo-subhead">
              {tip.blurb}
            </span>
            <div className="mt-1 flex items-center gap-3">
              <Cta tip={tip} />
              <AllTips />
            </div>
          </div>
          <span
            aria-hidden
            className="relative flex w-[5.5rem] shrink-0 items-center justify-center overflow-hidden text-white"
            style={{
              background: `linear-gradient(160deg, ${accent(
                tip.tone,
              )}, ${accent(tip.tone, 70)})`,
            }}
          >
            <Icon secondary style={{ width: 44, height: 44 }} />
            <span className="absolute -right-6 -top-6 size-16 rounded-max bg-white/[0.16]" />
          </span>
        </div>
      );
    }
    case 'preview':
      return (
        <Standard
          tip={tip}
          background={iconGlow(tip)}
          allTipsClassName="hidden"
          art={
            <span
              aria-hidden
              className="pointer-events-none absolute -top-1 right-2 flex items-center"
            >
              {(previews[tip.id] ?? []).slice(0, 2).map((chip, index) => (
                <span
                  key={chip}
                  className="-ml-1.5 rounded-8 border border-border-subtlest-tertiary bg-background-default px-1.5 py-0.5 font-bold shadow-2 typo-caption2 first:ml-0"
                  style={{
                    transform: `rotate(${[-8, 8][index]}deg) translateY(${
                      [6, 2][index]
                    }px)`,
                    color:
                      index === 0
                        ? accent(tip.tone)
                        : 'var(--theme-text-primary)',
                  }}
                >
                  {chip}
                </span>
              ))}
            </span>
          }
        />
      );
    case 'fan':
      return (
        <Standard
          tip={tip}
          hasIcon={false}
          background={iconGlow(tip)}
          allTipsClassName="mr-12"
          art={
            <span
              aria-hidden
              className="pointer-events-none absolute right-3 top-2"
            >
              <IconTile
                tip={tip}
                size="sm"
                className="absolute left-3 top-0 rotate-[20deg] opacity-30"
              />
              <IconTile
                tip={tip}
                size="sm"
                className="absolute left-1.5 top-0 rotate-[10deg] opacity-60"
              />
              <IconTile tip={tip} size="sm" className="relative shadow-2" />
            </span>
          }
        />
      );
    case 'spotlight':
      return (
        <Standard
          tip={tip}
          background={`linear-gradient(120deg, ${accent(
            tip.tone,
            26,
          )} 0%, ${accent(
            tip.tone,
            8,
          )} 35%, transparent 60%), radial-gradient(40% 60% at 4% 18%, ${accent(
            tip.tone,
            30,
          )} 0%, transparent 70%)`}
        />
      );
    case 'stamp': {
      const { icon: Icon } = tip;
      return (
        <Shell
          background={iconGlow(tip)}
          className="!flex-row items-center gap-3"
        >
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-max border-2 border-dashed"
            style={{
              borderColor: accent(tip.tone, 60),
              color: accent(tip.tone),
              background: accent(tip.tone, 12),
              transform: 'rotate(-14deg)',
            }}
          >
            <Icon secondary size={IconSize.Small} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <Title tip={tip} hasIcon={false} />
              <AllTips />
            </div>
            <div className="flex items-end gap-3">
              <Line tip={tip} />
              <Cta tip={tip} />
            </div>
          </div>
        </Shell>
      );
    }
    case 'rim':
      return (
        <div
          className="relative shrink-0 rounded-16 p-px"
          style={{
            background: `linear-gradient(135deg, ${accent(
              tip.tone,
            )} 0%, ${accent(
              tip.tone,
              30,
            )} 30%, var(--theme-border-subtlest-tertiary) 60%)`,
          }}
        >
          <div className="relative isolate flex flex-col gap-1 overflow-hidden rounded-[0.9375rem] bg-background-subtle px-3.5 py-3">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-1"
              style={{
                backgroundImage: `radial-gradient(70% 70% at 0% 0%, ${accent(
                  tip.tone,
                  14,
                )} 0%, transparent 70%)`,
              }}
            />
            <div className="flex items-center gap-2">
              <Title tip={tip} />
              <AllTips />
            </div>
            <div className="flex items-end gap-3">
              <Line tip={tip} />
              <Cta tip={tip} />
            </div>
          </div>
        </div>
      );
    default:
      return <Standard tip={tip} background={iconGlow(tip)} />;
  }
};
