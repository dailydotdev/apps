import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { FeedCardGlassActions } from '@dailydotdev/shared/src/components/cards/common/FeedCardGlassActions';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';
import ExtensionProviders from '../../extension/_providers';
import type { Rgb } from './glassContrast';
import {
  ICON_THRESHOLD,
  TEXT_THRESHOLD,
  composite,
  contrastRatio,
  parseHex,
} from './glassContrast';

/**
 * Follow-up to "Glass Actions Theme Compare": that page fixed the REST and
 * PRESSED states of the feed card floating action bar. This one is about the
 * state in between — HOVER — which the same change quietly redefined.
 *
 * WHAT SHIPPED: `styles/components/feedCardGlassActions.css` pins
 * `--button-hover-color` to the very same value as `--button-pressed-color`,
 * for every action. That was done so a held pointer couldn't dip below 3:1, and
 * on that count it works. Two side effects came with it:
 *
 *   1. HOVER DIMS INSTEAD OF LIFTING. The whole button — icon AND the
 *      `InteractionCounter` next to it — leaves `text-primary` for the accent.
 *      The accent is always lower-contrast than `text-primary`, so the one
 *      action the pointer is on becomes the LEAST legible thing in the bar:
 *      14.44 -> 8.54 in dark, 18.75 -> 3.03 in light (worst cover). The
 *      counters are text, so they answer to SC 1.4.3's 4.5:1, not 3:1 — in
 *      light mode every hovered counter is now under it.
 *   2. HOVER AND PRESSED ARE THE SAME PIXEL. Hovering an already-upvoted
 *      button produces no change at all, and hover no longer previews anything
 *      the press hasn't already shown.
 *
 * The only thing that separated hover from rest was `--button-hover-background`,
 * which the design system sets to the accent at 12% — barely a shade on a
 * 90%-opaque bar, and it doesn't cover the counter.
 *
 * WHAT SHIPPED IN RESPONSE (`--glass-actions-hover-tone`): hover is toned per
 * theme, and the accent moved into the surface.
 *
 *   Dark  — content keeps the accent, exactly as before (5.34–11.16, bright
 *           enough on a near-black bar that it still reads as a lift).
 *   Light — content goes to `text-primary` (15.03). The light accents are mixed
 *           down to 3.01–3.08 because a bright brand hue cannot clear 3:1 on a
 *           near-white bar — avocado lands on #039750, cheese on an olive
 *           #94821F. Fine as a deliberate "this is on"; poor as a hover.
 *   Both  — the accent sits at 22% behind the button instead of 12%, and active
 *           deepens to 32%. Icon and counter always share one colour.
 *
 * The pressed state is untouched. One guard was needed: `buttons.css` resolves
 * hover AFTER `aria-pressed` at equal specificity, so light's neutral hover
 * would otherwise blank the "this is on" accent while the pointer sat on an
 * upvoted action.
 *
 * "Before" is SIMULATED here, restored by the scoped CSS below; "after (live)"
 * is the real component with no overrides, so this page keeps telling the truth
 * as the component changes.
 *
 * The page renders in DARK and inverts for the light columns, rather than the
 * other way round. That is deliberate: inside `html.light`, `.invert` gives
 * `tailwind/buttons.ts`'s `.light .invert .btn-tertiary-*` (0,3,0) which
 * outranks the pill's own `[&_.btn]:[--button-default-color:…]` utility
 * (0,2,0), so simulated-dark panels show rest icons at `text-secondary`
 * instead of `text-primary`. Inverting the other way ties on specificity and
 * the utility wins, which is what production actually does.
 */

const mockSource = {
  id: 'tds',
  handle: 'tds',
  name: 'Towards Data Science',
  permalink: 'https://app.daily.dev/sources/tds',
  image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
  type: 'machine' as const,
  active: true,
};

const mockAuthor = {
  id: 'author-1',
  name: 'John Developer',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/avatars/default',
  permalink: 'https://app.daily.dev/johndeveloper',
  username: 'johndeveloper',
  bio: 'Full-stack developer',
};

