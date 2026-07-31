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
  readColorVar,
} from './glassContrast';

/**
 * Hover states for the feed card floating action bar, before and after the
 * per-theme toning in `styles/components/feedCardGlassActions.css`. Companion to
 * "Glass Actions Theme Compare", which covers rest and pressed.
 *
 * "After" columns render the live component with no overrides, so the page stays
 * honest as the component changes; "before" is restored by the scoped CSS below.
 *
 * The page renders DARK and inverts for the light columns, never the reverse:
 * inside `html.light`, `.invert` matches `tailwind/buttons.ts`'s
 * `.light .invert .btn-tertiary-*` (0,3,0), which outranks the pill's own
 * `[&_.btn]:[--button-default-color:…]` utility (0,2,0) and would show rest icons
 * at `text-secondary` — something production never does.
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

// `accentVar` names the per-theme variable the shipped CSS puts on the pill, so
// both the before-columns and the audit read live values rather than hexes.
const actions: {
  key: string;
  name: string;
  selector: string;
  btnClass: string;
  accentVar: string;
  /** Only where the accent itself moved, so "before" keeps quoting main. */
  beforeAccentVar?: string;
  /** Has an InteractionCounter next to the icon — i.e. text, not just an icon. */
  counter: boolean;
}[] = [
  {
    key: 'upvote',
    name: 'Upvote',
    selector: "[id$='-upvote-btn']",
    btnClass: 'btn-tertiary-avocado',
    accentVar: '--glass-actions-upvote',
    counter: true,
  },
  {
    key: 'comment',
    name: 'Comment',
    selector: "[id$='-comment-btn']",
    btnClass: 'btn-tertiary-blueCheese',
    accentVar: '--glass-actions-comment',
    counter: true,
  },
  {
    key: 'downvote',
    name: 'Downvote',
    selector: "[id$='-downvote-btn']",
    btnClass: 'btn-tertiary-ketchup',
    accentVar: '--glass-actions-downvote',
    counter: false,
  },
  {
    key: 'bookmark',
    name: 'Bookmark',
    selector: "[id$='-bookmark-btn']",
    btnClass: 'btn-tertiary-bun',
    accentVar: '--glass-actions-bookmark',
    counter: false,
  },
  {
    key: 'copy',
    name: 'Copy link',
    selector: "[id$='-copy-btn']",
    btnClass: 'btn-tertiary-cabbage',
    accentVar: '--glass-actions-copy',
    beforeAccentVar: '--theme-accent-cabbage-default',
    counter: false,
  },
  {
    key: 'impressions',
    name: 'Impressions',
    selector: "[id$='-impressions-btn']",
    btnClass: 'btn-tertiary-cheese',
    accentVar: '--glass-actions-impressions',
    counter: true,
  },
];

// A screenshot can't hold a pointer, so hover is forced with the same variable
// assignments `buttons.css` makes for `:hover`. The values still come from
// whichever treatment the column is in.
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

// Restores hover to the pressed colour over the design system's 12% tint. Four
// classes outrank the shipped mapping's three-classes-plus-element (0,3,1), so
// the scope class alone wins without relying on source order.
const beforeCss = actions
  .map(({ btnClass, accentVar, beforeAccentVar = accentVar }) => {
    const tint = `var(${beforeAccentVar})`;
    return `
  .glass-hover-before .feed-card-glass-actions.feed-card-glass-actions .${btnClass} {
    --button-hover-color: ${tint};
    --button-active-color: ${tint};
    --button-hover-background: color-mix(in srgb, ${tint} 12%, transparent);
    --button-active-background: color-mix(in srgb, ${tint} 20%, transparent);
  }`;
  })
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

// Fixed columns, not fractions: a real grid card is ~320px, and anything
// narrower clips the impressions counter — the element under review.
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

// Hovered rows measure against the button's own chip rather than the bar: a
// filled hover surface is what sits adjacent to the glyph. It changes the answer
// in dark, where icon and chip share a hue.
const auditCovers: { name: string; color: Rgb }[] = [
  { name: 'White', color: parseHex('#ffffff') },
  { name: 'Black', color: parseHex('#04060a') },
  { name: 'Mid gray', color: parseHex('#8fa3c0') },
  { name: 'Yellow', color: parseHex('#ffe24c') },
];

const BEFORE_TINT = 0.12;
const AFTER_TINT = 0.22;
const FILL_ALPHA = 0.9;

// Same fallback the shipped mapping uses, so an unset tone reads as "this theme
// keeps the per-action accent" rather than having to be asserted here.
const TONE_UNSET = parseHex('#ff00ff');

type ThemeMeasurement = {
  name: string;
  fill: Rgb;
  rest: Rgb;
  before: Record<string, Rgb>;
  after: Record<string, Rgb>;
  hoverIsRest: boolean;
};

