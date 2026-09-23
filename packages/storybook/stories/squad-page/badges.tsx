import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { squad, team } from './data';
import { Avatar, VerifiedSeal } from './kit';

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

/* ------------------------------------------------------------ round two */

// Between Foil and Glass: light, warmth, depth. The references this time
// are the marks developers meet outside the big networks: Docker's Verified
// Publisher, npm provenance, the VS Code marketplace tick, Hugging Face's
// verified org, Stack Overflow Collectives, Twitch and Discord partners,
// Spotify's Verified Artist, Airbnb's Superhost, an Apple Developer
// certificate, a hallmark, a wax seal, a holographic sticker, a swing tag.

const gold = (a: number, b: number): string =>
  `linear-gradient(120deg, color-mix(in srgb, var(--theme-accent-cheese-default) ${a}%, transparent), color-mix(in srgb, var(--theme-accent-bun-default) ${Math.round(
    a / 3,
  )}%, transparent) 55%, color-mix(in srgb, var(--theme-accent-cheese-default) ${b}%, transparent))`;

const goldEdge =
  'inset 0 0 0 1px color-mix(in srgb, var(--theme-accent-cheese-default) 55%, transparent)';

const holo =
  'conic-gradient(from 200deg at 30% 50%, color-mix(in srgb, var(--theme-accent-cabbage-default) 40%, transparent), color-mix(in srgb, var(--theme-accent-blueCheese-default) 40%, transparent), color-mix(in srgb, var(--theme-accent-cheese-default) 40%, transparent), color-mix(in srgb, var(--theme-accent-avocado-default) 30%, transparent), color-mix(in srgb, var(--theme-accent-cabbage-default) 40%, transparent))';

const frost =
  'color-mix(in srgb, var(--theme-background-default) 58%, transparent)';

const Haze = ({ background }: { background: string }): ReactElement => (
  <div
    aria-hidden
    className="absolute inset-0"
    style={{ background, filter: 'blur(16px)' }}
  />
);

const Card = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex items-center gap-3 overflow-hidden rounded-16 px-4 py-3',
      className,
    )}
    style={style}
  >
    {children}
  </div>
);