const cover = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">' +
    '<rect width="640" height="360" fill="#8fa3c0"/>' +
    '<circle cx="140" cy="260" r="120" fill="#f2d9a4"/>' +
    '<circle cx="430" cy="120" r="160" fill="#5f7392"/>' +
    '<rect x="300" y="220" width="340" height="140" fill="#d9e2f0"/>' +
    '</svg>',
)}`;

const basePost = {
  numUpvotes: 13,
  numComments: 12,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  tags: ['javascript', 'react', 'typescript'],
  source: mockSource,
  author: mockAuthor,
  readTime: 8,
  createdAt: '2024-01-15T10:30:00.000Z',
  permalink: 'https://api.daily.dev/r/article-1',
  commentsPermalink: 'https://daily.dev/posts/article-1',
  image: cover,
  type: PostType.Article,
  analytics: { impressions: 90210 },
  userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
};

const make = (overrides: Record<string, unknown>): Post =>
  ({ ...basePost, ...overrides } as unknown as Post);

const restPost = make({ id: 'hover-rest', title: 'Nothing toggled on' });
const pressedPost = make({
  id: 'hover-pressed',
  title: 'Upvoted and bookmarked',
  userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
  upvoted: true,
  bookmarked: true,
});

const actionHandlers = {
  onPostClick: fn(),
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
  onShare: fn(),
  onReadArticleClick: fn(),
};

// One entry per action in the bar. `selector` targets the rendered button —
// the ids come from `FeedCardGlassActions` and are stable except for copy link,
// which is the one button with a fixed id. `tint` is the action's accent, read
// off the per-theme variables the shipped CSS already puts on the pill — so the
// before-columns restore the old hover colour without a hex table of their own.
const actions: {
  key: string;
  name: string;
  selector: string;
  btnClass: string;
  tint: string;
  /** Has an InteractionCounter next to the icon — i.e. text, not just an icon. */
  counter: boolean;
}[] = [
  {
    key: 'upvote',
    name: 'Upvote',
    selector: "[id$='-upvote-btn']",
    btnClass: 'btn-tertiary-avocado',
    tint: 'var(--glass-actions-upvote)',
    counter: true,
  },
  {
    key: 'comment',
    name: 'Comment',
    selector: "[id$='-comment-btn']",
    btnClass: 'btn-tertiary-blueCheese',
    tint: 'var(--glass-actions-comment)',
    counter: true,
  },
  {
    key: 'downvote',
    name: 'Downvote',
    selector: "[id$='-downvote-btn']",
    btnClass: 'btn-tertiary-ketchup',
    tint: 'var(--glass-actions-downvote)',
    counter: false,
  },
  {
    key: 'bookmark',
    name: 'Bookmark',
    selector: "[id$='-bookmark-btn']",
    btnClass: 'btn-tertiary-bun',
    tint: 'var(--glass-actions-bookmark)',
    counter: false,
  },
  {
    key: 'copy',
    name: 'Copy link',
    selector: '#copy-post-btn',
    btnClass: 'btn-tertiary-cabbage',
    tint: 'var(--glass-actions-copy)',
    counter: false,
  },
  {
    key: 'impressions',
    name: 'Impressions',
    selector: "[id$='-impressions-btn']",
    btnClass: 'btn-tertiary-cheese',
    tint: 'var(--glass-actions-impressions)',
    counter: true,
  },
];

// A screenshot can't hold a pointer, so hover is forced with the same four
// variable assignments `buttons.css` makes for `:hover` / `.hover`, scoped by a
// `data-fh` attribute. Nothing is faked: the VALUES still come from whichever
// treatment the column is in.
const forcedHoverCss = actions
  .map(
    ({ key, selector }) => `
  [data-fh='${key}'] ${selector} {
    --button-background: var(--button-hover-background);
    --button-border-color: var(--button-hover-border-color);
    --button-color: var(--button-hover-color);
  }
  [data-fh='${key}'] ${selector} ~ label {
    color: var(--button-hover-color);
  }`,
  )
  .join('\n');

// The "before" columns are SIMULATED, because the fix has landed: the shipped
// CSS now tones hover per theme and puts the accent at 22% behind the button.
// These blocks put hover back where it was — pinned to the pressed colour, over
// the design system's own 12% tint. `--glass-actions-*` IS the pressed value, so
// the restore needs no per-theme hex table of its own.
//
// The shipped mapping is `html .feed-card-glass-actions.feed-card-glass-actions
// .btn-tertiary-*` — (0,3,1). Four classes beat three classes + an element, so
// the scope class alone is enough to win, with no reliance on source order.
// The shipped pressed guard needs no undoing here: when hover and pressed are
// the same value, deferring to pressed changes nothing.
const beforeCss = actions
  .map(
    ({ btnClass, tint }) => `
  .glass-hover-before .feed-card-glass-actions.feed-card-glass-actions .${btnClass} {
    --button-hover-color: ${tint};
    --button-active-color: ${tint};
    --button-hover-background: color-mix(in srgb, ${tint} 12%, transparent);
    --button-active-background: color-mix(in srgb, ${tint} 20%, transparent);
  }`,
  )
  .join('\n');

