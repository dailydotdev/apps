import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BookmarkIcon,
  CopyIcon,
  DiscussIcon,
  DownloadIcon,
  LinkIcon,
  MenuIcon,
  ShareIcon,
  SnapshotIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { LeadAction, Support } from './sharingMap';
import { SHARING_MAP } from './sharingMap';

const AVATAR =
  'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile';

/* ------------------------------------------------------------------ prose */

const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="font-bold text-text-primary typo-mega3">{children}</h1>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-8 font-bold text-text-primary typo-title1">{children}</h2>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="max-w-[54rem] text-text-secondary typo-body">{children}</p>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="max-w-[54rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-callout">
    {children}
  </p>
);

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-left">
      <thead>
        <tr>
          {head.map((cell) => (
            <th
              key={cell}
              className="border-b border-border-subtlest-tertiary px-3 py-2 font-bold text-text-tertiary typo-footnote"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row[0])}>
            {row.map((cell, i) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="border-b border-border-subtlest-tertiary px-3 py-2 align-top text-text-primary typo-callout"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------------------------------------------------------------- controls */

const ICONS: Record<LeadAction, React.ReactElement> = {
  Link: <LinkIcon />,
  'Share to': <ShareIcon />,
  Snapshot: <SnapshotIcon />,
};

const LABELS: Record<LeadAction, string> = {
  Link: 'Copy link',
  'Share to': 'Share',
  Snapshot: 'Snapshot',
};

/**
 * The controls are inert on this page on purpose — it compares where a share
 * control sits, not what it produces. Live capture is the Button placements
 * page.
 */
const Control = ({
  action,
  label,
  size = ButtonSize.Small,
  variant = ButtonVariant.Secondary,
}: {
  action: LeadAction;
  /** Off for icon-only rows, where a label would not fit. */
  label?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) => (
  <Button
    aria-label={LABELS[action]}
    icon={ICONS[action]}
    size={size}
    variant={variant}
  >
    {label ? LABELS[action] : undefined}
  </Button>
);

/* ------------------------------------------------------------------- mocks */

type Shape = 'menu' | 'row' | 'header' | 'band' | 'modal' | 'hover' | 'bar';

interface MockProps {
  shape: Shape;
  title: string;
  meta?: string;
  body?: string;
  /** The share action this variation leads with. */
  action: LeadAction;
  /** Icon-only, or icon + label. */
  label?: boolean;
  /** A second, quieter action beside the leading one. */
  secondary?: LeadAction;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Screen = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-[34rem] rounded-14 border border-border-subtlest-tertiary bg-background-default p-4">
    {children}
  </div>
);

const Controls = ({
  action,
  label,
  secondary,
  size,
  variant,
}: Pick<
  MockProps,
  'action' | 'label' | 'secondary' | 'size' | 'variant'
>) => (
  <div className="flex items-center gap-2">
    {secondary && (
      <Control action={secondary} size={size} variant={ButtonVariant.Tertiary} />
    )}
    <Control action={action} label={label} size={size} variant={variant} />
  </div>
);

const Mock = ({
  shape,
  title,
  meta,
  body,
  action,
  label,
  secondary,
  size,
  variant,
}: MockProps) => {
  const controls = (
    <Controls
      action={action}
      label={label}
      secondary={secondary}
      size={size}
      variant={variant}
    />
  );

  if (shape === 'menu') {
    return (
      <Screen>
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {title}
            </span>
            {meta && (
              <span className="truncate text-text-tertiary typo-footnote">
                {meta}
              </span>
            )}
          </div>
          <Button
            aria-label="Options"
            icon={<MenuIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        </div>
        <div className="ml-auto mt-2 flex w-56 flex-col rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2">
          {['Report', 'Hide', 'Block source'].map((item) => (
            <span
              key={item}
              className="px-3 py-2 text-text-tertiary typo-callout"
            >
              {item}
            </span>
          ))}
          <span className="flex items-center gap-2 rounded-8 bg-surface-float px-3 py-2 text-text-primary typo-callout">
            {ICONS[action]}
            {LABELS[action]}
          </span>
        </div>
      </Screen>
    );
  }

  if (shape === 'row') {
    return (
      <Screen>
        <span className="font-bold text-text-primary typo-callout">
          {title}
        </span>
        {meta && (
          <p className="mt-1 text-text-tertiary typo-footnote">{meta}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <Button
            aria-label="Upvote"
            icon={<UpvoteIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          >
            128
          </Button>
          <Button
            aria-label="Comment"
            icon={<DiscussIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          >
            24
          </Button>
          <Button
            aria-label="Bookmark"
            icon={<BookmarkIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
          <div className="ml-auto">{controls}</div>
        </div>
      </Screen>
    );
  }

  if (shape === 'header') {
    return (
      <Screen>
        <div className="flex items-center gap-4">
          <img
            alt=""
            className="size-12 rounded-full object-cover"
            src={AVATAR}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-title3">
              {title}
            </span>
            {meta && (
              <span className="truncate text-text-tertiary typo-footnote">
                {meta}
              </span>
            )}
          </div>
          <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
            Follow
          </Button>
          {controls}
        </div>
      </Screen>
    );
  }

  if (shape === 'band') {
    return (
      <Screen>
        <div className="flex items-center gap-4 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-callout">
              {title}
            </span>
            {body && (
              <span className="text-text-tertiary typo-footnote">{body}</span>
            )}
          </div>
          {controls}
        </div>
      </Screen>
    );
  }

  if (shape === 'modal') {
    return (
      <Screen>
        <div className="flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-6 text-center">
          <span className="font-bold text-text-primary typo-title3">
            {title}
          </span>
          {body && (
            <span className="text-text-tertiary typo-callout">{body}</span>
          )}
          <div className="mt-2 flex items-center gap-2">
            {secondary && (
              <Control
                action={secondary}
                label
                variant={ButtonVariant.Float}
              />
            )}
            <Control action={action} label variant={variant} />
          </div>
        </div>
      </Screen>
    );
  }

  if (shape === 'bar') {
    return (
      <Screen>
        <p className="text-text-secondary typo-callout">
          TypeScript has become{' '}
          <span className="rounded-4 bg-overlay-float-cabbage px-1 text-text-primary">
            the default across frontend frameworks
          </span>
          , and the tooling has followed.
        </p>
        <div
          aria-label="Share selected text"
          className="mt-3 inline-flex items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2"
          role="toolbar"
        >
          <Button
            aria-label="Copy link"
            icon={<LinkIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
          <Button
            aria-label="Copy text"
            icon={<CopyIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
          <Button
            aria-label="Quote in a comment"
            icon={<DiscussIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
          <Control
            action={action}
            label={label}
            size={ButtonSize.Small}
            variant={variant ?? ButtonVariant.Tertiary}
          />
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="flex flex-col gap-1">
        {[title, 'Second row', 'Third row'].map((row, i) => (
          <div
            key={row}
            className={`flex items-center gap-3 rounded-10 px-3 py-2 ${
              i === 0 ? 'bg-surface-float' : ''
            }`}
          >
            <span className="w-6 font-bold text-text-tertiary typo-footnote">
              #{i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
              {row}
            </span>
            {i === 0 ? (
              controls
            ) : (
              <span className="text-text-quaternary typo-footnote">hover</span>
            )}
          </div>
        ))}
      </div>
    </Screen>
  );
};

/* -------------------------------------------------------------- variations */

type Tier = 'Today' | 'Recommended' | 'Push';

const TIER_STYLE: Record<Tier, string> = {
  Today: 'border-border-subtlest-tertiary text-text-tertiary',
  Recommended:
    'border-accent-avocado-default text-accent-avocado-default bg-overlay-float-avocado',
  Push: 'border-accent-cabbage-default text-accent-cabbage-default bg-overlay-float-cabbage',
};

interface Variation extends MockProps {
  tier: Tier;
  headline: string;
  note: string;
}

const VariationBlock = ({ tier, headline, note, ...mock }: Variation) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span
        className={`w-fit rounded-8 border px-2 py-0.5 font-bold uppercase typo-caption2 ${TIER_STYLE[tier]}`}
      >
        {tier}
      </span>
      <span className="font-bold text-text-primary typo-callout">
        {headline}
      </span>
      <span className="max-w-[34rem] text-text-tertiary typo-footnote">
        {note}
      </span>
    </div>
    <Mock {...mock} />
  </div>
);

interface SurfaceSpec {
  surface: string;
  variations: Variation[];
}

const SurfaceBlock = ({ surface, variations }: SurfaceSpec) => {
  const row = SHARING_MAP.find((entry) => entry.surface === surface);

  return (
    <section className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-8">
      <div className="flex flex-wrap items-baseline gap-3">
        <h3 className="font-bold text-text-primary typo-title2">{surface}</h3>
        {row && (
          <span className="text-text-tertiary typo-footnote">
            #{row.pr} · map says lead with{' '}
            <span className="font-bold text-text-primary">{row.leads}</span> ·{' '}
            {row.why}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-start gap-8">
        {variations.map((variation) => (
          <VariationBlock key={variation.tier} {...variation} />
        ))}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------- specs */

const SURFACES: SurfaceSpec[] = [
  {
    surface: 'Post page & modal',
    variations: [
      {
        tier: 'Today',
        headline: 'Buried in the overflow menu',
        note: 'Two taps and a scan of five unrelated items before sharing is even an option.',
        shape: 'menu',
        title: 'Why iconic tech brands lost their dominance',
        meta: 'XDA Developers · 4 min read',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Labeled, at the end of the action row',
        note: 'The row is already the place people press. A label makes it readable at a glance instead of one more grey glyph.',
        shape: 'row',
        title: 'Why iconic tech brands lost their dominance',
        action: 'Link',
        label: true,
      },
      {
        tier: 'Push',
        headline: 'Snapshot leads, link demoted beside it',
        note: 'Test candidate. The map says link, because the destination is the value here — but this is our highest-traffic surface, so it is also where a snapshot test buys the most signal.',
        shape: 'row',
        title: 'Why iconic tech brands lost their dominance',
        action: 'Snapshot',
        label: true,
        secondary: 'Link',
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Highlighted text',
    variations: [
      {
        tier: 'Today',
        headline: 'Nothing — the browser copies plain text',
        note: 'Selecting a line offers no daily.dev affordance at all. The quote leaves as unattributed text.',
        shape: 'menu',
        title: 'Selected: "the default across frontend frameworks"',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Snapshot in the floating selection bar',
        note: 'The bar appears exactly when intent exists. Icon-only keeps it from covering the text it belongs to.',
        shape: 'bar',
        title: 'Selection bar',
        action: 'Snapshot',
      },
      {
        tier: 'Push',
        headline: 'Snapshot labeled and filled in the bar',
        note: 'The only labeled item in the bar, so the eye lands on it first. Costs width on mobile.',
        shape: 'bar',
        title: 'Selection bar',
        action: 'Snapshot',
        label: true,
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'End of conversation',
    variations: [
      {
        tier: 'Today',
        headline: 'In the post menu, far above the fold',
        note: 'By the time someone finishes a good thread, the share control is a full scroll away.',
        shape: 'menu',
        title: 'React Server Components in production',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'A band under the last comment',
        note: 'Peak-end: the band sits where reading actually stops, with snapshot available for anyone who wants the thread as an image.',
        shape: 'band',
        title: 'Enjoyed this discussion?',
        body: '24 comments and counting',
        action: 'Link',
        label: true,
        secondary: 'Snapshot',
      },
      {
        tier: 'Push',
        headline: 'Snapshot leads the band',
        note: 'Test candidate. A live thread goes stale as an image, so this trades accuracy for reach — worth measuring, not worth assuming.',
        shape: 'band',
        title: 'Enjoyed this discussion?',
        body: '24 comments and counting',
        action: 'Snapshot',
        label: true,
        secondary: 'Link',
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Post-upvote prompt',
    variations: [
      {
        tier: 'Today',
        headline: 'A small prompt, easy to scroll past',
        note: 'The strongest intent signal we get, answered with the quietest control we have.',
        shape: 'band',
        title: 'Should anyone else see this?',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Labeled control in the prompt',
        note: 'Same moment, same real estate, a control that reads as an offer rather than a decoration.',
        shape: 'band',
        title: 'Should anyone else see this?',
        body: 'You upvoted it — pass it on',
        action: 'Link',
        label: true,
      },
      {
        tier: 'Push',
        headline: 'The prompt becomes a card, snapshot beside it',
        note: 'The map gives snapshot nothing to add here — it would be the same payload twice. Included only as the visibility ceiling for this surface.',
        shape: 'modal',
        title: 'Should anyone else see this?',
        body: 'You upvoted it — pass it on',
        action: 'Link',
        secondary: 'Snapshot',
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Briefing / digest',
    variations: [
      {
        tier: 'Today',
        headline: 'No share button at all on the digest',
        note: 'The most personal artifact we produce, and it currently cannot leave the product.',
        shape: 'menu',
        title: '5 things worth your morning',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Snapshot in the briefing header',
        note: 'A link sends the recipient to their own briefing, or to a wall. The image is the only payload that survives the trip.',
        shape: 'header',
        title: '5 things worth your morning',
        meta: 'Your briefing · today',
        action: 'Snapshot',
      },
      {
        tier: 'Push',
        headline: 'A closing band after the last item',
        note: 'Adds a second entry point at the end of the read, where finishing the briefing is itself the trigger.',
        shape: 'band',
        title: 'Share your briefing',
        body: 'Short briefing by @tomer',
        action: 'Snapshot',
        label: true,
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Profile',
    variations: [
      {
        tier: 'Today',
        headline: 'Inside the "..." menu',
        note: 'Merged already (#6354) — this is the before.',
        shape: 'menu',
        title: 'Tomer Redlich',
        meta: '@tomer',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Icon in the header, snapshot beside it',
        note: 'Kept distinct from Follow and matched to the edit button next to it. The point of a profile share is that they follow you, so link leads.',
        shape: 'header',
        title: 'Tomer Redlich',
        meta: '@tomer · 1.2k reputation',
        action: 'Link',
        secondary: 'Snapshot',
        variant: ButtonVariant.Float,
      },
      {
        tier: 'Push',
        headline: 'Snapshot labeled and leading',
        note: 'Test candidate. The profile snapshot carries the stats a link only promises — but it cannot be followed.',
        shape: 'header',
        title: 'Tomer Redlich',
        meta: '@tomer · 1.2k reputation',
        action: 'Snapshot',
        label: true,
        secondary: 'Link',
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Tags & sources',
    variations: [
      {
        tier: 'Today',
        headline: 'Hidden in the "..." menu',
        note: 'Sharing a topic takes two taps and prior knowledge that it is possible.',
        shape: 'menu',
        title: '#typescript',
        meta: '48.2k followers',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Icon next to Follow, matched to it',
        note: 'Same size and Float weight as the Follow button, so it reads as a peer rather than an afterthought.',
        shape: 'header',
        title: '#typescript',
        meta: '48.2k followers',
        action: 'Link',
        variant: ButtonVariant.Float,
      },
      {
        tier: 'Push',
        headline: 'Labeled beside Follow',
        note: 'Maximum visibility for this surface. Snapshot stays out: an image of a tag says nothing a live feed does not say better.',
        shape: 'header',
        title: '#typescript',
        meta: '48.2k followers',
        action: 'Link',
        label: true,
      },
    ],
  },
  {
    surface: 'Leaderboard — the board',
    variations: [
      {
        tier: 'Today',
        headline: 'No control on the board header',
        note: 'The board is a weekly event and nothing invites you to pass it around.',
        shape: 'menu',
        title: 'Highest level',
        meta: 'This week',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Icon in the board header',
        note: 'The board changes weekly, so a link stays true where an image goes stale within days.',
        shape: 'header',
        title: 'Highest level',
        meta: 'This week',
        action: 'Link',
      },
      {
        tier: 'Push',
        headline: 'Labeled, with snapshot for the frozen board',
        note: 'Snapshot as the secondary covers "look at this week" without pretending the board is static.',
        shape: 'header',
        title: 'Highest level',
        meta: 'This week',
        action: 'Link',
        label: true,
        secondary: 'Snapshot',
      },
    ],
  },
  {
    surface: 'Leaderboard — my rank',
    variations: [
      {
        tier: 'Today',
        headline: 'Nothing on your own row',
        note: 'Placing on a leaderboard is a status moment that currently ends in silence.',
        shape: 'hover',
        title: 'Bobby Iliev',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Snapshot revealed on your row',
        note: 'Status content is image-first; there is no page that proves you were #1 last week.',
        shape: 'hover',
        title: 'Bobby Iliev',
        action: 'Snapshot',
      },
      {
        tier: 'Push',
        headline: 'A rank band above the board',
        note: 'Hover reveal is invisible on touch. A band naming your rank works everywhere and states the offer outright.',
        shape: 'band',
        title: "You're #1 this week",
        body: 'Highest level · 103',
        action: 'Snapshot',
        label: true,
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Happening Now',
    variations: [
      {
        tier: 'Today',
        headline: 'No per-highlight control',
        note: 'The page moves fast and nothing can be lifted out of it.',
        shape: 'menu',
        title: 'OpenAI ships a new model tier',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Snapshot per highlight',
        note: 'The payload is essentially the whole page, and news travels through chat apps where an image renders inline.',
        shape: 'row',
        title: 'OpenAI ships a new model tier',
        action: 'Snapshot',
        secondary: 'Link',
      },
      {
        tier: 'Push',
        headline: 'Snapshot labeled on the expanded highlight',
        note: 'Reserved for the expanded state, where there is room for a label without crowding the row.',
        shape: 'band',
        title: 'Happening now',
        body: 'OpenAI ships a new model tier',
        action: 'Snapshot',
        label: true,
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Reading streak',
    variations: [
      {
        tier: 'Today',
        headline: 'A popup you dismiss',
        note: 'The milestone is announced and then thrown away.',
        shape: 'modal',
        title: '100 day reading streak',
        body: 'Keep it going tomorrow',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Snapshot in the streak popup',
        note: 'A link to your streak means nothing to anyone else — the number is the entire message.',
        shape: 'modal',
        title: '100 day reading streak',
        body: 'Keep it going tomorrow',
        action: 'Snapshot',
        variant: ButtonVariant.Primary,
      },
      {
        tier: 'Push',
        headline: 'Fire the popup on milestones only',
        note: 'Frequency is the lever here, not placement. Every day dulls it; 10 / 50 / 100 keeps it an event.',
        shape: 'modal',
        title: '100 day reading streak',
        body: 'Your longest yet',
        action: 'Snapshot',
        secondary: 'Link',
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Celebrations & achievements',
    variations: [
      {
        tier: 'Today',
        headline: 'Unlock, then nothing',
        note: 'The achievement lands in a grid and the moment passes unshared.',
        shape: 'menu',
        title: 'Emerald reader unlocked',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Snapshot on the card and in the modal',
        note: 'Pure status, and the card artwork is already designed to be looked at.',
        shape: 'modal',
        title: 'Emerald reader',
        body: 'Unlocked today',
        action: 'Snapshot',
        variant: ButtonVariant.Primary,
      },
      {
        tier: 'Push',
        headline: 'The celebration opens itself',
        note: 'Highest-visibility option in the whole set: the share offer arrives without being sought. Also the most interruptive — gate it to rare unlocks.',
        shape: 'modal',
        title: 'Emerald reader',
        body: 'Only 4% of readers get here',
        action: 'Snapshot',
        secondary: 'Link',
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'DevCard',
    variations: [
      {
        tier: 'Today',
        headline: 'Download, and that is all',
        note: 'The card is generated, saved, and usually never posted.',
        shape: 'menu',
        title: 'Your DevCard is ready',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Share beside Download, matched to it',
        note: 'It is already an image — wrapping an image in a snapshot adds nothing, so share-to leads.',
        shape: 'modal',
        title: 'Your DevCard is ready',
        body: 'Post it, or save it for later',
        action: 'Share to',
        secondary: 'Link',
      },
      {
        tier: 'Push',
        headline: 'Share filled, download demoted',
        note: 'Flips the default from private save to public post. Cheap to test, easy to revert.',
        shape: 'modal',
        title: 'Your DevCard is ready',
        body: 'Post it, or save it for later',
        action: 'Share to',
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Reading history',
    variations: [
      {
        tier: 'Today',
        headline: 'No per-row control',
        note: 'Re-sharing something you already read means finding the post again.',
        shape: 'hover',
        title: 'Why iconic tech brands lost their dominance',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Link icon on the row',
        note: 'Each row is just a post, so the payload question never arises — only reach does.',
        shape: 'hover',
        title: 'Why iconic tech brands lost their dominance',
        action: 'Link',
      },
      {
        tier: 'Push',
        headline: 'Always visible rather than on hover',
        note: 'Hover reveal does not exist on touch. Persistent icons cost a little noise and buy the whole mobile audience.',
        shape: 'hover',
        title: 'Why iconic tech brands lost their dominance',
        action: 'Link',
        label: true,
      },
    ],
  },
  {
    surface: 'Copy my feed',
    variations: [
      {
        tier: 'Today',
        headline: 'Does not exist',
        note: 'Your feed is the most personal thing in the product and it has no export at all.',
        shape: 'menu',
        title: "What I'm reading",
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Snapshot in the feed header',
        note: 'There is no URL anyone else can open — your feed is yours. The image is the only shareable form.',
        shape: 'header',
        title: "What I'm reading",
        meta: 'Top 20 posts this week',
        action: 'Snapshot',
      },
      {
        tier: 'Push',
        headline: 'Labeled, pinned to the feed header',
        note: 'A new capability nobody is looking for needs a label the first time they meet it.',
        shape: 'header',
        title: "What I'm reading",
        meta: 'Top 20 posts this week',
        action: 'Snapshot',
        label: true,
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Squad directory',
    variations: [
      {
        tier: 'Today',
        headline: 'Hidden in the card menu',
        note: 'Squads grow by word of mouth, from a control nobody sees.',
        shape: 'menu',
        title: 'Frontend Fans',
        meta: '2.4k members',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Small control next to Join',
        note: 'The point is joining, so the link leads and sits beside the action it supports.',
        shape: 'header',
        title: 'Frontend Fans',
        meta: '2.4k members',
        action: 'Link',
        variant: ButtonVariant.Float,
      },
      {
        tier: 'Push',
        headline: 'Labeled beside Join',
        note: 'Two labeled buttons in one row competes with Join itself — visibility gained, conversion possibly lost.',
        shape: 'header',
        title: 'Frontend Fans',
        meta: '2.4k members',
        action: 'Link',
        label: true,
      },
    ],
  },
  {
    surface: 'Best-of / discovery',
    variations: [
      {
        tier: 'Today',
        headline: 'No header control',
        note: 'Curated pages are the most linkable thing we publish and carry no share affordance.',
        shape: 'menu',
        title: "August's most upvoted reads",
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Icon in the section header',
        note: 'Evergreen pages are worth landing on, so the link is the gift.',
        shape: 'header',
        title: "August's most upvoted reads",
        meta: 'Best of · August 2026',
        action: 'Link',
      },
      {
        tier: 'Push',
        headline: 'Labeled, with a snapshot of the top five',
        note: 'The snapshot works as a teaser that carries the link back in the card footer.',
        shape: 'header',
        title: "August's most upvoted reads",
        meta: 'Best of · August 2026',
        action: 'Link',
        label: true,
        secondary: 'Snapshot',
      },
    ],
  },
  {
    surface: 'Hot takes',
    variations: [
      {
        tier: 'Today',
        headline: 'Buried in the item menu',
        note: 'The most quotable content in the product, behind the least visible control.',
        shape: 'menu',
        title: '"Microservices were a mistake for most teams"',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Snapshot on the take',
        note: 'An opinion is self-contained and quotable; the image is the argument.',
        shape: 'row',
        title: '"Microservices were a mistake for most teams"',
        action: 'Snapshot',
        secondary: 'Link',
      },
      {
        tier: 'Push',
        headline: 'Snapshot labeled and filled',
        note: 'Hot takes are where snapshot has the clearest right to lead, so this is the low-risk place to test the loudest treatment.',
        shape: 'row',
        title: '"Microservices were a mistake for most teams"',
        action: 'Snapshot',
        label: true,
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Invite a friend',
    variations: [
      {
        tier: 'Today',
        headline: 'A quiet icon in the invite screen',
        note: 'The referral link is the product here, and it looks like a footnote.',
        shape: 'band',
        title: 'Come read with me on daily.dev',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Labeled link, snapshot beside it',
        note: 'An image of a referral cannot be clicked, so the link leads — but the snapshot gives the invite something to look at.',
        shape: 'band',
        title: 'Come read with me on daily.dev',
        body: 'We both get a month of Plus',
        action: 'Link',
        label: true,
        secondary: 'Snapshot',
      },
      {
        tier: 'Push',
        headline: 'An onboarding step, not a settings page',
        note: 'Placement beats styling here: the invite lands during onboarding, when the reward still means something. Blocked on backend (#6366).',
        shape: 'modal',
        title: 'Invite 3 friends',
        body: 'We both get a month of Plus',
        action: 'Link',
        secondary: 'Snapshot',
        variant: ButtonVariant.Primary,
      },
    ],
  },
  {
    surface: 'Watercooler post',
    variations: [
      {
        tier: 'Today',
        headline: 'Menu only',
        note: 'Same as any feed card — the share control is one level down.',
        shape: 'menu',
        title: 'What is your most controversial dev opinion?',
        action: 'Link',
      },
      {
        tier: 'Recommended',
        headline: 'Snapshot next to bookmark',
        note: 'Matched to the other feed action buttons in size and Tertiary weight, so the row stays even.',
        shape: 'row',
        title: 'What is your most controversial dev opinion?',
        action: 'Link',
        secondary: 'Snapshot',
      },
      {
        tier: 'Push',
        headline: 'Snapshot leads the card',
        note: 'It is a post, so link is the honest default. Listed for completeness of the ladder.',
        shape: 'row',
        title: 'What is your most controversial dev opinion?',
        action: 'Snapshot',
        label: true,
        variant: ButtonVariant.Primary,
      },
    ],
  },
];

/* -------------------------------------------------------------------- page */

const SUPPORT_LABEL: Record<Support, React.ReactNode> = {
  core: <span className="text-accent-avocado-default">core</span>,
  secondary: <span className="text-text-tertiary">secondary</span>,
  none: <span className="text-text-quaternary">—</span>,
};

const MAP_ROWS: React.ReactNode[][] = SHARING_MAP.map((row) => [
  row.surface,
  row.pr,
  SUPPORT_LABEL[row.link],
  SUPPORT_LABEL[row.snapshot],
  <span className="font-bold text-text-primary">{row.leads}</span>,
  row.why,
]);

const LADDER: React.ReactNode[][] = [
  ['Today', 'What ships now — usually the overflow menu, or nothing at all'],
  [
    'Recommended',
    'Visible in place, leading with the action the map chose for that surface',
  ],
  [
    'Push',
    'The loudest treatment worth trying: labeled, filled, or self-opening — and snapshot promoted to primary wherever the payload can carry it',
  ],
];

const ShareVisibility = () => (
  <div className="flex flex-col gap-4 p-8">
    <H1>Share visibility — variations per surface</H1>
    <P>
      Two goals drive every variation below: make the share control impossible
      to miss, and lead with snapshot wherever the payload is the thing worth
      sending. Each surface gets the same three steps, so the options can be
      compared across surfaces rather than argued one at a time.
    </P>
    <Table head={['Step', 'What it means']} rows={LADDER} />
    <Note>
      The controls on this page are inert. It compares where a share control
      sits and how loud it is — the working buttons and live capture are on{' '}
      <span className="font-bold text-text-primary">Button placements</span>,
      and the images they produce are on{' '}
      <span className="font-bold text-text-primary">Share images</span>.
    </Note>

    <H2>The mapping this is built on</H2>
    <P>
      Unchanged from the Sharing map. Where a &ldquo;Push&rdquo; variation
      contradicts it, the note on that variation says so and why it is still
      worth testing — the map is a default, not a veto.
    </P>
    <Table
      head={['Surface', 'PR', 'Link', 'Snapshot', 'Leads with', 'Why']}
      rows={MAP_ROWS}
    />

    <H2>Where snapshot can lead</H2>
    <P>
      Seven surfaces have no useful destination to send anyone to — a streak, a
      rank, an unlocked achievement, your own feed. Snapshot is not the louder
      option there, it is the only one, so it leads by default. On the
      remaining thirteen the destination is the value and a snapshot competes
      with it; those get a Push variation so the trade can be measured instead
      of assumed.
    </P>

    <H2>Surface by surface</H2>
    {SURFACES.map((spec) => (
      <SurfaceBlock key={spec.surface} {...spec} />
    ))}

    <div className="mt-8 border-t border-border-subtlest-tertiary pt-8">
      <Note>
        One caveat that applies to every Push variation: only the invite card
        carries a URL today. Promoting snapshot on a surface before a short link
        is baked into the card means trading a share that leads somewhere for
        one that does not.
      </Note>
    </div>
  </div>
);

const meta: Meta<typeof ShareVisibility> = {
  title: 'Features/Snapshot/Visibility variations',
  component: ShareVisibility,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof ShareVisibility> = {};