const isSame = (a: Rgb, b: Rgb) => a.r === b.r && a.g === b.g && a.b === b.b;

const measureTheme = (pill: Element, name: string): ThemeMeasurement => {
  const tone = readColorVar(pill, '--glass-actions-hover-tone', '#ff00ff');
  const accents = (which: 'before' | 'after') =>
    Object.fromEntries(
      actions.map((action) => [
        action.name,
        readColorVar(
          pill,
          which === 'before'
            ? action.beforeAccentVar ?? action.accentVar
            : action.accentVar,
        ),
      ]),
    );

  return {
    name,
    fill: readColorVar(pill, '--theme-background-default'),
    rest: readColorVar(pill, '--theme-text-primary'),
    before: accents('before'),
    after: accents('after'),
    hoverIsRest: !isSame(tone, TONE_UNSET),
  };
};

const useMeasuredThemes = (): {
  themes: ThemeMeasurement[];
  probes: ReactElement;
} => {
  const darkPill = React.useRef<HTMLDivElement>(null);
  const lightPill = React.useRef<HTMLDivElement>(null);
  const [themes, setThemes] = React.useState<ThemeMeasurement[]>([]);

  React.useEffect(() => {
    if (!darkPill.current || !lightPill.current) {
      return;
    }
    setThemes([
      measureTheme(darkPill.current, 'Dark'),
      measureTheme(lightPill.current, 'Light'),
    ]);
  }, []);

  const probes = (
    <div aria-hidden className="pointer-events-none absolute h-0 w-0 opacity-0">
      <div ref={darkPill} className="feed-card-glass-actions" />
      <div className="invert">
        <div ref={lightPill} className="feed-card-glass-actions" />
      </div>
    </div>
  );

  return { themes, probes };
};

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

const ContrastAudit = (): ReactElement => {
  const { themes, probes } = useMeasuredThemes();

  return (
    <Section
      title="Measured — what hover costs"
      description="Worst ratio across the four covers, with every colour read off a live pill rather than restated here. Rest is measured against the bar; the hovered columns are measured against the button's own tinted CHIP, which is what sits adjacent to the glyph once hover paints a surface — 12% before, 22% after. Icons answer to SC 1.4.11 (3:1); the counters next to Upvote, Comment and Impressions are TEXT, so they answer to SC 1.4.3 (4.5:1), the threshold light mode was missing. Dark keeps its accent, so its icons pay for the deeper chip — copy link moved cabbage.40 → .10 to stay above 3. Light puts text-primary on an accent chip, which gains contrast rather than losing it."
    >
      {probes}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left typo-footnote">
          <thead>
            <tr className="text-text-secondary">
              <th className="p-2 font-bold">Theme</th>
              <th className="p-2 font-bold">Action</th>
              <th className="p-2 text-center font-bold">
                Rest (needs 3 / 4.5)
              </th>
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
            {themes.map(({ name, fill, rest, before, after, hoverIsRest }) => {
              const worst = (color: Rgb, chip?: Rgb, tint = 0) =>
                Math.min(
                  ...auditCovers.map(({ color: coverColor }) => {
                    const bar = composite(fill, FILL_ALPHA, coverColor);
                    return contrastRatio(
                      color,
                      chip ? composite(chip, tint, bar) : bar,
                    );
                  }),
                );
              const restRatio = worst(rest);

              return actions.map(({ name: action, counter }, index) => {
                const beforeAccent = before[action];
                const afterAccent = after[action];
                const beforeRatio = worst(
                  beforeAccent,
                  beforeAccent,
                  BEFORE_TINT,
                );
                const afterRatio = worst(
                  hoverIsRest ? rest : afterAccent,
                  afterAccent,
                  AFTER_TINT,
                );

                return (
                  <tr
                    key={`${name}-${action}`}
                    className="border-t border-border-subtlest-quaternary"
                  >
                    <td className="p-2 text-text-tertiary">
                      {index === 0 ? name : ''}
                    </td>
                    <td className="p-2 text-text-primary">{action}</td>
                    <Ratio value={restRatio} threshold={TEXT_THRESHOLD} />
                    <Ratio value={beforeRatio} threshold={ICON_THRESHOLD} />
                    <Ratio value={afterRatio} threshold={ICON_THRESHOLD} />
                    {counter ? (
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
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
};

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
          counter always share one colour. Because that wash is a visible fill,
          the hovered ratios below are measured against <em>it</em> rather than
          the bar — which is why dark&apos;s copy link had to move up its ramp.
          The pressed state is untouched. The <strong>after</strong> columns
          render the live component with no overrides; the{' '}
          <strong>before</strong> columns restore the old values via scoped CSS.
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
    themes: { themeOverride: 'dark' },
  },
};

export default meta;

type Story = StoryObj;

export const HoverStates: Story = {
  render: () => <GlassActionsHoverStates />,
  name: 'Hover before/after',
};