export const badgeVariantsRoundTwo: BadgeVariant[] = [
  {
    id: 'foil-glass',
    title: 'Foil glass',
    from: 'Foil and Glass, together',
    note: 'Gold haze under frosted glass. The warmth of foil, the depth of glass, one hairline of gold.',
    render: () => (
      <Card style={{ boxShadow: goldEdge, background: frost }}>
        <Haze background={gold(60, 30)} />
        <VerifiedSeal className="relative size-6 text-accent-cheese-default" />
        <span className="relative font-bold text-text-primary typo-callout">
          Official company page
        </span>
      </Card>
    ),
  },
  {
    id: 'holo',
    title: 'Holographic',
    from: 'A holo sticker, Hugging Face verified org',
    note: 'Every accent in one conic sweep behind the glass. The seal stays white so it reads as the stable thing.',
    render: () => (
      <Card
        style={{
          background: frost,
          boxShadow:
            'inset 0 0 0 1px color-mix(in srgb, var(--theme-text-primary) 16%, transparent)',
        }}
      >
        <Haze background={holo} />
        <VerifiedSeal className="relative size-6 text-text-primary [&_path:last-child]:stroke-background-default" />
        <span className="relative font-bold text-text-primary typo-callout">
          Official
        </span>
        <span className="relative ml-auto text-text-tertiary typo-caption1">
          Verified publisher
        </span>
      </Card>
    ),
  },
  {
    id: 'hallmark',
    title: 'Hallmark',
    from: 'A hallmark on silver, Apple Developer certificates',
    note: 'A serial makes it rare: the order in which the company was verified. Copy does the work; the fill is almost nothing.',
    render: () => (
      <Card style={{ background: gold(14, 6), boxShadow: goldEdge }}>
        <VerifiedSeal className="size-5 text-accent-cheese-default" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-footnote">
            Official company page
          </span>
          <span className="sq-nums text-text-tertiary typo-caption2">
            Verified No. 0041 · Since Feb 2023
          </span>
        </div>
      </Card>
    ),
  },
  {
    id: 'wax',
    title: 'Wax seal',
    from: 'A wax seal, Stack Overflow Collectives',
    note: 'The company logo inside the seal, so the badge is theirs and not ours. Gold ring, deep fill.',
    render: () => (
      <Card style={{ background: gold(22, 10), boxShadow: goldEdge }}>
        <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-cheese-default p-[2px]">
          <img
            src={squad.image}
            alt=""
            className="size-full rounded-full object-cover ring-2 ring-background-default"
          />
          <VerifiedSeal className="absolute -bottom-0.5 -right-0.5 size-4 text-accent-cheese-default [&_path:last-child]:stroke-background-default" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            Official page
          </span>
          <span className="text-text-tertiary typo-caption1">
            of {squad.company.website}
          </span>
        </div>
      </Card>
    ),
  },
  {
    id: 'ribbon',
    title: 'Ribbon',
    from: 'An award ribbon, Airbnb Superhost',
    note: 'A gold band across the top of the column instead of a card. The column itself becomes the badge.',
    render: () => (
      <div className="flex flex-col gap-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary">
        <div
          className="flex items-center justify-center gap-2 px-4 py-1.5 text-background-default"
          style={{
            background:
              'linear-gradient(90deg, var(--theme-accent-bun-default), var(--theme-accent-cheese-default) 50%, var(--theme-accent-bun-default))',
          }}
        >
          <VerifiedSeal className="size-4 text-background-default [&_path:last-child]:stroke-accent-cheese-default" />
          <span className="font-bold uppercase tracking-[0.16em] typo-caption2">
            Official company page
          </span>
        </div>
        <div className="flex items-center gap-3 bg-surface-float px-4 py-2.5">
          <img src={squad.image} alt="" className="size-6 rounded-6" />
          <span className="text-text-secondary typo-footnote">
            Run by the {squad.company.website} team
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'partner',
    title: 'Partner',
    from: 'Twitch and Discord partners',
    note: 'Copy change: partner, not page. Says the relationship, not the object. Purple glass, gold seal.',
    render: () => (
      <Card
        style={{
          background: frost,
          boxShadow:
            'inset 0 0 0 1px color-mix(in srgb, var(--theme-accent-cabbage-default) 40%, transparent)',
        }}
      >
        <Haze background={glow(50)} />
        <VerifiedSeal className="relative size-6 text-accent-cheese-default" />
        <div className="relative flex min-w-0 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            daily.dev partner
          </span>
          <span className="text-text-tertiary typo-caption1">
            Official company page
          </span>
        </div>
      </Card>
    ),
  },
  {
    id: 'team',
    title: 'Faces',
    from: 'Spotify Verified Artist, Product Hunt makers',
    note: 'The proof is people. The seal, the words, and the verified employees who run it.',
    render: () => (
      <Card style={{ background: frost, boxShadow: goldEdge }}>
        <Haze background={gold(40, 16)} />
        <VerifiedSeal className="relative size-6 text-accent-cheese-default" />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            Official company page
          </span>
          <span className="text-text-tertiary typo-caption1">
            Run by verified employees
          </span>
        </div>
        <span className="relative flex">
          {team.slice(0, 3).map((member, index) => (
            <Avatar
              key={member.id}
              member={member}
              size={1.5}
              className={classNames(
                'ring-2 ring-background-default',
                index > 0 && '-ml-1.5',
              )}
            />
          ))}
        </span>
      </Card>
    ),
  },
  {
    id: 'edge',
    title: 'Gold edge',
    from: 'A gilt page edge, VS Code verified publisher',
    note: 'No card at all: a gold rule along the top of the column and one small line. The most restrained luxury there is.',
    render: () => (
      <div className="flex flex-col gap-2">
        <div
          className="h-[3px] rounded-[999px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--theme-accent-cheese-default) 20%, var(--theme-accent-cheese-default) 80%, transparent)',
          }}
        />
        <div className="flex items-center justify-center gap-1.5 text-text-tertiary typo-caption1">
          <VerifiedSeal className="size-4 text-accent-cheese-default" />
          <span className="font-bold text-text-primary">Official</span>
          <span>company page</span>
        </div>
      </div>
    ),
  },
  {
    id: 'tag',
    title: 'Swing tag',
    from: 'A luxury product tag, Docker Verified Publisher',
    note: 'A tag with its hole, the label stamped in small caps. Playful, still gold.',
    render: () => (
      <div className="flex">
        <div
          className="relative flex items-center gap-2.5 rounded-10 py-2 pl-3 pr-4"
          style={{
            background: gold(30, 14),
            boxShadow: goldEdge,
            clipPath: 'polygon(0 50%, 14px 0, 100% 0, 100% 100%, 14px 100%)',
          }}
        >
          <span className="ml-3 size-1.5 rounded-full bg-background-default ring-1 ring-accent-cheese-default" />
          <VerifiedSeal className="size-4 text-accent-cheese-default" />
          <span className="font-bold uppercase tracking-[0.16em] text-text-primary typo-caption1">
            Official
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'live',
    title: 'Presence',
    from: 'Twitch, Intercom',
    note: 'Copy plays with time: official, and here now. The green dot is the only non-gold colour.',
    render: () => (
      <Card style={{ background: frost, boxShadow: goldEdge }}>
        <Haze background={gold(48, 20)} />
        <VerifiedSeal className="relative size-6 text-accent-cheese-default" />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            Official company page
          </span>
          <span className="flex items-center gap-1.5 text-text-tertiary typo-caption1">
            <span className="size-1.5 rounded-full bg-status-success" />
            Team online now
          </span>
        </div>
      </Card>
    ),
  },
];