const columns: { title: string; note: string; className?: string }[] = [
  {
    title: 'Dark — before',
    note: 'hover = pressed colour, 12% tint',
    className: 'glass-hover-before',
  },
  {
    title: 'Dark — after (live)',
    note: 'accent kept, 22% surface',
  },
  {
    title: 'Light — before',
    note: 'hover = pressed colour, 12% tint',
    className: 'invert glass-hover-before',
  },
  {
    title: 'Light — after (live)',
    note: 'text-primary + 22% accent surface',
    className: 'invert',
  },
];

// Fixed 19rem columns rather than fractions: a real grid card is ~320px, and
// squeezing the bar narrower than that clips the impressions counter, which is
// exactly the element under review. The section scrolls sideways instead.
const gridStyle = (labelWidth: string): React.CSSProperties => ({
  gridTemplateColumns: `${labelWidth} repeat(${columns.length}, 19rem)`,
});

const Tile = ({
  forceHover,
  post = restPost,
}: {
  forceHover?: string;
  post?: Post;
}): ReactElement => (
  <div
    data-fh={forceHover}
    className="relative h-14 overflow-hidden rounded-16"
    style={{ background: 'linear-gradient(135deg, #8fa3c0, #d9e2f0)' }}
  >
    <FeedCardGlassActions post={post} {...actionHandlers} />
  </div>
);

const ColumnHeaders = (): ReactElement => (
  <>
    <span aria-hidden />
    {columns.map(({ title, note }) => (
      <span key={title} className="text-center">
        <span className="block font-bold text-text-secondary typo-footnote">
          {title}
        </span>
        <span className="block text-text-quaternary typo-caption1">{note}</span>
      </span>
    ))}
  </>
);

const Section = ({
  title,
  children,
  description,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}): ReactElement => (
  <div className="mb-10 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
    <h3 className="font-bold text-text-primary typo-title3">{title}</h3>
    <p className="mb-6 mt-1 max-w-4xl text-text-tertiary typo-footnote">
      {description}
    </p>
    {children}
  </div>
);

