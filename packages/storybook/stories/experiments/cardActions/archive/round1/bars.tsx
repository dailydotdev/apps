import type { ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import ActionButtons from '@dailydotdev/shared/src/components/cards/common/ActionButtons';
import {
  ButtonV2,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import {
  Button,
  ButtonIconPosition,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { AnalyticsIcon } from '@dailydotdev/shared/src/components/icons/Analytics';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { DownvoteIcon } from '@dailydotdev/shared/src/components/icons/Downvote';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import type { DemoActions } from './kit';
import {
  compactCount,
  demoPost,
  useCardWidth,
  useDemoActions,
  useTierReport,
} from './kit';

/* ------------------------------------------------------------------------ */
/* One action button, five sizes                                             */
/* ------------------------------------------------------------------------ */

/**
 * The engagement-bar button ladder. 24 is today; 28 is the step the scale
 * skips; 32 is where the bar was before August; 36 and 40 are new for cards.
 */
export type Tier = 24 | 28 | 32 | 36 | 40;
export const TIERS: Tier[] = [40, 36, 32, 28, 24];

const tierClass: Record<Tier, { box: string; square: string; text: string }> = {
  24: { box: '!h-6 !rounded-8', square: '!w-6', text: 'typo-caption1' },
  28: { box: '!h-7 !rounded-10', square: '!w-7', text: 'typo-footnote' },
  32: { box: '!h-8 !rounded-10', square: '!w-8', text: 'typo-footnote' },
  36: { box: '!h-9 !rounded-12', square: '!w-9', text: 'typo-callout' },
  40: { box: '!h-10 !rounded-12', square: '!w-10', text: 'typo-callout' },
};

export const tierIcon: Record<Tier, IconSize> = {
  24: IconSize.Size16,
  28: IconSize.XSmall,
  32: IconSize.XSmall,
  36: IconSize.Small,
  40: IconSize.Small,
};

interface ActProps {
  tier?: Tier;
  icon: ReactElement;
  label: string;
  color: ButtonColor;
  count?: number;
  pressed?: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Mirrors the production `CardAction` (ButtonV2, tertiary, count inside the
 * button) but formats the count with the proposed `compactCount` rule.
 */
const Act = ({
  tier = 32,
  icon,
  label,
  color,
  count,
  pressed,
  onClick,
  className,
}: ActProps): ReactElement => {
  const t = tierClass[tier];
  const showCount = !!count;
  return (
    <ButtonV2
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      color={color}
      pressed={pressed}
      onClick={onClick}
      aria-label={label}
      icon={React.cloneElement(icon, { size: tierIcon[tier] })}
      className={classNames(
        t.box,
        // 2px icon-to-number, as the production v1 bar spaces its counters.
        showCount ? '!gap-0.5 !pl-1 !pr-1' : t.square,
        className,
      )}
    >
      {showCount && (
        <span className={classNames('font-medium tabular-nums', t.text)}>
          {compactCount(count)}
        </span>
      )}
    </ButtonV2>
  );
};

type Kind = 'upvote' | 'comment' | 'downvote' | 'bookmark' | 'copy' | 'stat';

/** Props for one of the six actions, wired to the demo state. */
const action = (
  kind: Kind,
  a: DemoActions,
  { bare = false }: { bare?: boolean } = {},
): Omit<ActProps, 'tier' | 'className'> => {
  switch (kind) {
    case 'upvote':
      return {
        icon: <UpvoteIcon secondary={a.upvoted} />,
        label: a.upvoted ? 'Remove upvote' : 'Upvote',
        color: ButtonColor.Avocado,
        count: bare ? undefined : a.upvotes,
        pressed: a.upvoted,
        onClick: a.toggleUpvote,
      };
    case 'comment':
      return {
        icon: <DiscussIcon />,
        label: 'Comments',
        color: ButtonColor.BlueCheese,
        count: bare ? undefined : a.comments,
        onClick: a.noop,
      };
    case 'downvote':
      return {
        icon: <DownvoteIcon secondary={a.downvoted} />,
        label: a.downvoted ? 'Remove downvote' : 'Downvote',
        color: ButtonColor.Ketchup,
        pressed: a.downvoted,
        onClick: a.toggleDownvote,
      };
    case 'bookmark':
      return {
        icon: <BookmarkIcon secondary={a.bookmarked} />,
        label: a.bookmarked ? 'Remove bookmark' : 'Bookmark',
        color: ButtonColor.Bun,
        pressed: a.bookmarked,
        onClick: a.toggleBookmark,
      };
    case 'copy':
      return {
        icon: <LinkIcon />,
        label: 'Copy link',
        color: ButtonColor.Cabbage,
        onClick: a.noop,
      };
    default:
      return {
        icon: <AnalyticsIcon />,
        label: 'Impressions',
        color: ButtonColor.Cheese,
        count: a.impressions,
        onClick: a.noop,
      };
  }
};

const SIX: Kind[] = [
  'upvote',
  'comment',
  'downvote',
  'bookmark',
  'copy',
  'stat',
];
const FIVE: Kind[] = ['upvote', 'comment', 'downvote', 'bookmark', 'stat'];

/** A spread row: `justify-between`, buttons never shrink (as in production). */
const Row = ({
  kinds,
  tier,
  className,
}: {
  kinds: Kind[];
  tier: Tier;
  className?: string;
}): ReactElement => {
  const a = useDemoActions();
  return (
    <div className={classNames('flex items-center justify-between', className)}>
      {kinds.map((k) => (
        <Act key={k} tier={tier} {...action(k, a)} />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* 0. Today                                                                  */
/* ------------------------------------------------------------------------ */

/** The production bar, unmodified — the reference every variant is held to. */
export const TodayBar = (): ReactElement => (
  <ActionButtons
    post={demoPost}
    variant="grid"
    onUpvoteClick={fn()}
    onCommentClick={fn()}
    onBookmarkClick={fn()}
    onCopyLinkClick={fn()}
    onDownvoteClick={fn()}
  />
);

/* ------------------------------------------------------------------------ */
/* Bar variants                                                              */
/* ------------------------------------------------------------------------ */

export const SizeUpBar = (): ReactElement => (
  <Row kinds={SIX} tier={28} className="px-1 py-1" />
);

export const FiveBar = (): ReactElement => (
  <Row kinds={FIVE} tier={32} className="px-1 py-0.5" />
);

export const VotePillBar = (): ReactElement => {
  const a = useDemoActions();
  return (
    <div className="flex items-center justify-between px-1 py-0.5">
      <div className="flex items-center rounded-12 bg-surface-float">
        <Act tier={36} {...action('upvote', a)} className="!pr-1" />
        <span className="h-4 w-px bg-border-subtlest-tertiary" />
        <Act tier={36} {...action('downvote', a)} />
      </div>
      <Act {...action('comment', a)} />
      <Act {...action('bookmark', a)} />
      <Act {...action('stat', a)} />
    </div>
  );
};

export const PrimaryPairBar = (): ReactElement => {
  const a = useDemoActions();
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      <Act tier={36} {...action('upvote', a)} className="bg-surface-float" />
      <Act tier={36} {...action('comment', a)} className="bg-surface-float" />
      <div className="ml-auto flex items-center">
        <Act tier={28} {...action('downvote', a)} />
        <Act tier={28} {...action('bookmark', a)} />
        <Act tier={28} {...action('stat', a)} />
      </div>
    </div>
  );
};

// Each cell grows with `flex-auto`, so the slack the row used to waste between
// buttons becomes target area instead. The end cells follow the card's corner.
const cell = 'flex-auto !h-10 !w-auto !rounded-none !px-1';

export const EdgeStripBar = (): ReactElement => {
  const a = useDemoActions();
  return (
    <div className="mt-1 flex w-full border-t border-border-subtlest-tertiary">
      {SIX.map((k, i) => (
        <Act
          key={k}
          {...action(k, a)}
          className={classNames(
            cell,
            i === 0 && '!rounded-bl-16',
            i === SIX.length - 1 && '!rounded-br-16',
          )}
        />
      ))}
    </div>
  );
};

const Stacked = ({
  label,
  icon,
  count,
  color,
  pressed,
  onClick,
}: ReturnType<typeof action>): ReactElement => (
  <Button
    variant={ButtonVariant.Tertiary}
    color={color}
    size={ButtonSize.Small}
    iconPosition={ButtonIconPosition.Top}
    icon={React.cloneElement(icon, { size: IconSize.Small })}
    pressed={pressed}
    onClick={onClick}
    aria-label={label}
    // Every button keeps the caption row (empty when there is no count), so
    // all six icons sit on one line.
    className="!h-12 !w-10 !justify-start !rounded-12 !px-0 pt-1.5"
  >
    <span className="h-4 font-medium tabular-nums typo-caption2">
      {count ? compactCount(count) : ''}
    </span>
  </Button>
);

export const StackedBar = (): ReactElement => {
  const a = useDemoActions();
  return (
    <div className="flex justify-between px-1.5 pb-1">
      {SIX.map((k) => (
        <Stacked key={k} {...action(k, a)} />
      ))}
    </div>
  );
};

export const StatsLineBar = (): ReactElement => {
  const a = useDemoActions();
  return (
    <>
      <div className="mx-3 mt-1 flex items-center gap-2 text-text-tertiary tabular-nums typo-footnote">
        <span>
          {compactCount(a.upvotes)} upvotes · {compactCount(a.comments)}{' '}
          comments
        </span>
        <button
          type="button"
          aria-label="Impressions"
          onClick={a.noop}
          className="-mr-1 ml-auto flex min-h-6 items-center gap-1 rounded-6 px-1 hover:text-accent-cheese-default"
        >
          <AnalyticsIcon size={IconSize.Size16} />
          {compactCount(a.impressions)}
        </button>
      </div>
      <div className="flex items-center justify-between px-1 pb-0.5">
        {(['upvote', 'comment', 'downvote', 'bookmark', 'copy'] as Kind[]).map(
          (k) => (
            <Act key={k} tier={40} {...action(k, a, { bare: true })} />
          ),
        )}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------------ */
/* Auto-sized six: the biggest tier that fits the card it is in.             */
/* ------------------------------------------------------------------------ */

/**
 * Renders all six actions at the largest tier whose row fits, stepping down
 * one tier per layout pass until nothing overflows. In production this would
 * be a container query; here it is measured so the result is a reading.
 */
export const AutoSixBar = ({
  padding = 'px-1',
}: {
  padding?: string;
}): ReactElement => {
  const width = useCardWidth();
  const report = useTierReport();
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useLayoutEffect(() => setIndex(0), [width]);
  useLayoutEffect(() => {
    const row = ref.current;
    if (row && row.scrollWidth > row.clientWidth && index < TIERS.length - 1) {
      setIndex(index + 1);
    }
  });
  useEffect(() => {
    report?.(TIERS[index]);
  }, [index, report]);

  return (
    <div ref={ref} className={classNames('flex py-0.5', padding)}>
      <Row kinds={SIX} tier={TIERS[index]} className="min-w-0 flex-1" />
    </div>
  );
};

export const AdaptiveBar = (): ReactElement => <AutoSixBar />;

/** The feed variants also drop the bar's side padding to 2px. */
export const FeedBar = (): ReactElement => <AutoSixBar padding="px-0.5" />;

/* ------------------------------------------------------------------------ */
/* Catalogue                                                                 */
/* ------------------------------------------------------------------------ */

export type Lever =
  | 'Size'
  | 'Remove'
  | 'Group'
  | 'Hierarchy'
  | 'Layout'
  | 'Feed spacing';

export interface Feed {
  /** Space between cards. Today: 32px. */
  gap: number;
  /** Feed side padding. Today: 24px (`laptop:px-6`). */
  side: number;
  /** Below this, a column is dropped. Today: 272px. */
  minCard: number;
}

export const TODAY_FEED: Feed = { gap: 32, side: 24, minCard: 272 };

export interface Variant {
  id: string;
  number: number;
  name: string;
  lever: Lever;
  pitch: string;
  changes: string[];
  tradeoffs: string[];
  Bar: () => ReactElement;
  imageClassName?: string;
  /** Feed variants change the whole grid; the bar sizes itself to fit. */
  feed?: Feed;
}

export const TODAY: Variant = {
  id: 'today',
  number: 0,
  name: 'Today (production)',
  lever: 'Size',
  pitch:
    'The bar as it ships: six actions squeezed to 24px buttons with 16px icons so they fit the 272px narrowest card.',
  changes: [],
  tradeoffs: [
    '24×24 is the WCAG 2.2 AA minimum target size: it passes, with no margin.',
  ],
  Bar: TodayBar,
};

export const VARIANTS: Variant[] = [
  {
    id: 'size-up',
    number: 1,
    name: 'Same six, one size up',
    lever: 'Size',
    pitch:
      'Nothing moves. Every button grows 24 → 28px and every icon 16 → 20px, the icon size from before August.',
    changes: [
      'Buttons 24px → 28px; icons 16px → 20px (+25%).',
      'Counts follow the new number rule (234K, not 234.5K).',
    ],
    tradeoffs: ['The smallest change and the safest test.'],
    Bar: SizeUpBar,
  },
  {
    id: 'five',
    number: 2,
    name: 'Five actions, back at 32px',
    lever: 'Remove',
    pitch:
      'Copy link leaves the bar (it stays in the card’s ⋯ menu under Share). The five that remain go back to 32px with 20px icons.',
    changes: ['Copy link → ⋯ menu.', 'Buttons 24px → 32px; icons 16px → 20px.'],
    tradeoffs: [
      'One more click to copy a link from the feed; check copy-link share volume before testing.',
    ],
    Bar: FiveBar,
  },
  {
    id: 'vote-pill',
    number: 3,
    name: 'Vote pill',
    lever: 'Group',
    pitch:
      'Upvote and downvote join into one filled pill (the Reddit pattern), so voting reads as one large control instead of two small ones.',
    changes: [
      'Vote pill: 36px tall, 24px icons, filled surface.',
      'Comment, bookmark, impressions at 32px with 20px icons.',
      'Copy link → ⋯ menu.',
    ],
    tradeoffs: [
      'Makes voting the hero of the card; downvote gets more visible, which may lift downvotes.',
    ],
    Bar: VotePillBar,
  },
  {
    id: 'primary-pair',
    number: 4,
    name: 'Primary pair',
    lever: 'Hierarchy',
    pitch:
      'Upvote and comment become filled 36px pills with 24px icons; the secondary actions stay compact on the right. Size follows importance.',
    changes: [
      'Upvote + comment: 36px filled pills, 24px icons.',
      'Downvote, bookmark, impressions: 28px, 20px icons, grouped right.',
      'Copy link → ⋯ menu.',
    ],
    tradeoffs: [
      'Clear hierarchy; bookmark gets slightly quieter.',
      'Filled pills add visual weight to every card in the grid.',
    ],
    Bar: PrimaryPairBar,
  },
  {
    id: 'edge-strip',
    number: 5,
    name: 'Edge-to-edge strip',
    lever: 'Layout',
    pitch:
      'The bar becomes the card’s footer: a hairline on top and six cells that share the full width. The gaps between buttons become target area.',
    changes: [
      'All six actions kept.',
      'Every target 40px tall and as wide as its share of the card.',
      'Icons 16px → 20px. Corner cells follow the card’s radius.',
    ],
    tradeoffs: [
      'Biggest hit areas while keeping all six.',
      'The hairline adds a divider to every card; the LinkedIn / X feed look.',
    ],
    Bar: EdgeStripBar,
  },
  {
    id: 'stacked',
    number: 6,
    name: 'Stacked counts',
    lever: 'Layout',
    pitch:
      'Counts go under their icons instead of beside them, so width stops being the limit: six 40×48 targets with 24px icons fit the narrowest card.',
    changes: [
      'Icons 16px → 24px (+50%); targets 40×48px.',
      'Cover image 160px → 144px so the card keeps its height.',
    ],
    tradeoffs: [
      'The biggest icons that keep all six actions.',
      'A new pattern for daily.dev cards; the counts are smaller text.',
    ],
    Bar: StackedBar,
    imageClassName: '!h-36',
  },
  {
    id: 'stats-line',
    number: 7,
    name: 'Stats line + icon row',
    lever: 'Layout',
    pitch:
      'Counts move to a quiet line above the bar (upvotes · comments, impressions on the right). The buttons are then icon-only and can be the full 40px with 24px icons.',
    changes: [
      'Five 40px icon buttons, 24px icons.',
      'Impressions stays visible and clickable, in the stats line.',
      'Cover image 160px → 144px to pay for the extra line.',
    ],
    tradeoffs: [
      'Impressions moves out of the action bar — the spot that just won its test. Worth a check that position was not part of the win.',
      'Counts sit apart from the buttons they belong to (the LinkedIn / Facebook pattern).',
    ],
    Bar: StatsLineBar,
    imageClassName: '!h-36',
  },
  {
    id: 'adaptive',
    number: 8,
    name: 'Size follows the card',
    lever: 'Size',
    pitch:
      'All six, always. The bar picks the biggest button size that fits the card it is in: 28px on the narrowest cards, up to 40px on wide ones.',
    changes: [
      'Ladder 28 → 32 → 36 → 40px; icons 20 → 24px.',
      'A container query in production; measured here.',
    ],
    tradeoffs: [
      'Most users get bigger than 28px, because most cards are wider than the minimum.',
      'The same card looks slightly different between layouts.',
    ],
    Bar: AdaptiveBar,
  },
  {
    id: 'feed-gap',
    number: 9,
    name: 'Tighter feed gap',
    lever: 'Feed spacing',
    pitch:
      'The space between cards goes 32 → 20px. On the narrowest feed every card gains 8px — exactly what six actions need to go back to 32px.',
    changes: [
      'Feed gap 32px → 20px.',
      'Bar side padding 4px → 2px.',
      'All six actions at 32px, 20px icons.',
    ],
    tradeoffs: [
      'Gap 24px also fits six 32px buttons, with zero pixels to spare; 20px leaves room for font and count differences.',
    ],
    Bar: FeedBar,
    feed: { gap: 20, side: 24, minCard: 272 },
  },
  {
    id: 'feed-margins',
    number: 10,
    name: 'Tighter gap and margins',
    lever: 'Feed spacing',
    pitch:
      'Gap 32 → 16px and the feed’s side margins 24 → 16px. Cards gain 16px: 32px buttons with room to spare, so no count can push the bar out.',
    changes: [
      'Feed gap 32px → 16px.',
      'Feed side padding 24px → 16px.',
      'All six actions at 32px, 20px icons, ~10px spare.',
    ],
    tradeoffs: [
      'A denser grid; the sidebar and the first card sit closer together.',
    ],
    Bar: FeedBar,
    feed: { gap: 16, side: 16, minCard: 272 },
  },
  {
    id: 'feed-ladder',
    number: 11,
    name: 'Spacing ladder',
    lever: 'Feed spacing',
    pitch:
      'What each step of spacing buys, measured: five gap/margin settings, each at the narrowest 3-column feed and at a typical laptop feed, with the button size the cards can then carry.',
    changes: [
      'Not one design — the map for choosing 9 or 10, or a step in between.',
    ],
    tradeoffs: [
      'Spacing alone tops out at 32px on the narrowest feed: 36px needs ~313px cards, which no gap can reach with three columns there.',
    ],
    Bar: FeedBar,
    feed: { gap: 12, side: 8, minCard: 272 },
  },
  {
    id: 'feed-min-card',
    number: 12,
    name: 'Wider minimum card',
    lever: 'Feed spacing',
    pitch:
      'Keep today’s spacing but never let a card go below 328px: when the feed is too narrow for that, drop a column. Every card then carries 40px buttons with 24px icons.',
    changes: [
      'Minimum card width 272px → 328px.',
      'At the narrowest 3-column width the feed shows 2 columns.',
      'All six actions at 40px, 24px icons.',
    ],
    tradeoffs: [
      'Fewer cards per row at some widths — fewer impressions and ad slots per screen. Needs an A/B test.',
    ],
    Bar: FeedBar,
    feed: { gap: 32, side: 24, minCard: 328 },
  },
];
