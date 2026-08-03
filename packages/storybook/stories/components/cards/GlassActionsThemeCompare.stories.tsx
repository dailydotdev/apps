import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
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
import { composite, contrastRatio, parseHex } from './glassContrast';

/**
 * Accessibility record for the feed card floating action bar
 * (`FeedCardGlassActions`) — the before/after and the measured ratios behind the
 * values that shipped.
 *
 * THE BUG: the bar floats over a post's cover image, and its fill was
 * `--theme-blur-blur-bg` at 64% — pepper.90 in dark mode, WHITE in light mode.
 * At 64% the cover composites through and sets the contrast, so one icon
 * measured anywhere from 1.0:1 to 11:1 depending on the image, and in light mode
 * over a bright cover the whole control dissolved (WCAG SC 1.4.11 wants >= 3:1
 * for icons and UI component boundaries).
 *
 * THE FIX (shipped — see `styles/components/feedCardGlassActions.css`):
 *   - Fill to 90% via `color-mix(var(--theme-background-default), transparent
 *     10%)`, which resolves per theme on its own: a dark bar in dark mode, a
 *     white one in light mode. The pill's inline 8% black tint is gone, which
 *     matters as much as the opacity — it lifts the light surface from ~#EAEAEA
 *     to near-white and so *raises* every dark accent's ratio.
 *   - Pressed accents re-toned per theme. They come from `--button-pressed-color`
 *     (a raw palette hex from `tailwind/buttons.ts`'s ghost ladder, light .80 /
 *     dark .40), not from a `--theme-*` token, so they had to be overridden
 *     explicitly. Light takes each ramp's darkest step; avocado, blueCheese and
 *     cheese are too luminous even at .90, so they take the smallest mix with
 *     pepper.90 that clears 3:1. Dark moves downvote and bookmark up the ramp.
 *
 * Columns: "before" is SIMULATED here (the fix has landed, so the old values are
 * restored by the scoped CSS below); "after (live)" is the real component with no
 * overrides, so this page keeps telling the truth as the component changes.
 * Panels force their own theme, so the Storybook theme toggle is irrelevant.
 *
 * Sections: cover-colour stress test, active/pressed states, the computed
 * contrast audit, then full cards.
 *
 * KNOWN REMAINING GAP: the pill's own OUTLINE. A near-white fill cannot carry the
 * component boundary on a light cover (fill vs a white cover is 1.00:1), and
 * `border-border-subtlest-tertiary` resolves to salt.90 @20% = 1.14:1 there. The
 * border was deliberately left at the default token to keep the familiar look;
 * full-strength pepper.10 would fix it (7.13 / 5.51 / 3.26 on white / yellow /
 * green). NB overriding `--theme-border-subtlest-primary` does NOT work — the
 * tertiary token re-dilutes it by 80%; the tertiary variable itself must be set.
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

// Deterministic worst case: a near-white cover (think screenshot of a docs
// page / light-mode IDE), inlined as SVG so the comparison never depends on a
// remote image.
const brightCover = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#ffffff"/>' +
    '<stop offset="1" stop-color="#eef1f7"/>' +
    '</linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#g)"/>' +
    '<circle cx="500" cy="90" r="150" fill="#f4f6fb"/>' +
    '<rect x="48" y="64" width="280" height="20" rx="10" fill="#dfe5f0"/>' +
    '<rect x="48" y="100" width="220" height="20" rx="10" fill="#e7ecf5"/>' +
    '<rect x="48" y="136" width="250" height="20" rx="10" fill="#eef1f7"/>' +
    '</svg>',
)}`;

// A busy mid-tone cover: photos with mixed luminance are where a translucent
// pill needs its own contrast the most.
const busyCover = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">' +
    '<rect width="640" height="360" fill="#8fa3c0"/>' +
    '<circle cx="140" cy="260" r="120" fill="#f2d9a4"/>' +
    '<circle cx="430" cy="120" r="160" fill="#5f7392"/>' +
    '<rect x="300" y="220" width="340" height="140" fill="#d9e2f0"/>' +
    '<circle cx="560" cy="300" r="70" fill="#c4772f"/>' +
    '</svg>',
)}`;

const basePost = {
  numUpvotes: 42,
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
  image: brightCover,
  type: PostType.Article,
  userState: {
    vote: UserVote.None,
    flags: { feedbackDismiss: false },
  },
};

const make = (overrides: Record<string, unknown>): Post =>
  ({ ...basePost, ...overrides } as unknown as Post);

const posts: Post[] = [
  make({
    id: 'compare-bright',
    title: 'Worst case: a near-white cover image right under the pill',
    numUpvotes: 1280,
    numComments: 342,
    analytics: { impressions: 90210 },
  }),
  make({
    id: 'compare-busy',
    title: 'Busy mixed-luminance cover — the everyday case',
    image: busyCover,
  }),
  make({
    id: 'compare-pressed',
    title: 'Pressed states: upvoted + bookmarked over the bright cover',
    userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
    upvoted: true,
    bookmarked: true,
    numUpvotes: 512,
    numComments: 7,
  }),
];

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

// The two "before" columns have to be SIMULATED now, because the fix has landed:
// `styles/components/feedCardGlassActions.css` ships the 90% per-theme fill and
// the re-toned pressed accents, and the component carries the
// `feed-card-glass-actions` class. So the "after" columns below use the real
// component with no overrides at all, and these blocks restore the OLD values
// for comparison.
//
// The old pressed accents came straight from `tailwind/buttons.ts` — the ghost
// ladder, light .80 / dark .40, with ketchup and cabbage falling in the
// `default` branch at .60. Each "before" scope is single-theme, so these need no
// theme selectors. The class is repeated three times purely for specificity: in
// this story the dark panels are `.invert` inside `html.light`, so the shipped
// rule qualifies as `html.light .invert .feed-card-glass-actions .btn-tertiary-*`
// — four classes plus an element. Two repeats lost to it; three win.
const OLD_FILL =
  'linear-gradient(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)), var(--theme-blur-blur-bg)';

const beforeDarkCss = `
  .glass-before-dark .feed-card-glass-actions {
    background: ${OLD_FILL};
  }
  .glass-before-dark.glass-before-dark.glass-before-dark .feed-card-glass-actions .btn-tertiary-avocado {
    --button-pressed-color: #57e087;
    --button-hover-color: #57e087;
  }
  .glass-before-dark.glass-before-dark.glass-before-dark .feed-card-glass-actions .btn-tertiary-blueCheese {
    --button-pressed-color: #29d8e5;
    --button-hover-color: #29d8e5;
  }
  .glass-before-dark.glass-before-dark.glass-before-dark .feed-card-glass-actions .btn-tertiary-bun {
    --button-pressed-color: #ff9157;
    --button-hover-color: #ff9157;
  }
  .glass-before-dark.glass-before-dark.glass-before-dark .feed-card-glass-actions .btn-tertiary-ketchup {
    --button-pressed-color: #dd5143;
    --button-hover-color: #dd5143;
  }
  .glass-before-dark.glass-before-dark.glass-before-dark .feed-card-glass-actions .btn-tertiary-cabbage {
    --button-pressed-color: #ba56e1;
    --button-hover-color: #ba56e1;
  }
  .glass-before-dark.glass-before-dark.glass-before-dark .feed-card-glass-actions .btn-tertiary-cheese {
    --button-pressed-color: #ffe24c;
    --button-hover-color: #ffe24c;
  }
`;

const beforeLightCss = `
  .glass-before-light .feed-card-glass-actions {
    background: ${OLD_FILL};
  }
  .glass-before-light.glass-before-light.glass-before-light .feed-card-glass-actions .btn-tertiary-avocado {
    --button-pressed-color: #00bc60;
    --button-hover-color: #00bc60;
  }
  .glass-before-light.glass-before-light.glass-before-light .feed-card-glass-actions .btn-tertiary-blueCheese {
    --button-pressed-color: #00abb6;
    --button-hover-color: #00abb6;
  }
  .glass-before-light.glass-before-light.glass-before-light .feed-card-glass-actions .btn-tertiary-bun {
    --button-pressed-color: #e16300;
    --button-hover-color: #e16300;
  }
  .glass-before-light.glass-before-light.glass-before-light .feed-card-glass-actions .btn-tertiary-ketchup {
    --button-pressed-color: #c83a2f;
    --button-hover-color: #c83a2f;
  }
  .glass-before-light.glass-before-light.glass-before-light .feed-card-glass-actions .btn-tertiary-cabbage {
    --button-pressed-color: #a641cc;
    --button-hover-color: #a641cc;
  }
  .glass-before-light.glass-before-light.glass-before-light .feed-card-glass-actions .btn-tertiary-cheese {
    --button-pressed-color: #eacc2a;
    --button-hover-color: #eacc2a;
  }
`;

// Cover-color stress test: the pill is a translucent overlay, so its contrast
// depends on the pixels UNDER it. One row per cover color, one column per
// treatment — CSS gradients instead of images so every luminance/hue case is
// deterministic and reviewable at a glance.
const coverSwatches: { name: string; background: string }[] = [
  {
    name: 'Near-white',
    background: 'linear-gradient(135deg, #ffffff, #eef1f7)',
  },
  {
    name: 'Light gray',
    background: 'linear-gradient(135deg, #e5e9f2, #cfd6e4)',
  },
  {
    name: 'Mid gray',
    background: 'linear-gradient(135deg, #9aa3b2, #7d8694)',
  },
  {
    name: 'Near-black',
    background: 'linear-gradient(135deg, #14171c, #04060a)',
  },
  {
    name: 'Yellow (cheese clash)',
    background: 'linear-gradient(135deg, #ffe24c, #f6d731)',
  },
  {
    name: 'Green (avocado clash)',
    background: 'linear-gradient(135deg, #57e087, #00b25b)',
  },
  {
    name: 'Red / orange',
    background: 'linear-gradient(135deg, #ff833d, #c83a2f)',
  },
  {
    name: 'Purple / blue',
    background: 'linear-gradient(135deg, #ba56e1, #2f66e0)',
  },
  {
    name: 'Split light / dark',
    background: 'linear-gradient(90deg, #ffffff 0 50%, #0f1218 50% 100%)',
  },
  {
    name: 'Busy photo-ish',
    background:
      'radial-gradient(circle at 20% 90%, #f2d9a4 0 28%, transparent 28%), radial-gradient(circle at 72% 20%, #5f7392 0 38%, transparent 38%), radial-gradient(circle at 90% 85%, #c4772f 0 18%, transparent 18%), linear-gradient(135deg, #8fa3c0, #d9e2f0)',
  },
];

// Fullest possible bar (all six actions incl. impressions) so every icon can
// be judged against the swatch.
const stressPost = posts[0];

const SwatchTile = ({
  background,
  post = stressPost,
  compact = false,
}: {
  background: string;
  post?: Post;
  compact?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'relative overflow-hidden rounded-16',
      compact ? 'h-14' : 'h-24',
    )}
    style={{ background }}
  >
    <FeedCardGlassActions post={post} {...actionHandlers} />
  </div>
);

const treatmentColumns: { title: string; className?: string }[] = [
  { title: 'Dark — before', className: 'invert glass-before-dark' },
  { title: 'Dark — after (live)', className: 'invert' },
  { title: 'Light — before', className: 'glass-before-light' },
  { title: 'Light — after (live)' },
];

// Derived from `treatmentColumns` so adding a treatment can't leave the grid
// declaring the old column count (which silently wraps the last column).
const matrixGridStyle = (labelWidth: string): React.CSSProperties => ({
  gridTemplateColumns: `${labelWidth} repeat(${treatmentColumns.length}, minmax(0, 1fr))`,
});

const CoverStressMatrix = (): ReactElement => (
  <div className="mb-10 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
    <h3 className="font-bold text-text-primary typo-title3">
      Cover color stress test
    </h3>
    <p className="mb-6 mt-1 max-w-3xl text-text-tertiary typo-footnote">
      The exact production pill over deterministic cover colors — full luminance
      range plus saturated hues that sit close to the action icons&apos; own
      accent colors. Scan a row to compare the four treatments on the same
      cover; scan a column to check one treatment across every cover.
    </p>
    <div
      className="grid items-center gap-x-4 gap-y-3"
      style={matrixGridStyle('7rem')}
    >
      <span aria-hidden />
      {treatmentColumns.map(({ title }) => (
        <span
          key={title}
          className="text-center font-bold text-text-secondary typo-footnote"
        >
          {title}
        </span>
      ))}
      {coverSwatches.map(({ name, background }) => (
        <React.Fragment key={name}>
          <span className="text-text-tertiary typo-footnote">{name}</span>
          {treatmentColumns.map(({ title, className }) => (
            <div key={`${name}-${title}`} className={className}>
              <SwatchTile background={background} />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// Active/pressed states. A pressed action swaps its icon from the pill's
// neutral `text-primary` to its own brand accent, so each toggled-on icon needs
// its own contrast check against the cover — and the accent it lands on differs
// per theme (see the `--button-pressed-color` note above). Upvote and downvote
// are mutually
// exclusive, hence the separate "everything on" row without a downvote.
const activeStates: { name: string; post: Post }[] = [
  {
    name: 'Upvoted (avocado)',
    post: make({
      id: 'active-upvoted',
      title: 'Upvoted',
      userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
      upvoted: true,
      analytics: { impressions: 90210 },
    }),
  },
  {
    name: 'Commented (blue cheese)',
    post: make({
      id: 'active-commented',
      title: 'Commented',
      commented: true,
      analytics: { impressions: 90210 },
    }),
  },
  {
    name: 'Bookmarked (bun)',
    post: make({
      id: 'active-bookmarked',
      title: 'Bookmarked',
      bookmarked: true,
      analytics: { impressions: 90210 },
    }),
  },
  {
    name: 'Downvoted (ketchup)',
    post: make({
      id: 'active-downvoted',
      title: 'Downvoted',
      userState: { vote: UserVote.Down, flags: { feedbackDismiss: false } },
      analytics: { impressions: 90210 },
    }),
  },
  {
    name: 'Upvoted + commented + bookmarked',
    post: make({
      id: 'active-all',
      title: 'Everything on',
      userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
      upvoted: true,
      commented: true,
      bookmarked: true,
      analytics: { impressions: 90210 },
    }),
  },
];

// The three covers that break accent colors: the two luminance extremes, plus
// the green that sits right on top of the avocado upvote accent.
const activeStateCovers = [
  coverSwatches[0],
  coverSwatches[3],
  coverSwatches[5],
];

const ActiveStatesMatrix = (): ReactElement => (
  <div className="mb-10 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
    <h3 className="font-bold text-text-primary typo-title3">
      Active (pressed) states
    </h3>
    <p className="mb-6 mt-1 max-w-3xl text-text-tertiary typo-footnote">
      Each toggled-on action drops the neutral icon color for its own brand
      accent, so it has to clear contrast on its own. Every state is shown on
      the two luminance extremes plus the green cover that collides with the
      avocado upvote accent.
    </p>
    <div
      className="grid items-center gap-x-4 gap-y-2"
      style={matrixGridStyle('15rem')}
    >
      <span aria-hidden />
      {treatmentColumns.map(({ title }) => (
        <span
          key={title}
          className="text-center font-bold text-text-secondary typo-footnote"
        >
          {title}
        </span>
      ))}
      {activeStates.map(({ name, post }) =>
        activeStateCovers.map((cover) => (
          <React.Fragment key={`${name}-${cover.name}`}>
            <span className="text-text-tertiary typo-footnote">
              {name}{' '}
              <span className="text-text-quaternary">· {cover.name}</span>
            </span>
            {treatmentColumns.map(({ title, className }) => (
              <div key={`${name}-${cover.name}-${title}`} className={className}>
                <SwatchTile background={cover.background} post={post} compact />
              </div>
            ))}
          </React.Fragment>
        )),
      )}
    </div>
  </div>
);

// --- Measured contrast audit -------------------------------------------------
// Eyeballing a translucent overlay is unreliable, so the ratios are computed:
// composite the glass fill over the cover, composite the pill's own 8% black
// tint on top, then run WCAG relative luminance against the icon color. 3:1 is
// the SC 1.4.11 threshold for icons / non-text UI components.
const PILL_TINT = parseHex('#000000');
const PILL_TINT_ALPHA = 0.08;

const auditCovers: { name: string; color: Rgb }[] = [
  { name: 'White', color: parseHex('#ffffff') },
  { name: 'Black', color: parseHex('#04060a') },
  { name: 'Green', color: parseHex('#2bc872') },
  { name: 'Yellow', color: parseHex('#ffe24c') },
];

// Icon colors as the design system resolves them: rest = text-primary, pressed =
// the per-color ghost ladder from `tailwind/buttons.ts` (dark .40 / light .80,
// ketchup + cabbage fall in the `default` branch at .60 in light mode).
const shippedDarkIcons: Record<string, string> = {
  Upvote: '#57e087',
  Comment: '#29d8e5',
  Bookmark: '#ff9157',
  Downvote: '#dd5143',
  'Copy link': '#ba56e1',
  Impressions: '#ffe24c',
};

const auditTreatments: {
  name: string;
  fill: string;
  /** Fill opacity. 1 = solid, so the cover cannot affect any ratio. */
  alpha: number;
  /** The pill's inline 8% black tint. Dropped by the solid-white treatment. */
  tint: boolean;
  /** Border colour + opacity — the pill's own edge, measured against the cover. */
  edge: { color: string; alpha: number };
  rest: string;
  icons: Record<string, string>;
}[] = [
  {
    name: 'Dark — before',
    fill: '#0f1218',
    alpha: 0.64,
    tint: true,
    edge: { color: '#a8b3ce', alpha: 0.2 },
    rest: '#ffffff',
    icons: shippedDarkIcons,
  },
  {
    name: 'Dark — after (live)',
    fill: '#0f1218',
    alpha: 0.9,
    tint: true,
    edge: { color: '#a8b3ce', alpha: 0.2 },
    rest: '#ffffff',
    icons: {
      ...shippedDarkIcons,
      Bookmark: '#ffab81',
      Downvote: '#f57869',
    },
  },
  {
    name: 'Light — before',
    fill: '#ffffff',
    alpha: 0.64,
    tint: true,
    edge: { color: '#a8b3ce', alpha: 0.2 },
    rest: '#0f1218',
    icons: {
      Upvote: '#00bc60',
      Comment: '#00abb6',
      Bookmark: '#e16300',
      Downvote: '#c83a2f',
      'Copy link': '#a641cc',
      Impressions: '#eacc2a',
    },
  },
  {
    name: 'Light — after (live)',
    fill: '#ffffff',
    alpha: 0.9,
    tint: false,
    // Default token, unchanged from before.
    edge: { color: '#a8b3ce', alpha: 0.2 },
    rest: '#0f1218',
    icons: {
      Upvote: '#039750',
      Comment: '#01929c',
      Bookmark: '#d55e00',
      Downvote: '#c83a2f',
      'Copy link': '#a641cc',
      Impressions: '#94821f',
    },
  },
];