const HoverMatrix = (): ReactElement => (
  <Section
    title="Every action, hovered"
    description="One row per action, with that action's hover state forced so all six can be read at once. Compare a row across the columns; the un-hovered siblings in the same pill are the control — in the before columns the hovered action is the dimmest thing in the bar, which is backwards."
  >
    <div
      className="grid items-center gap-x-4 gap-y-3 overflow-x-auto"
      style={gridStyle('9rem')}
    >
      <ColumnHeaders />
      {actions.map(({ key, name, counter }) => (
        <React.Fragment key={key}>
          <span className="text-text-tertiary typo-footnote">
            {name}
            {counter && (
              <span className="block text-text-quaternary typo-caption1">
                has a counter
              </span>
            )}
          </span>
          {columns.map(({ title, className }) => (
            <div key={`${key}-${title}`} className={className}>
              <Tile forceHover={key} />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  </Section>
);

const stateRows: { name: string; post: Post; forceHover?: string }[] = [
  { name: 'Rest', post: restPost },
  { name: 'Hover (upvote)', post: restPost, forceHover: 'upvote' },
  { name: 'Pressed — upvoted + bookmarked', post: pressedPost },
  {
    name: 'Hover on an already-upvoted action',
    post: pressedPost,
    forceHover: 'upvote',
  },
];

const StatesStrip = (): ReactElement => (
  <Section
    title="Rest → hover → pressed"
    description="The last two rows are the same pill: one pressed, one pressed AND hovered. In the before columns they are pixel-identical, because hover was pinned to the pressed value — there is no feedback for pointing at something you have already upvoted. After, the surface marks it while the accent stays put."
  >
    <div
      className="grid items-center gap-x-4 gap-y-3 overflow-x-auto"
      style={gridStyle('14rem')}
    >
      <ColumnHeaders />
      {stateRows.map(({ name, post, forceHover }) => (
        <React.Fragment key={name}>
          <span className="text-text-tertiary typo-footnote">{name}</span>
          {columns.map(({ title, className }) => (
            <div key={`${name}-${title}`} className={className}>
              <Tile post={post} forceHover={forceHover} />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  </Section>
);

// --- Measured -----------------------------------------------------------------
// Same method as the theme-compare page: composite the 90% fill over the cover,
// then measure. The pill's inline 8% black tint is gone in both themes now, so
// the fill is the whole backdrop.
const auditCovers: { name: string; color: Rgb }[] = [
  { name: 'White', color: parseHex('#ffffff') },
  { name: 'Black', color: parseHex('#04060a') },
  { name: 'Mid gray', color: parseHex('#8fa3c0') },
  { name: 'Yellow', color: parseHex('#ffe24c') },
];

const themes: {
  name: string;
  fill: string;
  rest: string;
  /** Hover colour per action BEFORE — pinned to the pressed accent. */
  before: Record<string, string>;
  /**
   * Hover colour AFTER. Dark keeps the accent, so its numbers are unchanged and
   * this is null; light drops to text-primary, which is the `rest` colour.
   */
  afterIsRest: boolean;
}[] = [
  {
    name: 'Dark',
    fill: '#0f1218',
    rest: '#ffffff',
    afterIsRest: false,
    before: {
      Upvote: '#57e087',
      Comment: '#29d8e5',
      Downvote: '#f57869',
      Bookmark: '#ffab81',
      'Copy link': '#ba56e1',
      Impressions: '#ffe24c',
    },
  },
  {
    name: 'Light',
    fill: '#ffffff',
    rest: '#0f1218',
    afterIsRest: true,
    before: {
      Upvote: '#039750',
      Comment: '#01929c',
      Downvote: '#c83a2f',
      Bookmark: '#d55e00',
      'Copy link': '#a641cc',
      Impressions: '#94821f',
    },
  },
];

const FILL_ALPHA = 0.9;
const hasCounter = (name: string) =>
  actions.find((action) => action.name === name)?.counter ?? false;

const Ratio = ({
  value,
  threshold,
}: {
  value: number;
  threshold: number;
}): ReactElement => (
  <td
    className={classNames(
      'p-2 text-center tabular-nums',
      value >= threshold
        ? 'text-text-tertiary'
        : 'bg-surface-float font-bold text-status-error',
    )}
  >
    {value.toFixed(2)}
  </td>
);

const ContrastAudit = (): ReactElement => (
  <Section
    title="Measured — what hover costs"
    description="Worst ratio across the four covers, hovered content vs. the composited bar. Icons answer to SC 1.4.11 (3:1); the counters next to Upvote, Comment and Impressions are TEXT, so they answer to SC 1.4.3 (4.5:1) — that is the threshold light mode was missing. Dark rows are unchanged by design: the accent there is bright enough to read as a lift, so only the surface behind it moved. Light rows collapse onto the Rest number, because hover now leaves the content on text-primary."
  >
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left typo-footnote">
        <thead>
          <tr className="text-text-secondary">
            <th className="p-2 font-bold">Theme</th>
            <th className="p-2 font-bold">Action</th>
            <th className="p-2 text-center font-bold">Rest (needs 3 / 4.5)</th>
            <th className="p-2 text-center font-bold">
              Hover icon — before (needs 3)
            </th>
            <th className="p-2 text-center font-bold">
              Hover icon — after (needs 3)
            </th>
            <th className="p-2 text-center font-bold">
              Hover counter — before (needs 4.5)
            </th>
            <th className="p-2 text-center font-bold">
              Hover counter — after (needs 4.5)
            </th>
          </tr>
        </thead>
        <tbody>
          {themes.map(
            ({ name: themeName, fill, rest, before, afterIsRest }) => {
              const worst = (color: string) =>
                Math.min(
                  ...auditCovers.map(({ color: coverColor }) =>
                    contrastRatio(
                      parseHex(color),
                      composite(parseHex(fill), FILL_ALPHA, coverColor),
                    ),
                  ),
                );
              const restRatio = worst(rest);

              return Object.entries(before).map(([action, color], index) => {
                const beforeRatio = worst(color);
                const afterRatio = afterIsRest ? restRatio : beforeRatio;

                return (
                  <tr
                    key={`${themeName}-${action}`}
                    className="border-t border-border-subtlest-quaternary"
                  >
                    <td className="p-2 text-text-tertiary">
                      {index === 0 ? themeName : ''}
                    </td>
                    <td className="p-2 text-text-primary">{action}</td>
                    <Ratio value={restRatio} threshold={TEXT_THRESHOLD} />
                    <Ratio value={beforeRatio} threshold={ICON_THRESHOLD} />
                    <Ratio value={afterRatio} threshold={ICON_THRESHOLD} />
                    {hasCounter(action) ? (
                      <>
                        <Ratio value={beforeRatio} threshold={TEXT_THRESHOLD} />
                        <Ratio value={afterRatio} threshold={TEXT_THRESHOLD} />
                      </>
                    ) : (
                      <>
                        <td className="p-2 text-center text-text-quaternary">
                          —
                        </td>
                        <td className="p-2 text-center text-text-quaternary">
                          —
                        </td>
                      </>
                    )}
                  </tr>
                );
              });
            },
          )}
        </tbody>
      </table>
    </div>
  </Section>
);

const LiveCards = (): ReactElement => (
  <Section
    title="Hover them yourself"
    description="Real cards, no forced states — point at the actions and watch what happens to the counters."
  >
    <div
      className="grid gap-6 overflow-x-auto"
      style={{ gridTemplateColumns: `repeat(${columns.length}, 20rem)` }}
    >
      {columns.map(({ title, className }) => (
        <div key={title} className={className}>
          <div className="rounded-16 bg-background-default p-3">
            <span className="mb-3 block text-center font-bold text-text-secondary typo-footnote">
              {title}
            </span>
            <ArticleGrid post={restPost} {...actionHandlers} />
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const GlassActionsHoverStates = (): ReactElement => (
  <ExtensionProviders>
    <FeatureOverrides
      values={{ feed_card_glass_actions: true, card_impressions: true }}
    >
      <style>{forcedHoverCss}</style>
      <style>{beforeCss}</style>
      <div className="min-h-screen bg-background-subtle p-8">
        <h2 className="mb-2 text-2xl font-bold text-text-primary">
          Glass action bar — hover states
        </h2>
        <p className="mb-8 max-w-4xl text-sm text-text-tertiary">
          The accessibility fix pinned <code>--button-hover-color</code> to the
          same value as <code>--button-pressed-color</code>. Every icon cleared
          3:1, so it was never a regression against the original bug — but the
          accent is always darker than <code>text-primary</code>, so{' '}
          <strong>
            the action under the pointer became the dimmest one in the bar
          </strong>
          , and the counter beside it fell below the 4.5:1 that text needs in
          light mode. Hover is now toned per theme:{' '}
          <strong>dark keeps its accent</strong> (bright enough that it still
          reads as a lift) and <strong>light goes to text-primary</strong>, with
          the accent moved into a 22% wash behind the button in both. Icon and
          counter always share one colour. The pressed state is untouched. The{' '}
          <strong>after</strong> columns render the live component with no
          overrides; the <strong>before</strong> columns restore the old values
          via scoped CSS.
        </p>
        <HoverMatrix />
        <StatesStrip />
        <ContrastAudit />
        <LiveCards />
      </div>
    </FeatureOverrides>
  </ExtensionProviders>
);

const meta: Meta = {
  title: 'Components/Cards/Glass Actions Hover States',
  component: GlassActionsHoverStates,
  parameters: {
    layout: 'fullscreen',
    // Dark page + `.invert` for the light columns. The other way round hits the
    // `.light .invert .btn-tertiary-*` specificity clash described at the top.
    themes: { themeOverride: 'dark' },
  },
};

export default meta;

type Story = StoryObj;

export const HoverStates: Story = {
  render: () => <GlassActionsHoverStates />,
  name: 'Hover before/after',
};
