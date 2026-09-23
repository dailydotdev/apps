import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { VerifiedSeal } from './kit';

// The official badge, eight ways. Every one is the width of Home's widget
// column and one row tall, because that is where it sits. The references
// are the marks people already trust: X and Instagram's seal, GitHub's
// verified-organisation pill, Apple's editorial restraint, a foil sticker,
// a passport stamp, Discord's server badge, a laurel.

const glow = (strength: number): string =>
  `linear-gradient(135deg, color-mix(in srgb, var(--theme-accent-cabbage-default) ${strength}%, transparent), color-mix(in srgb, var(--theme-accent-cabbage-default) ${Math.round(
    strength / 4,
  )}%, transparent))`;

const Laurel = ({
  flip = false,
  className,
}: {
  flip?: boolean;
  className?: string;
}): ReactElement => (
  <svg
    viewBox="0 0 12 24"
    aria-hidden
    className={classNames('h-6 w-3', flip && '-scale-x-100', className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
  >
    <path d="M10 2C4 6 3 12 5 22" />
    <path d="M5.5 8c-2.5-1-4-1-5 .5 1.5 1 3 1 5-.5zM4.2 12.5c-2.5-.5-4 0-4.8 1.6 1.7.7 3.2.4 4.8-1.6zM4.4 17c-2.4 0-3.8.7-4.4 2.4 1.8.4 3.2-.2 4.4-2.4z" />
    <path d="M8 5.5c.2-2.5 1.2-3.8 3-4-.2 1.9-1.2 3.2-3 4zM6 10c-.3-2.6.4-4.2 2.2-5 .2 2-.5 3.6-2.2 5zM5.4 14.6c-.8-2.4-.5-4.1 1-5.4.7 1.8.4 3.6-1 5.4z" />
  </svg>
);

export interface BadgeVariant {
  id: string;
  title: string;
  from: string;
  note: string;
  render: () => ReactElement;
}

export const badgeVariants: BadgeVariant[] = [
  {
    id: 'glow',
    title: 'Glow',
    from: 'X and Instagram',
    note: 'The current one minus the subline. Seal on a soft brand gradient, accent border.',
    render: () => (
      <div
        className="flex items-center gap-3 rounded-16 border border-accent-cabbage-default px-4 py-3"
        style={{ background: glow(18) }}
      >
        <VerifiedSeal className="size-6 text-accent-cabbage-default" />
        <span className="font-bold text-text-primary typo-callout">
          Official company page
        </span>
      </div>
    ),
  },
  {
    id: 'pill',
    title: 'Pill',
    from: 'GitHub verified organisation',
    note: 'A chip, not a card. Sits flush left; the column keeps its rhythm.',
    render: () => (
      <div className="flex">
        <span className="flex items-center gap-1.5 rounded-[999px] bg-accent-cabbage-flat py-1.5 pl-2 pr-3 font-bold text-accent-cabbage-default typo-footnote">
          <VerifiedSeal className="size-4" />
          Official company page
        </span>
      </div>
    ),
  },
  {
    id: 'hairline',
    title: 'Hairline',
    from: 'Apple',
    note: 'No fill, no border colour. Seal, label, one line of small caps. The quietest and the most expensive looking.',
    render: () => (
      <div className="flex flex-col items-center gap-1 border-y border-border-subtlest-tertiary py-3 text-center">
        <VerifiedSeal className="size-5 text-accent-cabbage-default" />
        <span className="font-bold uppercase tracking-[0.18em] text-text-primary typo-caption1">
          Official company page
        </span>
      </div>
    ),
  },
  {
    id: 'foil',
    title: 'Foil',
    from: 'A gold sticker',
    note: 'The one that says premium out loud. Gold instead of brand purple, so it reads as an award rather than a feature.',
    render: () => (
      <div
        className="flex items-center gap-3 rounded-16 px-4 py-3"
        style={{
          background:
            'linear-gradient(120deg, color-mix(in srgb, var(--theme-accent-cheese-default) 34%, transparent), color-mix(in srgb, var(--theme-accent-bun-default) 10%, transparent) 55%, color-mix(in srgb, var(--theme-accent-cheese-default) 28%, transparent))',
          boxShadow:
            'inset 0 0 0 1px color-mix(in srgb, var(--theme-accent-cheese-default) 55%, transparent)',
        }}
      >
        <VerifiedSeal className="size-6 text-accent-cheese-default" />
        <div className="flex min-w-0 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            Official company page
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'stamp',
    title: 'Stamp',
    from: 'A passport',
    note: 'Double rule, small caps, wide tracking. Ink, not light.',
    render: () => (
      <div className="flex items-center justify-center gap-2 rounded-12 border-2 border-double border-accent-cabbage-default px-4 py-2.5 text-accent-cabbage-default">
        <VerifiedSeal className="size-4" />
        <span className="font-bold uppercase tracking-[0.2em] typo-caption1">
          Official
        </span>
        <span className="opacity-40">·</span>
        <span className="font-bold uppercase tracking-[0.2em] typo-caption1">
          Company page
        </span>
      </div>
    ),
  },
  {
    id: 'laurel',
    title: 'Laurel',
    from: 'Awards and film festivals',
    note: 'The seal between two laurel strokes. The only one with an ornament; it earns it if the page is sold as an honour.',
    render: () => (
      <div className="flex items-center justify-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float py-3 text-accent-cabbage-default">
        <Laurel />
        <div className="flex flex-col items-center gap-0.5 px-2">
          <VerifiedSeal className="size-5" />
          <span className="whitespace-nowrap font-bold text-text-primary typo-footnote">
            Official company page
          </span>
        </div>
        <Laurel flip />
      </div>
    ),
  },
  {
    id: 'strip',
    title: 'Strip',
    from: 'Discord server badge',
    note: 'Full-bleed brand fill, white seal, white label. The loudest; reads as the company owning the column.',
    render: () => (
      <div className="flex items-center gap-3 rounded-16 bg-accent-cabbage-default px-4 py-3 text-white">
        <VerifiedSeal className="size-6 [&_path:last-child]:stroke-accent-cabbage-default" />
        <span className="font-bold typo-callout">Official company page</span>
      </div>
    ),
  },
  {
    id: 'glass',
    title: 'Glass',
    from: 'iOS widgets',
    note: 'A frosted card over a brand haze. Depth without a hard border.',
    render: () => (
      <div className="relative overflow-hidden rounded-16">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 45%, transparent), transparent 60%), radial-gradient(90% 120% at 100% 100%, color-mix(in srgb, var(--theme-accent-blueCheese-default) 30%, transparent), transparent 60%)',
            filter: 'blur(18px)',
          }}
        />
        <div
          className="relative flex items-center gap-3 rounded-16 px-4 py-3"
          style={{
            background:
              'color-mix(in srgb, var(--theme-background-default) 55%, transparent)',
            boxShadow:
              'inset 0 0 0 1px color-mix(in srgb, var(--theme-text-primary) 12%, transparent)',
          }}
        >
          <VerifiedSeal className="size-6 text-accent-cabbage-default" />
          <span className="font-bold text-text-primary typo-callout">
            Official company page
          </span>
        </div>
      </div>
    ),
  },
];