/* ---------------------------------------------------------- round three */

// Foil glass and Holographic, in brand purple. Ten ways to hold the same
// idea: light under glass, one edge, the seal, four words. What moves is
// where the light sits, how the edge is drawn, and what the second line
// says, if there is one.

const c = (token: string, pct: number): string =>
  `color-mix(in srgb, var(--theme-accent-${token}-default) ${pct}%, transparent)`;

const purpleEdge = `inset 0 0 0 1px ${c('cabbage', 55)}`;
const purpleHaze = `linear-gradient(120deg, ${c('cabbage', 60)}, ${c(
  'onion',
  22,
)} 55%, ${c('cabbage', 32)})`;
const purpleHolo = `conic-gradient(from 200deg at 30% 50%, ${c(
  'cabbage',
  48,
)}, ${c('onion', 42)}, ${c('blueCheese', 34)}, ${c('cabbage', 48)})`;

const Label = ({
  title = 'Official company page',
  sub,
  className,
}: {
  title?: string;
  sub?: string;
  className?: string;
}): ReactElement => (
  <div
    className={classNames('relative flex min-w-0 flex-1 flex-col', className)}
  >
    <span className="font-bold text-text-primary typo-callout">{title}</span>
    {sub && <span className="text-text-tertiary typo-caption1">{sub}</span>}
  </div>
);

const Seal = ({ className }: { className?: string }): ReactElement => (
  <VerifiedSeal
    className={classNames(
      'relative size-6 text-accent-cabbage-default',
      className,
    )}
  />
);