const ContrastAudit = (): ReactElement => (
  <div className="mb-10 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
    <h3 className="font-bold text-text-primary typo-title3">
      Measured contrast (WCAG SC 1.4.11, threshold 3:1)
    </h3>
    <p className="mb-6 mt-1 max-w-3xl text-text-tertiary typo-footnote">
      Icon color vs. the pill&apos;s composited backdrop (fill over the cover,
      plus the pill&apos;s 8% black tint where it still applies). Red cells are
      below 3:1. The two shipped rows let the cover drive the result at 64% fill
      — the same icon swings from 1.0 to 11:1 depending on the image. At 90% the
      proposed column moves only a few hundredths across covers, so the accents
      were tuned against its worst case (90% white over a near-black cover). The{' '}
      <em>Boundary</em> row takes the better of border-vs-cover and
      fill-vs-cover, since either can carry the component outline — a dark pill
      on a white cover is held by its fill, while a near-white pill on a light
      cover has only its border, and the default border token is too faint to do
      it.
    </p>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left typo-footnote">
        <thead>
          <tr className="text-text-secondary">
            <th className="p-2 font-bold">Treatment</th>
            <th className="p-2 font-bold">Element</th>
            {auditCovers.map(({ name }) => (
              <th key={name} className="p-2 text-center font-bold">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {auditTreatments.map(
            ({ name, fill, alpha, tint, edge, rest, icons }) => {
              const pillOver = (cover: Rgb): Rgb => {
                const filled = composite(parseHex(fill), alpha, cover);
                return tint
                  ? composite(PILL_TINT, PILL_TINT_ALPHA, filled)
                  : filled;
              };
              // SC 1.4.11 lets the component boundary be carried by EITHER the
              // border or the fill, so take the better of the two. The border
              // sits on the pill's outline, so what's behind it is the cover,
              // not the fill.
              const rows: { label: string; ratio: (cover: Rgb) => number }[] = [
                {
                  label: 'Boundary vs cover (best of edge/fill)',
                  ratio: (cover) =>
                    Math.max(
                      contrastRatio(
                        composite(parseHex(edge.color), edge.alpha, cover),
                        cover,
                      ),
                      contrastRatio(pillOver(cover), cover),
                    ),
                },
                {
                  label: 'Rest icon',
                  ratio: (cover) =>
                    contrastRatio(parseHex(rest), pillOver(cover)),
                },
                ...Object.entries(icons).map(([action, hex]) => ({
                  label: `${action} (pressed)`,
                  ratio: (cover: Rgb) =>
                    contrastRatio(parseHex(hex), pillOver(cover)),
                })),
              ];

              return rows.map(({ label, ratio }, index) => (
                <tr
                  key={`${name}-${label}`}
                  className="border-t border-border-subtlest-quaternary"
                >
                  <td className="p-2 text-text-tertiary">
                    {index === 0 ? name : ''}
                  </td>
                  <td className="p-2 text-text-primary">{label}</td>
                  {auditCovers.map((cover) => {
                    const value = ratio(cover.color);
                    const passes = value >= 3;

                    return (
                      <td
                        key={cover.name}
                        className={classNames(
                          'p-2 text-center tabular-nums',
                          passes
                            ? 'text-text-tertiary'
                            : 'bg-surface-float font-bold text-status-error',
                        )}
                      >
                        {value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ));
            },
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const Panel = ({
  title,
  note,
  invert = false,
  scope,
  children,
}: {
  title: string;
  note: string;
  invert?: boolean;
  scope?: string;
  children: ReactNode;
}): ReactElement => (
  <section className={classNames(invert && 'invert')}>
    <div
      className={classNames(
        'flex h-full flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default p-6',
        scope,
      )}
    >
      <h3 className="font-bold text-text-primary typo-title3">{title}</h3>
      <p className="mb-6 mt-1 text-text-tertiary typo-footnote">{note}</p>
      <div className="flex flex-col items-center gap-8">{children}</div>
    </div>
  </section>
);

const Cards = (): ReactElement => (
  <>
    {posts.map((post) => (
      <div key={post.id} className="w-80">
        <ArticleGrid post={post} {...actionHandlers} />
      </div>
    ))}
  </>
);

const GlassActionsThemeCompare = (): ReactElement => (
  <ExtensionProviders>
    <FeatureOverrides
      values={{
        feed_card_glass_actions: true,
        card_impressions: true,
      }}
    >
      <style>{beforeDarkCss}</style>
      <style>{beforeLightCss}</style>
      <div className="min-h-screen bg-background-subtle p-8">
        <h2 className="mb-2 text-2xl font-bold text-text-primary">
          Glass action bar — dark vs light
        </h2>
        <p className="mb-8 max-w-3xl text-sm text-text-tertiary">
          The same cards before and after the fix, side by side (the panels
          force their own theme, so the Storybook toggle doesn&apos;t matter
          here). Light mode is now a <strong>flat white bar at 90%</strong> —
          near-solid, with just a hint of the cover frosting through, so it
          reads as one calm surface instead of a dark slab on every card.
          Dropping the pill&apos;s 8% black tint is what lets the re-toned
          accents pass. Dark mode keeps its glass, also at 90%, with the two
          failing accents moved up the ramp. The border stays on the default
          token, which keeps the familiar look but leaves the pill&apos;s{' '}
          <em>outline</em> under 3:1 on light covers — the icons are all fine;
          see the Boundary row in the audit. The <strong>after</strong> columns
          render the live component with no overrides, so this page stays honest
          as the component changes; the
          <strong> before</strong> columns restore the old values via scoped
          CSS.
        </p>
        <CoverStressMatrix />
        <ActiveStatesMatrix />
        <ContrastAudit />
        <div className="grid grid-cols-2 gap-6 desktop:grid-cols-4">
          <Panel
            title="Dark — before"
            note="The old dark bar at 64%. Looks right, but a pressed downvote sits at 1.6:1 over a white cover because the fill lets the image through."
            invert
            scope="glass-before-dark"
          >
            <Cards />
          </Panel>
          <Panel
            title="Dark — after (live)"
            note="Shipped: same dark glass at 90%, plus downvote ketchup.40 → .10 and bookmark bun.40 → .20. Worst cell 3.67."
            invert
          >
            <Cards />
          </Panel>
          <Panel
            title="Light — before"
            note="The reported problem: 64% white fill. On bright covers the pill all but disappears, and every pressed accent falls under 3:1."
            scope="glass-before-light"
          >
            <Cards />
          </Panel>
          <Panel
            title="Light — after (live)"
            note="Shipped: flat white at 90% with the default border and re-toned accents. Every icon clears 3:1 on every cover; the pill's outline still doesn't, because the default border token is salt.90 at 20%."
          >
            <Cards />
          </Panel>
        </div>
      </div>
    </FeatureOverrides>
  </ExtensionProviders>
);

const meta: Meta = {
  title: 'Components/Cards/Glass Actions Theme Compare',
  component: GlassActionsThemeCompare,
  parameters: {
    layout: 'fullscreen',
    // Panels force their theme locally (`.invert` for dark); pin the page to
    // light so the panel labels stay truthful regardless of the toolbar toggle.
    themes: { themeOverride: 'light' },
  },
};

export default meta;

type Story = StoryObj;

export const ThemeCompare: Story = {
  render: () => <GlassActionsThemeCompare />,
  name: 'Dark vs Light (before/after)',
};