export const badgeVariantsRoundThree: BadgeVariant[] = [
  {
    id: 'p-foil',
    title: 'Purple foil glass',
    from: '09, in brand',
    note: 'The gold one, recoloured. Cabbage haze under frost, one cabbage hairline.',
    render: () => (
      <Card style={{ background: frost, boxShadow: purpleEdge }}>
        <Haze background={purpleHaze} />
        <Seal />
        <Label />
      </Card>
    ),
  },
  {
    id: 'p-holo',
    title: 'Purple holographic',
    from: '10, in brand',
    note: 'Cabbage, onion and a breath of blue in one conic sweep. White seal, second line for the publisher.',
    render: () => (
      <Card
        style={{
          background: frost,
          boxShadow:
            'inset 0 0 0 1px color-mix(in srgb, var(--theme-text-primary) 16%, transparent)',
        }}
      >
        <Haze background={purpleHolo} />
        <Seal className="text-text-primary [&_path:last-child]:stroke-background-default" />
        <Label title="Official" />
        <span className="relative text-text-tertiary typo-caption1">
          Verified publisher
        </span>
      </Card>
    ),
  },
  {
    id: 'p-aurora',
    title: 'Aurora',
    from: 'The landing page aurora',
    note: 'Two orbs, cabbage top-left and onion bottom-right, blurred under the glass. The seal sits in the brightest spot.',
    render: () => (
      <Card style={{ background: frost, boxShadow: purpleEdge }}>
        <Haze
          background={`radial-gradient(70% 120% at 12% 20%, ${c(
            'cabbage',
            70,
          )}, transparent 60%), radial-gradient(70% 120% at 95% 110%, ${c(
            'onion',
            55,
          )}, transparent 60%)`}
        />
        <Seal />
        <Label />
      </Card>
    ),
  },
  {
    id: 'p-sheen',
    title: 'Sheen',
    from: 'Light on a lacquered surface',
    note: 'Flat purple glass with one diagonal highlight, the way light crosses a card. Nothing else.',
    render: () => (
      <Card style={{ background: c('cabbage', 16), boxShadow: purpleEdge }}>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, color-mix(in srgb, var(--theme-text-primary) 14%, transparent) 50%, transparent 62%)',
          }}
        />
        <Seal />
        <Label />
      </Card>
    ),
  },
  {
    id: 'p-frame',
    title: 'Gradient frame',
    from: 'A gilt frame, in purple',
    note: 'The edge is the gradient, cabbage to onion, one pixel wide. The inside is dark glass.',
    render: () => (
      <div
        className="rounded-16 p-px"
        style={{
          background: `linear-gradient(120deg, var(--theme-accent-cabbage-default), ${c(
            'onion',
            70,
          )})`,
        }}
      >
        <Card
          className="rounded-[15px]"
          style={{ background: 'var(--theme-background-default)' }}
        >
          <Haze
            background={`radial-gradient(80% 100% at 0% 50%, ${c(
              'cabbage',
              30,
            )}, transparent 70%)`}
          />
          <Seal />
          <Label />
        </Card>
      </div>
    ),
  },
  {
    id: 'p-emblem',
    title: 'Emblem',
    from: 'A crest on a blazer',
    note: 'The seal grows and gets its own disc; the words go small caps. The badge is the seal, the label is the caption.',
    render: () => (
      <Card style={{ background: frost, boxShadow: purpleEdge }}>
        <Haze background={purpleHaze} />
        <span
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: c('cabbage', 22), boxShadow: purpleEdge }}
        >
          <Seal className="size-6" />
        </span>
        <div className="relative flex min-w-0 flex-col">
          <span className="font-bold uppercase tracking-[0.18em] text-text-primary typo-caption1">
            Official
          </span>
          <span className="text-text-tertiary typo-caption1">Company page</span>
        </div>
      </Card>
    ),
  },
  {
    id: 'p-duotone',
    title: 'Duotone',
    from: 'The holographic, calmed',
    note: 'Purple on the left, blue on the right, meeting under the words. Seal in onion so it reads against both.',
    render: () => (
      <Card style={{ background: frost, boxShadow: purpleEdge }}>
        <Haze
          background={`linear-gradient(90deg, ${c('cabbage', 60)}, ${c(
            'blueCheese',
            36,
          )})`}
        />
        <Seal className="text-accent-onion-default" />
        <Label title="Official" sub="Verified company page" />
      </Card>
    ),
  },
  {
    id: 'p-spotlight',
    title: 'Spotlight',
    from: 'A vitrine',
    note: 'Dark glass; the only light is a purple pool behind the seal. The rest of the card is night.',
    render: () => (
      <Card
        style={{
          background: 'var(--theme-background-default)',
          boxShadow:
            'inset 0 0 0 1px color-mix(in srgb, var(--theme-text-primary) 10%, transparent)',
        }}
      >
        <Haze
          background={`radial-gradient(40% 140% at 8% 50%, ${c(
            'cabbage',
            75,
          )}, transparent 70%)`}
        />
        <Seal />
        <Label />
      </Card>
    ),
  },
  {
    id: 'p-serial',
    title: 'Serial glass',
    from: '09 with the hallmark copy',
    note: 'Purple foil glass, and the second line is the number. The one that reads rare.',
    render: () => (
      <Card style={{ background: frost, boxShadow: purpleEdge }}>
        <Haze background={purpleHaze} />
        <Seal />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            Official company page
          </span>
          <span className="sq-nums text-text-tertiary typo-caption1">
            Verified No. 0041 · Since Feb 2023
          </span>
        </div>
      </Card>
    ),
  },
  {
    id: 'p-mark',
    title: 'Company mark',
    from: '12, in glass',
    note: "The company's own logo in the seal's ring, the seal on its corner, purple glass behind. Theirs, verified by us.",
    render: () => (
      <Card style={{ background: frost, boxShadow: purpleEdge }}>
        <Haze background={purpleHaze} />
        <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-cabbage-default p-[2px]">
          <img
            src={squad.image}
            alt=""
            className="size-full rounded-full object-cover ring-2 ring-background-default"
          />
          <VerifiedSeal className="absolute -bottom-0.5 -right-0.5 size-4 text-accent-cabbage-default [&_path:last-child]:stroke-background-default" />
        </span>
        <Label title="Official page" sub={`of ${squad.company.website}`} />
      </Card>
    ),
  },
];
