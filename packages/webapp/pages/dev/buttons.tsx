import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ButtonV2,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { CardAction } from '@dailydotdev/shared/src/components/buttons/CardAction';
import { CardActionBar } from '@dailydotdev/shared/src/components/buttons/CardActionBar';
import { ColorName as ButtonColor } from '@dailydotdev/shared/src/styles/colors';
import {
  BookmarkIcon,
  CopyIcon,
  DiscussIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
  MenuIcon,
  PlusIcon,
  ShareIcon,
  StarIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { NextSeo } from 'next-seo';
import { isDevelopment } from '@dailydotdev/shared/src/lib/constants';
import {
  InspirationButton,
  InspirationLabel,
  inspirationByVariant,
} from '../../components/devButtons/InspirationButtons';

/**
 * /dev/buttons — internal review surface for the ButtonV2 system overhaul.
 *
 * Side-by-side OLD `ButtonV2` vs NEW `ButtonV2` across every variant, color,
 * size, and state. Sticky controls bar lets reviewers flip theme,
 * background, and state simultaneously across the page. No shape control
 * — the system is rectangle-only by house rule.
 *
 * Gated to non-production builds. Carries `noindex` SEO regardless.
 */

type StateName =
  | 'default'
  | 'hover'
  | 'focus-visible'
  | 'active'
  | 'disabled'
  | 'inactive'
  | 'loading';

const stateOptions: ReadonlyArray<StateName> = [
  'default',
  'hover',
  'focus-visible',
  'active',
  'disabled',
  'inactive',
  'loading',
];

type BgChoice = 'default' | 'float' | 'invert';

const bgClass = (bg: BgChoice): string => {
  switch (bg) {
    case 'default':
      return 'bg-background-default';
    case 'float':
      return 'bg-surface-float';
    case 'invert':
      return 'bg-surface-invert';
    default:
      return 'bg-background-default';
  }
};

const ALL_COLORS: Array<ButtonColor | undefined> = [
  undefined,
  ButtonColor.Cabbage,
  ButtonColor.BlueCheese,
  ButtonColor.Avocado,
  ButtonColor.Bun,
  ButtonColor.Ketchup,
  ButtonColor.Cheese,
  ButtonColor.Bacon,
];

const useTheme = (initial: 'dark' | 'light') => {
  const [theme, setTheme] = useState<'dark' | 'light'>(initial);
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);
  return [theme, setTheme] as const;
};

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="mb-10">
    <header className="mb-3 border-b border-border-subtlest-tertiary pb-2">
      <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
      {description ? (
        <p className="mt-1 text-text-secondary typo-callout">{description}</p>
      ) : null}
    </header>
    {children}
  </section>
);

const stateClassNames = (state: StateName) => {
  const out: { className?: string; disabled?: boolean; loading?: boolean } = {};
  if (state === 'hover') {
    out.className = 'hover';
  }
  if (state === 'focus-visible') {
    out.className = 'focus-visible';
  }
  if (state === 'active') {
    out.className = 'active';
  }
  if (state === 'disabled') {
    out.disabled = true;
  }
  if (state === 'loading') {
    out.loading = true;
  }
  return out;
};

type InspirationStateName = 'default' | 'hover' | 'active' | 'disabled';

const inspirationState = (state: StateName): InspirationStateName => {
  switch (state) {
    case 'hover':
      return 'hover';
    case 'active':
      return 'active';
    case 'disabled':
      return 'disabled';
    default:
      return 'default';
  }
};

const ComparisonRow = ({
  variant,
  color,
  size,
  state,
  bg,
  showOld,
  showInspiration,
  useDefaultCursor,
}: {
  variant: ButtonVariant;
  color: ButtonColor | undefined;
  size: ButtonSize;
  state: StateName;
  bg: BgChoice;
  showOld: boolean;
  showInspiration: boolean;
  useDefaultCursor: boolean;
}) => {
  const stateProps = stateClassNames(state);
  const inactive = state === 'inactive';
  const colorLabel = color ?? '—';
  const buttonLabel = color ?? variant;
  const source = inspirationByVariant[variant];
  return (
    <div className="contents">
      <div className="flex items-center px-3 py-2 text-text-secondary typo-footnote">
        {variant}
      </div>
      <div className="flex items-center px-3 py-2 text-text-tertiary typo-footnote">
        {colorLabel}
      </div>
      {showOld ? (
        <div
          className={`flex items-center justify-center ${bgClass(
            bg,
          )} rounded-8 px-3 py-3`}
        >
          <ButtonV2
            variant={variant}
            color={color as ButtonColor}
            size={size}
            disabled={stateProps.disabled || inactive}
            loading={stateProps.loading}
            className={stateProps.className}
          >
            {buttonLabel}
          </ButtonV2>
        </div>
      ) : null}
      <div
        className={`flex items-center justify-center ${bgClass(
          bg,
        )} rounded-8 px-3 py-3`}
      >
        <ButtonV2
          variant={variant}
          color={color as ButtonColor}
          size={size}
          disabled={stateProps.disabled}
          inactive={inactive}
          loading={stateProps.loading}
          useDefaultCursor={useDefaultCursor}
          className={stateProps.className}
        >
          {buttonLabel}
        </ButtonV2>
      </div>
      {showInspiration ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-8 bg-surface-float px-3 py-3">
          <InspirationButton
            source={source}
            variant={variant}
            state={inspirationState(state)}
          >
            {buttonLabel}
          </InspirationButton>
          <InspirationLabel source={source} />
        </div>
      ) : null}
    </div>
  );
};

const TypographyMatrix = () => {
  const rows: Array<{
    variant: string;
    state: string;
    old: string;
    next: string;
    note?: string;
  }> = [
    {
      variant: 'Primary',
      state: 'default',
      old: 'surface-invert',
      next: 'surface-invert',
    },
    {
      variant: 'Primary',
      state: 'pressed',
      old: 'text-primary (FLIP)',
      next: 'surface-invert (no flip)',
    },
    {
      variant: 'Primary',
      state: 'disabled',
      old: 'text-tertiary*',
      next: 'text-disabled',
    },
    {
      variant: 'Tertiary',
      state: 'default',
      old: 'text-tertiary*',
      next: 'text-primary',
      note: 'Headline fix',
    },
    {
      variant: 'Tertiary',
      state: 'hover',
      old: 'text-tertiary*',
      next: 'text-primary',
    },
    {
      variant: 'Tertiary',
      state: 'disabled',
      old: 'text-disabled',
      next: 'text-disabled',
    },
    {
      variant: 'Float',
      state: 'default',
      old: 'text-tertiary*',
      next: 'text-primary',
    },
    {
      variant: 'Subtle',
      state: 'default',
      old: 'text-tertiary*',
      next: 'text-primary',
    },
    {
      variant: 'Subtle',
      state: 'border (light)',
      old: '— (missing!)',
      next: 'border-subtlest-secondary',
    },
    {
      variant: 'Option',
      state: 'default',
      old: 'text-tertiary',
      next: 'text-secondary',
    },
    {
      variant: 'Option',
      state: 'hover',
      old: 'text-tertiary*',
      next: 'text-primary',
    },
    {
      variant: 'Quiz',
      state: 'disabled',
      old: 'text-tertiary*',
      next: 'text-disabled',
    },
    {
      variant: 'Primary weight',
      state: '—',
      old: 'font-bold (700)',
      next: 'font-semibold (600)',
    },
    {
      variant: 'Other weight',
      state: '—',
      old: 'font-bold (700)',
      next: 'font-medium (500)',
    },
  ];
  return (
    <div className="overflow-x-auto rounded-12 border border-border-subtlest-tertiary">
      <table className="w-full table-auto border-collapse">
        <thead className="bg-surface-float">
          <tr className="text-left">
            <th className="px-3 py-2 text-text-tertiary typo-footnote">
              Variant
            </th>
            <th className="px-3 py-2 text-text-tertiary typo-footnote">
              State
            </th>
            <th className="px-3 py-2 text-text-tertiary typo-footnote">
              OLD label color
            </th>
            <th className="px-3 py-2 text-text-tertiary typo-footnote">
              NEW label color
            </th>
            <th className="px-3 py-2 text-text-tertiary typo-footnote">Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              // eslint-disable-next-line react/no-array-index-key
              key={`${row.variant}-${row.state}-${idx}`}
              className="border-t border-border-subtlest-tertiary"
            >
              <td className="px-3 py-2 text-text-primary typo-callout">
                {row.variant}
              </td>
              <td className="px-3 py-2 text-text-secondary typo-callout">
                {row.state}
              </td>
              <td className="px-3 py-2 text-text-secondary typo-callout">
                <code>{row.old}</code>
              </td>
              <td className="px-3 py-2 text-text-primary typo-callout">
                <code>{row.next}</code>
              </td>
              <td className="px-3 py-2 text-text-tertiary typo-footnote">
                {row.note ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-3 py-2 text-text-tertiary typo-caption1">
        * marks tokens that today equal the disabled palette — the root cause of
        &quot;looks disabled&quot;.
      </p>
    </div>
  );
};

const Vignette = ({
  title,
  bg = 'default',
  children,
}: {
  title: string;
  bg?: BgChoice;
  children: ReactNode;
}) => (
  <div
    className={`rounded-12 border border-border-subtlest-tertiary p-4 ${bgClass(
      bg,
    )}`}
  >
    <header className="mb-3 text-text-tertiary typo-caption1">{title}</header>
    {children}
  </div>
);

const VignetteRow = ({
  title,
  oldNode,
  newNode,
  showOld,
}: {
  title: string;
  oldNode: ReactNode;
  newNode: ReactNode;
  showOld: boolean;
}) => (
  <div
    className="grid gap-3"
    style={{
      gridTemplateColumns: showOld
        ? 'minmax(160px, 200px) 1fr 1fr'
        : 'minmax(160px, 200px) 1fr',
    }}
  >
    <div className="flex items-center px-2 text-text-tertiary typo-footnote">
      {title}
    </div>
    {showOld ? <Vignette title="OLD">{oldNode}</Vignette> : null}
    <Vignette title="NEW">{newNode}</Vignette>
  </div>
);

/**
 * Faithful mock of the production `ArticleGrid` card. Mirrors the
 * actual chrome from `packages/shared/src/components/cards/article/
 * ArticleGrid.tsx` (main branch):
 *
 * - Outer `<article>` ships `Card.tsx`'s exact class string —
 *   `bg-background-subtle`, `rounded-16`, `border`, `min-h-card`.
 *   No outer padding (the card is `p-0`); content rows opt in to
 *   their own padding via `Container`'s `mx-4`.
 * - Header row uses `CardHeader`'s `h-8 my-1 mt-4 -mx-1.5` rhythm
 *   so the source avatar + ⋯ menu line up with production.
 * - Title is `mt-2 typo-title3 line-clamp-3` (production
 *   `CardTitle`).
 * - Tags + metadata sit inside `mx-4`.
 * - Image is `rounded-12 aspect-video` inside `Container` (`mx-4`).
 * - Engagement bar lives directly under the image with **no
 *   divider, no top border**: production wraps it in `Container`
 *   (mx-4) + `ActionButtons`'s grid variant adds `px-1 pb-1`. We
 *   replicate exactly so reviewers see the same vertical rhythm
 *   they see in the live feed.
 *
 * `engagement` is the only swap point — pass v1 production-faithful
 * markup or a v2 `<CardActionBar layout="feedCard">…` and
 * everything around it stays byte-identical.
 */
const MockFeedCard = ({
  width,
  engagement,
  title = 'How CSS container queries are reshaping responsive design — practical patterns and common pitfalls to avoid',
  source = 'Smashing Magazine',
  meta = 'Apr 15 · 8 min read',
  tag = '#webdev',
  imageGradient = 'from-accent-blueCheese-default to-accent-cabbage-default',
}: {
  width: number;
  engagement: ReactNode;
  title?: string;
  source?: string;
  meta?: string;
  tag?: string;
  imageGradient?: string;
}) => (
  <article
    style={{ width }}
    className="flex h-full max-h-cardLarge min-h-card flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-0"
  >
    <div className="mx-4 mt-4 flex h-8 items-center gap-2">
      <div className="size-8 shrink-0 rounded-full bg-accent-cabbage-default" />
      <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
        {source}
      </span>
      <ButtonV2
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<MenuIcon />}
        aria-label="Card menu"
      />
    </div>
    <div className="mx-4 mt-2 line-clamp-3 break-words font-bold text-text-primary typo-title3">
      {title}
    </div>
    <div className="mx-4 mt-2 flex min-w-0 items-center gap-1 truncate text-text-tertiary typo-footnote">
      <span className="truncate">{tag}</span>
    </div>
    <p className="mx-4 mt-1 truncate text-text-tertiary typo-footnote">
      {meta}
    </p>
    <div className="mx-4 mt-3">
      <div
        className={`aspect-video w-full rounded-12 bg-gradient-to-br ${imageGradient}`}
      />
    </div>
    <div className="flex-1" />
    <div className="mx-4 px-1 pb-1 pt-2">{engagement}</div>
  </article>
);

/**
 * Faithful mock of production `ArticleList` (
 * `packages/shared/src/components/cards/article/ArticleList.tsx`,
 * main branch): a single-column list-view row with the image on the
 * right and the action bar tucked under the title on the left. No
 * border, no divider above the bar — production places the bar
 * directly inside the same flex column as the title (`mt-4
 * tablet:mt-0` per the live class list).
 */
const MockListCard = ({
  width,
  engagement,
  title = 'A deep dive into CSS container queries: practical patterns, common pitfalls, and what they replace in your existing media-query stack',
  source = 'Smashing Magazine',
  meta = 'Apr 15 · 8 min read · #webdev',
  imageGradient = 'from-accent-blueCheese-default to-accent-cabbage-default',
}: {
  width: number;
  engagement: ReactNode;
  title?: string;
  source?: string;
  meta?: string;
  imageGradient?: string;
}) => (
  <article
    style={{ width }}
    className="flex items-stretch gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle pb-3 pr-4 pt-4"
  >
    <div className="ml-4 flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2">
        <div className="size-8 shrink-0 rounded-full bg-accent-cabbage-default" />
        <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
          {source}
        </span>
        <ButtonV2
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MenuIcon />}
          aria-label="Card menu"
        />
      </div>
      <h3 className="mt-1 line-clamp-2 break-words font-bold text-text-primary typo-callout">
        {title}
      </h3>
      <p className="mt-1 truncate text-text-tertiary typo-footnote">{meta}</p>
      <div className="mt-2 flex-1" />
      <div className="mt-2">{engagement}</div>
    </div>
    <div
      className={`mt-1 aspect-video h-28 shrink-0 rounded-12 bg-gradient-to-br ${imageGradient}`}
    />
  </article>
);

/**
 * v1 engagement bar — hand-rolled to match production
 * `ActionButtons` (Tertiary / Small / flex-1 justify-between with
 * sibling counters) so the OLD column is honest.
 */
const V1EngagementBar = ({ pressed = false }: { pressed?: boolean }) => (
  <div className="flex flex-1 items-center justify-between text-text-tertiary typo-footnote">
    <span className="inline-flex items-center">
      <ButtonV2
        pressed={pressed}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        color={ButtonColor.Avocado}
        icon={<UpvoteIcon secondary={pressed} />}
        aria-label="Upvote"
      />
      <span className="pl-1 tabular-nums">1.2K</span>
    </span>
    <ButtonV2
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      color={ButtonColor.Ketchup}
      icon={<DownvoteIcon />}
      aria-label="Downvote"
    />
    <span className="inline-flex items-center">
      <ButtonV2
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        color={ButtonColor.BlueCheese}
        icon={<DiscussIcon />}
        aria-label="Comment"
      />
      <span className="pl-1 tabular-nums">42</span>
    </span>
    <ButtonV2
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      color={ButtonColor.Bun}
      icon={<BookmarkIcon />}
      aria-label="Bookmark"
    />
    <ButtonV2
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      color={ButtonColor.Cabbage}
      icon={<CopyIcon />}
      aria-label="Copy link"
    />
  </div>
);

/**
 * v2 engagement bar — `density="compact"` + `feedCard` layout, the
 * production rule for grid cards. Width footprint matches v1
 * exactly (5 × 32 px), so swapping in is layout-neutral.
 */
const V2EngagementBar = ({ pressed = false }: { pressed?: boolean }) => (
  <CardActionBar layout="feedCard">
    <CardAction
      density="compact"
      pressed={pressed}
      icon={<UpvoteIcon />}
      iconPressed={<UpvoteIcon secondary />}
      label="Upvote"
      color={ButtonColor.Avocado}
      count={1234}
    />
    <CardAction
      density="compact"
      icon={<DownvoteIcon />}
      iconPressed={<DownvoteIcon secondary />}
      label="Downvote"
      color={ButtonColor.Ketchup}
    />
    <CardAction
      density="compact"
      icon={<DiscussIcon />}
      label="Comment"
      color={ButtonColor.BlueCheese}
      count={42}
    />
    <CardAction
      density="compact"
      icon={<BookmarkIcon />}
      iconPressed={<BookmarkIcon secondary />}
      label="Bookmark"
      color={ButtonColor.Bun}
    />
    <CardAction
      density="compact"
      icon={<CopyIcon />}
      label="Copy link"
      color={ButtonColor.Cabbage}
    />
  </CardActionBar>
);

/**
 * `WidthProbe` — render a child inside a fixed-width container and
 * label the row with the pixel value. Used to pin every "real
 * component" simulation at multiple representative resolutions so
 * we can verify there's no overflow / cutting at any breakpoint.
 */
const WidthProbe = ({
  width,
  label,
  children,
}: {
  width: number;
  label: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <div className="text-text-tertiary typo-caption1">
      {width} px · {label}
    </div>
    <div style={{ width }}>{children}</div>
  </div>
);

/**
 * Maps a probe width to the production surface it represents. Keep
 * the bands ordered narrow → wide; the lookup picks the first match.
 */
const POST_BAR_LABELS: Array<{ maxWidth: number; label: string }> = [
  { maxWidth: 360, label: 'mobile webview (post modal on phone)' },
  { maxWidth: 500, label: 'tablet portrait / narrow post modal' },
  { maxWidth: 640, label: 'post modal on desktop' },
  { maxWidth: Infinity, label: 'post detail page article column' },
];
const labelForPostBarWidth = (width: number): string =>
  POST_BAR_LABELS.find((band) => width <= band.maxWidth)?.label ?? '';

/**
 * `usePostActionsLabelVisibility` — v2-friendly hook that mirrors
 * the `ResizeObserver`-driven label-hiding logic from production
 * `PostActions.tsx` (lines 181 – 211) **byte-for-byte**.
 *
 * Why DOM mutation instead of React state: the natural width of the
 * bar changes every time we toggle a label, so a "set state, measure
 * next tick" loop either flickers or gets stuck in icon-only after
 * the first overflow (`ResizeObserver` only fires on the observed
 * element's box-size change, not on content changes). The v1
 * production implementation sidesteps that by ALWAYS rendering the
 * labels, then reading `scrollWidth` synchronously after a "force
 * visible" reset and toggling a `hidden` class.
 *
 * **Why we target the WRAPPER, not the label span.**
 *
 * Earlier draft hid `.card-action-label`. That removed the text but
 * left the outer `<span class="card-action-content …">` in the flex
 * layout. Result: an icon-only `Bookmark` rendered as
 * `px-4 + icon (24) + gap-2 + ghost-wrapper (0) + px-4 = 64 × 40 px`
 * — a rectangle with empty space on the right of the icon. v1 doesn't
 * have this bug because v1's counter / label sits OUTSIDE the
 * `<button>` as a sibling — when the label hides, the button itself
 * has no children at all. v2 brings the affordance inside the click
 * target (Reddit / X pattern), so we have to recreate that "no
 * children" effect on collapse.
 *
 * Hiding `.card-action-content` does exactly that: `display:none`
 * removes the wrapper from the flex layout entirely, so there's no
 * second flex child for `gap-X` to apply between, and the
 * `.btn-v2:has(> .card-action-content.hidden)` rule in
 * `buttons-v2.css` simultaneously zeroes horizontal padding and
 * locks aspect-ratio to 1:1 — collapsing a 40 px-tall comfortable
 * row to a 40 × 40 square hit. Same recipe gives a 32 × 32 square
 * for the compact density.
 *
 * Consumers must pass `labelVisible` for the actions they want to
 * participate — Upvote / Downvote stay icon-only always (no wrapper
 * rendered), the rest opt in.
 */
const usePostActionsLabelVisibility = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const adjustActions = () => {
      const wrappers = el.querySelectorAll<HTMLElement>('.card-action-content');
      wrappers.forEach((w) => w.classList.remove('hidden'));
      if (el.scrollWidth > el.clientWidth) {
        wrappers.forEach((w) => w.classList.add('hidden'));
      }
    };
    const ro = new ResizeObserver(() => adjustActions());
    ro.observe(el);
    adjustActions();
    return () => ro.disconnect();
  }, []);

  return { ref };
};

/**
 * `PostActionsV1Clone` — production-faithful clone of
 * `packages/shared/src/components/post/PostActions.tsx` (the post
 * detail page / post modal action bar). Renders the same 6 actions
 * (Upvote / Downvote / Comment / Award / Bookmark / Copy), the same
 * border-wrapped chrome, and the **same** `ResizeObserver`-driven
 * label-hiding mechanic on `.btn-quaternary label` selectors as
 * lines 181 – 211 of the real component. Stand-alone — no
 * `AuthContext` / `useVotePost` / modal dependencies — so it works
 * inside the dev page's deliberately minimal provider tree
 * (`pages/_app.tsx` short-circuits BootDataProvider for `/dev/*`).
 *
 * The visual + responsive contract is byte-equivalent to production;
 * only the side-effect handlers are no-ops.
 */
const PostActionsV1Clone = ({
  pressedUpvote = false,
  pressedDownvote = false,
  pressedBookmark = false,
  awarded = false,
}: {
  pressedUpvote?: boolean;
  pressedDownvote?: boolean;
  pressedBookmark?: boolean;
  awarded?: boolean;
}) => {
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustActions = () => {
      const actions = actionsRef.current;
      if (!actions) {
        return;
      }
      const labels = actions.querySelectorAll('.btn-quaternary label');
      labels.forEach((label) => label.classList.remove('hidden'));
      const isOverflowing = actions.scrollWidth > actions.clientWidth;
      if (isOverflowing) {
        labels.forEach((label) => label.classList.add('hidden'));
      }
    };
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const ro = new ResizeObserver(() => adjustActions());
    if (actionsRef.current) {
      ro.observe(actionsRef.current);
    }
    adjustActions();
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex items-center rounded-16 border border-border-subtlest-tertiary">
      <div
        ref={actionsRef}
        className="flex flex-1 items-center justify-between gap-x-1 overflow-hidden py-2 pl-4 pr-6"
      >
        <QuaternaryButton
          id="dev-upvote-post-btn"
          pressed={pressedUpvote}
          icon={<UpvoteIcon secondary={pressedUpvote} />}
          aria-label="Upvote"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Avocado}
        />
        <QuaternaryButton
          id="dev-downvote-post-btn"
          pressed={pressedDownvote}
          icon={<DownvoteIcon secondary={pressedDownvote} />}
          aria-label="Downvote"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Ketchup}
        />
        <QuaternaryButton
          id="dev-comment-post-btn"
          icon={<DiscussIcon />}
          aria-label="Comment"
          variant={ButtonVariant.Tertiary}
          className="btn-tertiary-blueCheese"
        >
          Comment
        </QuaternaryButton>
        <QuaternaryButton
          id="dev-award-post-btn"
          pressed={awarded}
          icon={<MedalBadgeIcon secondary={awarded} />}
          variant={ButtonVariant.Tertiary}
          className="btn-tertiary-cabbage"
        >
          Award
        </QuaternaryButton>
        <QuaternaryButton
          id="dev-bookmark-post-btn"
          pressed={pressedBookmark}
          icon={<BookmarkIcon secondary={pressedBookmark} />}
          variant={ButtonVariant.Tertiary}
          className="btn-tertiary-bun"
        >
          Bookmark
        </QuaternaryButton>
        <QuaternaryButton
          id="dev-copy-post-btn"
          icon={<LinkIcon />}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Cabbage}
          className="text-text-tertiary"
        >
          Copy
        </QuaternaryButton>
      </div>
    </div>
  );
};

/**
 * `PostActionsV2` — direct v2 equivalent of production
 * `PostActions.tsx`. Same 6 actions, same border-wrapped chrome,
 * same `flex-1 justify-between` layout, same responsive label
 * collapse. Built on `<CardActionBar layout="between">` +
 * `<CardAction>` so when the real `PostActions` migrates to v2,
 * this is the contract it'll follow.
 */
const PostActionsV2 = ({
  pressedUpvote = false,
  pressedDownvote = false,
  pressedBookmark = false,
  awarded = false,
}: {
  pressedUpvote?: boolean;
  pressedDownvote?: boolean;
  pressedBookmark?: boolean;
  awarded?: boolean;
}) => {
  const { ref } = usePostActionsLabelVisibility();
  return (
    <div className="flex items-center rounded-16 border border-border-subtlest-tertiary">
      <div
        ref={ref}
        className="flex flex-1 items-center justify-between gap-x-1 overflow-hidden py-2 pl-4 pr-6"
      >
        <CardAction
          pressed={pressedUpvote}
          icon={<UpvoteIcon />}
          iconPressed={<UpvoteIcon secondary />}
          label="Upvote"
          color={ButtonColor.Avocado}
        />
        <CardAction
          pressed={pressedDownvote}
          icon={<DownvoteIcon />}
          iconPressed={<DownvoteIcon secondary />}
          label="Downvote"
          color={ButtonColor.Ketchup}
        />
        <CardAction
          icon={<DiscussIcon />}
          label="Comment"
          labelVisible
          color={ButtonColor.BlueCheese}
        />
        <CardAction
          pressed={awarded}
          icon={<MedalBadgeIcon />}
          iconPressed={<MedalBadgeIcon secondary />}
          label="Award"
          labelVisible
          color={ButtonColor.Cabbage}
        />
        <CardAction
          pressed={pressedBookmark}
          icon={<BookmarkIcon />}
          iconPressed={<BookmarkIcon secondary />}
          label="Bookmark"
          labelVisible
          color={ButtonColor.Bun}
        />
        <CardAction
          icon={<LinkIcon />}
          label="Copy"
          labelVisible
          color={ButtonColor.Cabbage}
        />
      </div>
    </div>
  );
};

const ProductionGate = ({ children }: { children: ReactNode }) => {
  if (!isDevelopment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-default p-12">
        <p className="text-text-secondary typo-callout">
          The button playground is only available in development.
        </p>
      </div>
    );
  }
  return <>{children}</>;
};

const ButtonsDevPage = (): ReactElement => {
  const [theme, setTheme] = useTheme('dark');
  const [size, setSize] = useState<ButtonSize>(ButtonSize.Medium);
  const [state, setState] = useState<StateName>('default');
  const [bg, setBg] = useState<BgChoice>('default');
  const [showOld, setShowOld] = useState(true);
  const [showInspiration, setShowInspiration] = useState(true);
  const [useDefaultCursor, setUseDefaultCursor] = useState(false);

  const variants = useMemo(() => Object.values(ButtonVariant), []);

  return (
    <ProductionGate>
      <NextSeo nofollow noindex title="Buttons playground · daily.dev dev" />
      <div className="min-h-screen bg-background-default text-text-primary">
        {/* Sticky controls bar */}
        <div className="bg-background-default/95 sticky top-0 z-header border-b border-border-subtlest-tertiary px-6 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-bold typo-callout">
              ButtonV2 playground · OLD vs NEW
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary typo-caption1">Theme</span>
              <select
                className="rounded-6 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 text-text-primary typo-callout"
                value={theme}
                onChange={(event) =>
                  setTheme(event.target.value as 'dark' | 'light')
                }
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary typo-caption1">Size</span>
              <select
                className="rounded-6 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 text-text-primary typo-callout"
                value={size}
                onChange={(event) => setSize(event.target.value as ButtonSize)}
              >
                {Object.values(ButtonSize).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary typo-caption1">State</span>
              <select
                className="rounded-6 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 text-text-primary typo-callout"
                value={state}
                onChange={(event) => setState(event.target.value as StateName)}
              >
                {stateOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary typo-caption1">Cell BG</span>
              <select
                className="rounded-6 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 text-text-primary typo-callout"
                value={bg}
                onChange={(event) => setBg(event.target.value as BgChoice)}
              >
                <option value="default">background-default</option>
                <option value="float">surface-float</option>
                <option value="invert">surface-invert</option>
              </select>
            </div>
            <label
              htmlFor="dev-buttons-show-old"
              className="flex items-center gap-2 text-text-secondary typo-caption1"
            >
              <input
                id="dev-buttons-show-old"
                type="checkbox"
                checked={showOld}
                onChange={(event) => setShowOld(event.target.checked)}
              />
              Show OLD column
            </label>
            <label
              htmlFor="dev-buttons-show-inspiration"
              className="flex items-center gap-2 text-text-secondary typo-caption1"
            >
              <input
                id="dev-buttons-show-inspiration"
                type="checkbox"
                checked={showInspiration}
                onChange={(event) => setShowInspiration(event.target.checked)}
              />
              Show inspiration column
            </label>
            <label
              htmlFor="dev-buttons-default-cursor"
              className="flex items-center gap-2 text-text-secondary typo-caption1"
            >
              <input
                id="dev-buttons-default-cursor"
                type="checkbox"
                checked={useDefaultCursor}
                onChange={(event) => setUseDefaultCursor(event.target.checked)}
              />
              HIG cursor (default)
            </label>
          </div>
        </div>

        <main className="mx-auto max-w-[1400px] px-6 py-8">
          <p className="mb-6 text-text-secondary typo-callout">
            Live comparison of every variant × color in the current state (
            {state}). Use the controls above to flip theme, size, cell
            background, and which columns render. The OLD column shows
            today&apos;s <code>ButtonV2</code>; the NEW column shows the
            proposed <code>ButtonV2</code> with a fully size-coherent scale:
            radius{' '}
            <code>
              8&nbsp;/&nbsp;10&nbsp;/&nbsp;12&nbsp;/&nbsp;14&nbsp;/&nbsp;16
            </code>{' '}
            px, padding{' '}
            <code>
              8&nbsp;/&nbsp;12&nbsp;/&nbsp;16&nbsp;/&nbsp;24&nbsp;/&nbsp;28
            </code>{' '}
            px, and font{' '}
            <code>
              12&nbsp;/&nbsp;13&nbsp;/&nbsp;15&nbsp;/&nbsp;17&nbsp;/&nbsp;20
            </code>{' '}
            px (v1 was a flat 15 px). The third column renders a stylised
            reference from the closest-feeling North-Star product. Primary text
            colours <em>and</em> shade ladders are now picked per-color
            per-theme based on WCAG contrast research. The default Primary
            ladder is <code>60&nbsp;→&nbsp;80&nbsp;→&nbsp;90</code> (light) /{' '}
            <code>40&nbsp;→&nbsp;20&nbsp;→&nbsp;10</code> (dark) — a two-shade
            jump on hover (was one shade), pushing visibility from 1.6 – 6 % ΔL
            into the 6 – 11 % band where Linear, Vercel, Material 3 and GitHub
            Primer sit. Bacon light walks{' '}
            <code>40&nbsp;→&nbsp;60&nbsp;→&nbsp;70</code>, burger dark{' '}
            <code>30&nbsp;→&nbsp;10&nbsp;→&nbsp;10</code>, onion dark{' '}
            <code>50&nbsp;→&nbsp;30&nbsp;→&nbsp;20</code> with white text. Four
            AA-tight cases (bacon, cabbage, water, ketchup-active in dark) stay
            on the smaller one-shade jump where the wider one would push the
            hover bg past the white-label contrast cliff — see the Buttons.mdx
            Contrast section for the full audit. Hover lift is a single neutral
            two-layer shadow (was a brand-tinted halo at 64 %); active stacks an
            inset two-layer press shadow on top of the ladder step.{' '}
            <strong>
              Ghost variants now brand-tint hover and active text in both themes
            </strong>{' '}
            — Tertiary / Float / Subtle / Option / Secondary all walk to the
            deepest shade (light <code>80&nbsp;→&nbsp;90</code>, dark{' '}
            <code>40&nbsp;→&nbsp;30</code> with <code>burger</code> /{' '}
            <code>onion</code> shifted to <code>30/20</code> /{' '}
            <code>20/10</code>) so light and dark behave the same. The five
            saturated brights on white (<code>blueCheese</code>,{' '}
            <code>avocado</code>, <code>lettuce</code>, <code>cheese</code>,{' '}
            <code>bun</code>) used to drop their label to{' '}
            <code>text-primary</code> because no shade reaches AA-large on white
            at any depth — they now ship the brand tint anyway and lean on the
            12 % bg overlay to carry brand cue (Linear / Notion / Vercel ship
            the same trade-off). Focus rings stay AA-bound and fall back to{' '}
            <code>accent-blueCheese</code> for <code>avocado</code> /{' '}
            <code>lettuce</code> / <code>cheese</code> so SC&nbsp;2.4.13 still
            holds for keyboard users.{' '}
            <strong>Float now ships a 15 % hairline border</strong> on top of
            its <code>surface-float</code> fill — half the weight of
            Subtle&apos;s 30 % border so the two stay distinct (Float = filled
            chip with edge, <em>Linear / Vercel / Notion / Stripe pattern</em>;
            Subtle = outlined chip, <em>Material 3 outlined pattern</em>).{' '}
            <strong>Card-action width contract:</strong> on a multi-column feed
            grid (where a card can render at 140 – 280 px), use{' '}
            <code>density=&quot;compact&quot;</code> on every{' '}
            <code>CardAction</code> and wrap the row in{' '}
            <code>&lt;CardActionBar layout=&quot;feedCard&quot;&gt;</code> — the
            bar then sits at <code>flex-1 min-w-0 justify-between</code>{' '}
            (matches v1 <code>ActionButtons</code> exactly), fills the
            card&apos;s grid track, and never pushes the card wider than its
            allowance. Comfortable (40 px) is reserved for single-column /
            post-detail / sticky bar where there&apos;s ≥ 320 px to breathe; see
            the <em>Width sweep</em> and <em>Anti-pattern</em> vignettes below
            for a side-by-side. House rule:{' '}
            <em>always rectangle with corner radius</em>; we don&apos;t ship
            oval pills.
          </p>

          <Section
            title="Comparison table"
            description="One row per variant × color. Same ButtonV2Props applied to OLD and NEW columns. The inspiration column renders the closest-feeling reference from Linear / Notion / ChatGPT / Claude (mapping shown in each cell)."
          >
            <div
              className="grid gap-px overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-border-subtlest-tertiary"
              style={{
                gridTemplateColumns: [
                  'minmax(120px, 140px)',
                  'minmax(120px, 140px)',
                  showOld ? '1fr' : null,
                  '1fr',
                  showInspiration ? '1fr' : null,
                ]
                  .filter(Boolean)
                  .join(' '),
              }}
            >
              <div className="bg-surface-float px-3 py-2 font-bold text-text-primary typo-footnote">
                Variant
              </div>
              <div className="bg-surface-float px-3 py-2 font-bold text-text-primary typo-footnote">
                Color
              </div>
              {showOld ? (
                <div className="bg-surface-float px-3 py-2 font-bold text-text-primary typo-footnote">
                  OLD ButtonV2
                </div>
              ) : null}
              <div className="bg-surface-float px-3 py-2 font-bold text-text-primary typo-footnote">
                NEW ButtonV2
              </div>
              {showInspiration ? (
                <div className="bg-surface-float px-3 py-2 font-bold text-text-primary typo-footnote">
                  Inspiration reference
                </div>
              ) : null}
              {variants.flatMap((variant) =>
                ALL_COLORS.map((color) => (
                  <ComparisonRow
                    key={`${variant}-${color ?? 'none'}`}
                    variant={variant}
                    color={color}
                    size={size}
                    state={state}
                    bg={bg}
                    showOld={showOld}
                    showInspiration={showInspiration}
                    useDefaultCursor={useDefaultCursor}
                  />
                )),
              )}
            </div>
          </Section>

          <Section
            title="Typography & text-color matrix"
            description="The exact label-color contract for each variant in each state — OLD vs NEW. Tokens marked * collide with the disabled palette in v1."
          >
            <TypographyMatrix />
          </Section>

          <Section
            title="Real layout vignettes"
            description="How the system reads in product context. Each card runs the same content twice: today vs proposed."
          >
            <div className="space-y-3">
              <VignetteRow
                title="Modal footer"
                showOld={showOld}
                oldNode={
                  <div className="flex justify-end gap-2">
                    <ButtonV2 variant={ButtonVariant.Float}>Cancel</ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Primary}
                      color={ButtonColor.Cabbage}
                    >
                      Save changes
                    </ButtonV2>
                  </div>
                }
                newNode={
                  <div className="flex justify-end gap-2">
                    <ButtonV2 variant={ButtonVariant.Float}>Cancel</ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Primary}
                      color={ButtonColor.Cabbage}
                    >
                      Save changes
                    </ButtonV2>
                  </div>
                }
              />
              <VignetteRow
                title="Card actions (Tertiary)"
                showOld={showOld}
                oldNode={
                  <div className="flex gap-1">
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      icon={<UpvoteIcon />}
                    >
                      Upvote
                    </ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      icon={<ShareIcon />}
                    >
                      Share
                    </ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Bun}
                      icon={<BookmarkIcon />}
                    >
                      Bookmark
                    </ButtonV2>
                  </div>
                }
                newNode={
                  <div className="flex gap-1">
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      icon={<UpvoteIcon />}
                    >
                      Upvote
                    </ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      icon={<ShareIcon />}
                    >
                      Share
                    </ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Bun}
                      icon={<BookmarkIcon />}
                    >
                      Bookmark
                    </ButtonV2>
                  </div>
                }
              />
              <VignetteRow
                title="Toolbar (icon-only Float)"
                showOld={showOld}
                oldNode={
                  <div className="flex gap-1">
                    <ButtonV2
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Medium}
                      icon={<PlusIcon />}
                    />
                    <ButtonV2
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Medium}
                      icon={<ShareIcon />}
                    />
                    <ButtonV2
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Medium}
                      icon={<StarIcon />}
                    />
                  </div>
                }
                newNode={
                  <div className="flex gap-1">
                    <ButtonV2
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Medium}
                      icon={<PlusIcon />}
                    />
                    <ButtonV2
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Medium}
                      icon={<ShareIcon />}
                    />
                    <ButtonV2
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Medium}
                      icon={<StarIcon />}
                    />
                  </div>
                }
              />
              <VignetteRow
                title="Chip / tag row — rectangle, no oval"
                showOld={showOld}
                oldNode={
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Rust', 'AI', 'Frontend'].map(
                      (tag) => (
                        <ButtonV2
                          key={`old-${tag}`}
                          variant={ButtonVariant.Float}
                          size={ButtonSize.Small}
                          icon={<PlusIcon />}
                          iconPosition={ButtonIconPosition.Right}
                        >
                          {tag}
                        </ButtonV2>
                      ),
                    )}
                  </div>
                }
                newNode={
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Rust', 'AI', 'Frontend'].map(
                      (tag) => (
                        <ButtonV2
                          key={`new-${tag}`}
                          variant={ButtonVariant.Float}
                          size={ButtonSize.Small}
                          icon={<PlusIcon />}
                          iconPosition={ButtonIconPosition.Right}
                        >
                          {tag}
                        </ButtonV2>
                      ),
                    )}
                  </div>
                }
              />
            </div>
          </Section>

          <Section
            title="Card actions / engagement bar"
            description="Dedicated v2 primitive for the upvote / comment / bookmark / share row that lives on every post card. Built on ButtonV2 (Tertiary). Two densities: comfortable (40 px) for single-column / post-detail / sticky bottom bar; compact (32 px) for multi-column feed grid cards, comment rows, dense menus. The feed-card vignettes below are wrapped in real production card-width containers — MIN 272 px (tablet 2-col grid, the floor at the 656 px breakpoint), 300 px (typical laptop 3-col), MAX 340 px (desktopL 21.25 rem clamp), and mobile single-column 360 px — so the width contract is visually verifiable. `density='compact'` + `<CardActionBar layout='feedCard'>` is the production rule for any grid card so the bar never pushes the card wider than its grid track."
          >
            <div className="space-y-3">
              <VignetteRow
                title="Feed card — icon-only, no counters (production MIN — tablet 2-col grid, 272 px)"
                showOld={showOld}
                oldNode={
                  <div className="w-[272px] rounded-12 border border-border-subtlest-tertiary p-3">
                    <div className="flex flex-1 items-center justify-between">
                      <ButtonV2
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Small}
                        color={ButtonColor.Avocado}
                        icon={<UpvoteIcon />}
                        aria-label="Upvote"
                      />
                      <ButtonV2
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Small}
                        color={ButtonColor.BlueCheese}
                        icon={<DiscussIcon />}
                        aria-label="Comment"
                      />
                      <ButtonV2
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Small}
                        color={ButtonColor.Bun}
                        icon={<BookmarkIcon />}
                        aria-label="Bookmark"
                      />
                      <ButtonV2
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Small}
                        icon={<ShareIcon />}
                        aria-label="Share"
                      />
                    </div>
                  </div>
                }
                newNode={
                  <div className="w-[272px] rounded-12 border border-border-subtlest-tertiary p-3">
                    <CardActionBar layout="feedCard">
                      <CardAction
                        density="compact"
                        icon={<UpvoteIcon />}
                        iconPressed={<UpvoteIcon secondary />}
                        label="Upvote"
                        color={ButtonColor.Avocado}
                      />
                      <CardAction
                        density="compact"
                        icon={<DiscussIcon />}
                        label="Comment"
                        color={ButtonColor.BlueCheese}
                      />
                      <CardAction
                        density="compact"
                        icon={<BookmarkIcon />}
                        iconPressed={<BookmarkIcon secondary />}
                        label="Bookmark"
                        color={ButtonColor.Bun}
                      />
                      <CardAction
                        density="compact"
                        icon={<ShareIcon />}
                        label="Share"
                      />
                    </CardActionBar>
                  </div>
                }
              />
              <VignetteRow
                title="Feed card — with counters (production MIN — tablet 2-col grid, 272 px)"
                showOld={showOld}
                oldNode={
                  <div className="w-[272px] rounded-12 border border-border-subtlest-tertiary p-3">
                    <div className="flex flex-1 items-center justify-between text-text-tertiary typo-footnote">
                      <span className="inline-flex items-center">
                        <ButtonV2
                          variant={ButtonVariant.Tertiary}
                          size={ButtonSize.Small}
                          color={ButtonColor.Avocado}
                          icon={<UpvoteIcon />}
                          aria-label="Upvote"
                        />
                        <span className="pl-1 tabular-nums">1.2K</span>
                      </span>
                      <span className="inline-flex items-center">
                        <ButtonV2
                          variant={ButtonVariant.Tertiary}
                          size={ButtonSize.Small}
                          color={ButtonColor.BlueCheese}
                          icon={<DiscussIcon />}
                          aria-label="Comment"
                        />
                        <span className="pl-1 tabular-nums">42</span>
                      </span>
                      <ButtonV2
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Small}
                        color={ButtonColor.Bun}
                        icon={<BookmarkIcon />}
                        aria-label="Bookmark"
                      />
                      <ButtonV2
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Small}
                        icon={<ShareIcon />}
                        aria-label="Share"
                      />
                    </div>
                  </div>
                }
                newNode={
                  <div className="w-[272px] rounded-12 border border-border-subtlest-tertiary p-3">
                    <CardActionBar layout="feedCard">
                      <CardAction
                        density="compact"
                        icon={<UpvoteIcon />}
                        iconPressed={<UpvoteIcon secondary />}
                        label="Upvote"
                        color={ButtonColor.Avocado}
                        count={1234}
                      />
                      <CardAction
                        density="compact"
                        icon={<DiscussIcon />}
                        label="Comment"
                        color={ButtonColor.BlueCheese}
                        count={42}
                      />
                      <CardAction
                        density="compact"
                        icon={<BookmarkIcon />}
                        iconPressed={<BookmarkIcon secondary />}
                        label="Bookmark"
                        color={ButtonColor.Bun}
                      />
                      <CardAction
                        density="compact"
                        icon={<ShareIcon />}
                        label="Share"
                      />
                    </CardActionBar>
                  </div>
                }
              />
              <VignetteRow
                title="Pressed (voted / bookmarked) — production MIN (tablet 2-col grid, 272 px)"
                showOld={showOld}
                oldNode={
                  <div className="w-[272px] rounded-12 border border-border-subtlest-tertiary p-3">
                    <div className="flex flex-1 items-center justify-between text-text-tertiary typo-footnote">
                      <span className="inline-flex items-center">
                        <ButtonV2
                          pressed
                          variant={ButtonVariant.Tertiary}
                          size={ButtonSize.Small}
                          color={ButtonColor.Avocado}
                          icon={<UpvoteIcon secondary />}
                          aria-label="Upvoted"
                        />
                        <span className="pl-1 tabular-nums">1.2K</span>
                      </span>
                      <span className="inline-flex items-center">
                        <ButtonV2
                          variant={ButtonVariant.Tertiary}
                          size={ButtonSize.Small}
                          color={ButtonColor.BlueCheese}
                          icon={<DiscussIcon />}
                          aria-label="Comment"
                        />
                        <span className="pl-1 tabular-nums">42</span>
                      </span>
                      <ButtonV2
                        pressed
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Small}
                        color={ButtonColor.Bun}
                        icon={<BookmarkIcon secondary />}
                        aria-label="Bookmarked"
                      />
                      <ButtonV2
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Small}
                        icon={<ShareIcon />}
                        aria-label="Share"
                      />
                    </div>
                  </div>
                }
                newNode={
                  <div className="w-[272px] rounded-12 border border-border-subtlest-tertiary p-3">
                    <CardActionBar layout="feedCard">
                      <CardAction
                        density="compact"
                        pressed
                        icon={<UpvoteIcon />}
                        iconPressed={<UpvoteIcon secondary />}
                        label="Upvoted"
                        color={ButtonColor.Avocado}
                        count={1235}
                      />
                      <CardAction
                        density="compact"
                        icon={<DiscussIcon />}
                        label="Comment"
                        color={ButtonColor.BlueCheese}
                        count={42}
                      />
                      <CardAction
                        density="compact"
                        pressed
                        icon={<BookmarkIcon />}
                        iconPressed={<BookmarkIcon secondary />}
                        label="Bookmarked"
                        color={ButtonColor.Bun}
                      />
                      <CardAction
                        density="compact"
                        icon={<ShareIcon />}
                        label="Share"
                      />
                    </CardActionBar>
                  </div>
                }
              />
              <VignetteRow
                title="Width sweep — same bar at production card widths (mobile 360 / MIN tablet 2-col 272 / typical 300 / MAX desktopL clamp 340)"
                showOld={showOld}
                oldNode={
                  <div className="space-y-2">
                    {[360, 340, 300, 272].map((w) => (
                      <div
                        key={w}
                        style={{ width: w }}
                        className="rounded-12 border border-border-subtlest-tertiary p-3"
                      >
                        <div className="mb-2 text-text-tertiary typo-caption1">
                          {w}px · v1 ActionButtons (Small / 32 px / flex-1
                          justify-between) — same physical footprint as v2
                          compact + feedCard, so swapping is layout-neutral
                        </div>
                        <div className="flex flex-1 items-center justify-between">
                          <ButtonV2
                            variant={ButtonVariant.Tertiary}
                            size={ButtonSize.Small}
                            color={ButtonColor.Avocado}
                            icon={<UpvoteIcon />}
                            aria-label="Upvote"
                          />
                          <ButtonV2
                            variant={ButtonVariant.Tertiary}
                            size={ButtonSize.Small}
                            color={ButtonColor.Ketchup}
                            icon={<DownvoteIcon />}
                            aria-label="Downvote"
                          />
                          <ButtonV2
                            variant={ButtonVariant.Tertiary}
                            size={ButtonSize.Small}
                            color={ButtonColor.BlueCheese}
                            icon={<DiscussIcon />}
                            aria-label="Comment"
                          />
                          <ButtonV2
                            variant={ButtonVariant.Tertiary}
                            size={ButtonSize.Small}
                            color={ButtonColor.Bun}
                            icon={<BookmarkIcon />}
                            aria-label="Bookmark"
                          />
                          <ButtonV2
                            variant={ButtonVariant.Tertiary}
                            size={ButtonSize.Small}
                            icon={<ShareIcon />}
                            aria-label="Share"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                }
                newNode={
                  <div className="space-y-2">
                    {[360, 340, 300, 272].map((w) => (
                      <div
                        key={w}
                        style={{ width: w }}
                        className="rounded-12 border border-border-subtlest-tertiary p-3"
                      >
                        <div className="mb-2 text-text-tertiary typo-caption1">
                          {w}px · CardAction compact + CardActionBar feedCard
                        </div>
                        <CardActionBar layout="feedCard">
                          <CardAction
                            density="compact"
                            icon={<UpvoteIcon />}
                            iconPressed={<UpvoteIcon secondary />}
                            label="Upvote"
                            color={ButtonColor.Avocado}
                          />
                          <CardAction
                            density="compact"
                            icon={<DownvoteIcon />}
                            iconPressed={<DownvoteIcon secondary />}
                            label="Downvote"
                            color={ButtonColor.Ketchup}
                          />
                          <CardAction
                            density="compact"
                            icon={<DiscussIcon />}
                            label="Comment"
                            color={ButtonColor.BlueCheese}
                          />
                          <CardAction
                            density="compact"
                            icon={<BookmarkIcon />}
                            iconPressed={<BookmarkIcon secondary />}
                            label="Bookmark"
                            color={ButtonColor.Bun}
                          />
                          <CardAction
                            density="compact"
                            icon={<ShareIcon />}
                            label="Share"
                          />
                        </CardActionBar>
                      </div>
                    ))}
                  </div>
                }
              />
              <VignetteRow
                title="Anti-pattern — comfortable density at production MIN 272 px (tablet 2-col floor; overflows; do NOT do this)"
                showOld={showOld}
                oldNode={
                  <div className="w-[272px] rounded-12 border border-border-subtlest-tertiary p-3">
                    <div className="text-text-tertiary typo-caption1">
                      v1 didn&apos;t allow this — `Small` (32 px) was the only
                      option on `ActionButtons`.
                    </div>
                  </div>
                }
                newNode={
                  <div className="space-y-3">
                    <div className="w-[272px] overflow-x-auto rounded-12 border border-accent-ketchup-default p-3">
                      <div className="mb-2 text-accent-ketchup-default typo-caption1">
                        WRONG @ 272 px (production MIN — tablet 2-col grid) ·
                        CardActionBar default + comfortable — bar pushes wider
                        than card; the card scrolls horizontally (or the grid
                        track breaks)
                      </div>
                      <CardActionBar>
                        <CardAction
                          icon={<UpvoteIcon />}
                          iconPressed={<UpvoteIcon secondary />}
                          label="Upvote"
                          color={ButtonColor.Avocado}
                          count={1234}
                        />
                        <CardAction
                          icon={<DownvoteIcon />}
                          iconPressed={<DownvoteIcon secondary />}
                          label="Downvote"
                          color={ButtonColor.Ketchup}
                        />
                        <CardAction
                          icon={<DiscussIcon />}
                          label="Comment"
                          color={ButtonColor.BlueCheese}
                          count={42}
                        />
                        <CardAction
                          icon={<BookmarkIcon />}
                          iconPressed={<BookmarkIcon secondary />}
                          label="Bookmark"
                          color={ButtonColor.Bun}
                        />
                        <CardAction icon={<ShareIcon />} label="Share" />
                      </CardActionBar>
                    </div>
                    <div className="w-[272px] rounded-12 border border-accent-avocado-default p-3">
                      <div className="mb-2 text-accent-avocado-default typo-caption1">
                        RIGHT @ 272 px · feedCard layout + compact density — bar
                        fills 272 px, distributes children, never pushes the
                        card
                      </div>
                      <CardActionBar layout="feedCard">
                        <CardAction
                          density="compact"
                          icon={<UpvoteIcon />}
                          iconPressed={<UpvoteIcon secondary />}
                          label="Upvote"
                          color={ButtonColor.Avocado}
                          count={1234}
                        />
                        <CardAction
                          density="compact"
                          icon={<DownvoteIcon />}
                          iconPressed={<DownvoteIcon secondary />}
                          label="Downvote"
                          color={ButtonColor.Ketchup}
                        />
                        <CardAction
                          density="compact"
                          icon={<DiscussIcon />}
                          label="Comment"
                          color={ButtonColor.BlueCheese}
                          count={42}
                        />
                        <CardAction
                          density="compact"
                          icon={<BookmarkIcon />}
                          iconPressed={<BookmarkIcon secondary />}
                          label="Bookmark"
                          color={ButtonColor.Bun}
                        />
                        <CardAction
                          density="compact"
                          icon={<ShareIcon />}
                          label="Share"
                        />
                      </CardActionBar>
                    </div>
                  </div>
                }
              />
              <VignetteRow
                title="Real feed-card simulation — production breakpoints (MIN tablet 2-col 272 px → MAX desktopL clamp 340 px → list view 700 / 900 px)"
                showOld={showOld}
                oldNode={
                  <div className="space-y-4">
                    <div className="text-text-tertiary typo-caption1">
                      Faithful mock of `ArticleGrid` / `ArticleList` (header,
                      title, tags, meta, image, engagement bar — all using the
                      production `mx-4` Container + `px-1 pb-1` action-bar
                      chrome from the real card components). Widths track the
                      real breakpoints driven by `FeedContext` (eco mode):
                      mobile 360 px (1-col), MIN 272 px (tablet 2-col floor at
                      656 px), 300 px (typical laptop / laptopL 3-4 col), MAX
                      340 px (desktopL+ 21.25 rem clamp), and list view 700 /
                      900 px (single-column post-page / wide list view).
                    </div>
                    <MockFeedCard
                      width={360}
                      title="360 px · mobile single column (~iPhone 13/14 with side padding)"
                      engagement={<V1EngagementBar pressed />}
                    />
                    <MockFeedCard
                      width={272}
                      title="272 px · MIN — tablet 2-col grid floor (the tightest production card)"
                      engagement={<V1EngagementBar />}
                    />
                    <MockFeedCard
                      width={300}
                      title="300 px · typical laptop / laptopL 3-4 col grid"
                      engagement={<V1EngagementBar pressed />}
                    />
                    <MockFeedCard
                      width={340}
                      title="340 px · MAX — desktopL+ clamp (21.25 rem per card)"
                      engagement={<V1EngagementBar pressed />}
                    />
                    <MockListCard
                      width={700}
                      title="700 px · list view single column on standard desktop"
                      engagement={<V1EngagementBar />}
                    />
                    <MockListCard
                      width={900}
                      title="900 px · list view single column on wide desktop / max realistic list-card width"
                      engagement={<V1EngagementBar pressed />}
                    />
                  </div>
                }
                newNode={
                  <div className="space-y-4">
                    <div className="text-text-tertiary typo-caption1">
                      Same mock — engagement bar swapped to v2{' '}
                      <code>
                        &lt;CardActionBar layout=&quot;feedCard&quot;&gt;
                      </code>{' '}
                      + every action at <code>density=&quot;compact&quot;</code>
                      . Footprint matches v1 exactly so every card lays out
                      identically; press states gain the v2 inset shadow +
                      brand-tinted hover label automatically. Widths track the
                      real production breakpoints (MIN 272 px, MAX 340 px on
                      grid; 360 mobile single-col; 700 / 900 list view).
                    </div>
                    <MockFeedCard
                      width={360}
                      title="360 px · mobile single column (~iPhone 13/14 with side padding)"
                      engagement={<V2EngagementBar pressed />}
                    />
                    <MockFeedCard
                      width={272}
                      title="272 px · MIN — tablet 2-col grid floor (the tightest production card)"
                      engagement={<V2EngagementBar />}
                    />
                    <MockFeedCard
                      width={300}
                      title="300 px · typical laptop / laptopL 3-4 col grid"
                      engagement={<V2EngagementBar pressed />}
                    />
                    <MockFeedCard
                      width={340}
                      title="340 px · MAX — desktopL+ clamp (21.25 rem per card)"
                      engagement={<V2EngagementBar pressed />}
                    />
                    <MockListCard
                      width={700}
                      title="700 px · list view single column on standard desktop"
                      engagement={<V2EngagementBar />}
                    />
                    <MockListCard
                      width={900}
                      title="900 px · list view single column on wide desktop / max realistic list-card width"
                      engagement={<V2EngagementBar pressed />}
                    />
                  </div>
                }
              />
              <VignetteRow
                title="Post detail — labels visible, between layout"
                showOld={showOld}
                oldNode={
                  <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary p-2">
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Avocado}
                      icon={<UpvoteIcon />}
                    >
                      Upvote
                    </ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.BlueCheese}
                      icon={<DiscussIcon />}
                    >
                      Comment
                    </ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Cabbage}
                      icon={<MedalBadgeIcon />}
                    >
                      Award
                    </ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Bun}
                      icon={<BookmarkIcon />}
                    >
                      Bookmark
                    </ButtonV2>
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      icon={<CopyIcon />}
                    >
                      Copy
                    </ButtonV2>
                  </div>
                }
                newNode={
                  <CardActionBar
                    layout="between"
                    className="rounded-16 border border-border-subtlest-tertiary p-2"
                  >
                    <CardAction
                      icon={<UpvoteIcon />}
                      iconPressed={<UpvoteIcon secondary />}
                      label="Upvote"
                      labelVisible
                      color={ButtonColor.Avocado}
                    />
                    <CardAction
                      icon={<DiscussIcon />}
                      label="Comment"
                      labelVisible
                      color={ButtonColor.BlueCheese}
                    />
                    <CardAction
                      icon={<MedalBadgeIcon />}
                      label="Award"
                      labelVisible
                      color={ButtonColor.Cabbage}
                    />
                    <CardAction
                      icon={<BookmarkIcon />}
                      iconPressed={<BookmarkIcon secondary />}
                      label="Bookmark"
                      labelVisible
                      color={ButtonColor.Bun}
                    />
                    <CardAction icon={<CopyIcon />} label="Copy" labelVisible />
                  </CardActionBar>
                }
              />
              <VignetteRow
                title="Comment row — compact density"
                showOld={showOld}
                oldNode={
                  <div className="flex items-center gap-1 text-text-tertiary typo-footnote">
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Avocado}
                      icon={<UpvoteIcon />}
                      aria-label="Upvote"
                    />
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Ketchup}
                      icon={<DownvoteIcon />}
                      aria-label="Downvote"
                    />
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      icon={<DiscussIcon />}
                      aria-label="Reply"
                    />
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Cabbage}
                      icon={<MedalBadgeIcon />}
                      aria-label="Award"
                    />
                    <span className="ml-auto">3 upvotes</span>
                  </div>
                }
                newNode={
                  <CardActionBar layout="compact">
                    <CardAction
                      density="compact"
                      icon={<UpvoteIcon />}
                      iconPressed={<UpvoteIcon secondary />}
                      label="Upvote"
                      color={ButtonColor.Avocado}
                    />
                    <CardAction
                      density="compact"
                      icon={<DownvoteIcon />}
                      iconPressed={<DownvoteIcon secondary />}
                      label="Downvote"
                      color={ButtonColor.Ketchup}
                    />
                    <CardAction
                      density="compact"
                      icon={<DiscussIcon />}
                      label="Reply"
                    />
                    <CardAction
                      density="compact"
                      icon={<MedalBadgeIcon />}
                      label="Award"
                      color={ButtonColor.Cabbage}
                    />
                    <span className="ml-auto text-text-tertiary typo-footnote">
                      3 upvotes
                    </span>
                  </CardActionBar>
                }
              />
              <VignetteRow
                title="Sticky bottom bar (mobile pattern)"
                showOld={showOld}
                oldNode={
                  <div className="flex items-center justify-around border-t border-border-subtlest-tertiary bg-background-default p-2">
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Avocado}
                      icon={<UpvoteIcon />}
                      aria-label="Upvote"
                    />
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.BlueCheese}
                      icon={<DiscussIcon />}
                      aria-label="Comment"
                    />
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      color={ButtonColor.Bun}
                      icon={<BookmarkIcon />}
                      aria-label="Bookmark"
                    />
                    <ButtonV2
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      icon={<ShareIcon />}
                      aria-label="Share"
                    />
                  </div>
                }
                newNode={
                  <CardActionBar
                    layout="between"
                    className="border-t border-border-subtlest-tertiary bg-background-default p-2"
                  >
                    <CardAction
                      icon={<UpvoteIcon />}
                      iconPressed={<UpvoteIcon secondary />}
                      label="Upvote"
                      color={ButtonColor.Avocado}
                      count={1234}
                    />
                    <CardAction
                      icon={<DiscussIcon />}
                      label="Comment"
                      color={ButtonColor.BlueCheese}
                      count={42}
                    />
                    <CardAction
                      icon={<BookmarkIcon />}
                      iconPressed={<BookmarkIcon secondary />}
                      label="Bookmark"
                      color={ButtonColor.Bun}
                    />
                    <CardAction icon={<ShareIcon />} label="Share" />
                  </CardActionBar>
                }
              />
            </div>
          </Section>

          <Section
            title="Feed card + post-page action bar — full width sweep"
            description="Two stress-tests of the engagement bar at every realistic resolution it has to work at. (1) Feed card at production breakpoints — mobile single-col 360 px, MIN 272 px (tablet 2-col floor), 300 px (typical 3-4 col), MAX 340 px (desktopL+ 21.25 rem clamp), and list view 700 / 900 px — so we see the bar inside the real card chrome at every width the grid renders. (2) Post-page / post-modal action bar at 320 → 800 px, which is the live responsive surface — labels must collapse to icon-only when the bar would overflow, and re-expand when the container grows. Both v1 (production-faithful clone with the same ResizeObserver mechanic) and v2 (CardActionBar+CardAction with a React hook mirroring it) are rendered at the same widths so the contract is identical."
          >
            <div className="space-y-10">
              <div>
                <h3 className="mb-2 font-bold text-text-primary typo-callout">
                  Feed grid card — engagement bar inside the real production
                  breakpoints (mobile 360 / MIN 272 / 300 / MAX 340)
                </h3>
                <p className="mb-3 text-text-tertiary typo-footnote">
                  Faithful card chrome (header + title + tag + meta + image +
                  bar — no divider, the bar sits flush inside the production{' '}
                  <code>mx-4</code> Container with the grid variant&apos;s{' '}
                  <code>px-1 pb-1</code> from <code>ActionButtons.tsx</code>)
                  with the v1 production engagement-bar pattern on the OLD
                  column and{' '}
                  <code>&lt;CardActionBar layout=&quot;feedCard&quot;&gt;</code>{' '}
                  + <code>density=&quot;compact&quot;</code> on the NEW. v1 and
                  v2 footprints are identical (32 px Small / Compact, 5 actions
                  on flex-1 justify-between) so cards lay out the same at every
                  grid column count. Card widths are pinned to the real
                  `FeedContext` (eco mode) breakpoints so the bar is always
                  inside the card boundary.
                </p>
                <div className="lg:grid-cols-2 grid grid-cols-1 gap-4">
                  <WidthProbe
                    width={360}
                    label="mobile single column (~iPhone 13/14 with side padding)"
                  >
                    <MockFeedCard
                      width={360}
                      title="360 px · mobile single column"
                      engagement={<V2EngagementBar pressed />}
                    />
                  </WidthProbe>
                  <WidthProbe
                    width={272}
                    label="MIN — tablet 2-col grid floor (656 px breakpoint)"
                  >
                    <MockFeedCard
                      width={272}
                      title="272 px · MIN — tightest production card"
                      engagement={<V2EngagementBar />}
                    />
                  </WidthProbe>
                  <WidthProbe
                    width={300}
                    label="typical laptop / laptopL 3-4 col grid"
                  >
                    <MockFeedCard
                      width={300}
                      title="300 px · typical laptop / laptopL 3-4 col"
                      engagement={<V2EngagementBar pressed />}
                    />
                  </WidthProbe>
                  <WidthProbe
                    width={340}
                    label="MAX — desktopL+ 21.25 rem clamp"
                  >
                    <MockFeedCard
                      width={340}
                      title="340 px · MAX — desktopL+ clamp"
                      engagement={<V2EngagementBar pressed />}
                    />
                  </WidthProbe>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-bold text-text-primary typo-callout">
                  Feed list card — engagement bar inside a 700 / 900 px row
                </h3>
                <div className="space-y-4">
                  <WidthProbe
                    width={700}
                    label="List view single column (standard desktop)"
                  >
                    <MockListCard
                      width={700}
                      title="700 px · list view single column on standard desktop"
                      engagement={<V2EngagementBar />}
                    />
                  </WidthProbe>
                  <WidthProbe
                    width={900}
                    label="List view single column (wide desktop / max realistic feed-card width)"
                  >
                    <MockListCard
                      width={900}
                      title="900 px · list view single column on wide desktop / max realistic feed-card width"
                      engagement={<V2EngagementBar pressed />}
                    />
                  </WidthProbe>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-bold text-text-primary typo-callout">
                  Post-page / post-modal action bar — v1 (production-faithful)
                  at 320 → 800 px
                </h3>
                <p className="mb-3 text-text-tertiary typo-footnote">
                  Mirrors{' '}
                  <code>
                    packages/shared/src/components/post/PostActions.tsx
                  </code>{' '}
                  exactly — same JSX, same border-wrapped chrome, same six
                  actions in the same order (Upvote / Downvote / Comment / Award
                  / Bookmark / Copy), same icons (<code>MedalBadgeIcon</code>{' '}
                  for Award, <code>LinkIcon</code> for Copy), and the same{' '}
                  <code>ResizeObserver</code> hiding every{' '}
                  <code>.btn-quaternary label</code> when the bar would overflow
                  (lines 181 – 211 of the source). Stand-alone (no{' '}
                  <code>AuthContext</code> / vote / award side-effects) so it
                  runs inside the dev page&apos;s minimal provider tree. Resize
                  the browser horizontally to confirm — at every probe the bar
                  settles to full-label or icon-only and never clips an icon.
                  The 320 / 480 cases trigger the icon-only collapse (mobile
                  webview / tablet portrait); 600 / 800 keep all 4 labels.
                </p>
                <div className="space-y-3">
                  {[320, 480, 600, 800].map((width) => (
                    <WidthProbe
                      key={width}
                      width={width}
                      label={labelForPostBarWidth(width)}
                    >
                      <PostActionsV1Clone
                        pressedUpvote={width === 480 || width === 800}
                        pressedBookmark={width === 600}
                        awarded={width === 800}
                      />
                    </WidthProbe>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-bold text-text-primary typo-callout">
                  Post-page / post-modal action bar — v2 equivalent at the same
                  widths
                </h3>
                <p className="mb-3 text-text-tertiary typo-footnote">
                  Direct v2 port — same 6 actions, same{' '}
                  <code>flex flex-1 items-center justify-between gap-x-1</code>{' '}
                  layout, same <code>MedalBadgeIcon</code> for Award and{' '}
                  <code>LinkIcon</code> for Copy as production. The hook (
                  <code>usePostActionsLabelVisibility</code>) byte-mirrors the
                  v1 mechanic: every <code>CardAction</code> renders with{' '}
                  <code>labelVisible</code> always-on so the label always lives
                  in the DOM, and on every <code>ResizeObserver</code> tick the
                  hook removes the <code>hidden</code> class to force-measure
                  the natural width, then re-adds it if the bar would overflow.
                  When collapsed, the hook hides the entire{' '}
                  <code>.card-action-content</code> wrapper (not just the inner
                  label span) so the wrapper exits the flex layout and the{' '}
                  <code>.btn-v2:has(&gt; .card-action-content.hidden)</code>{' '}
                  rule in <code>buttons-v2.css</code> drops the button to{' '}
                  <code>padding: 0</code> + <code>aspect-ratio: 1/1</code> —{' '}
                  guaranteeing every collapsed action lands as a true{' '}
                  <strong>40 × 40 square</strong> hit (or 32 × 32 in compact
                  density). Upvote / Downvote stay icon-only at every width
                  (matches v1). Pressed states inherit the v2 brand-tinted text
                  + inset shadow automatically — bookmark&apos;s filled icon and
                  label both pick up the bun (orange) tint via{' '}
                  <code>currentColor</code> on the SVG, so icon and text always
                  match.
                </p>
                <div className="space-y-3">
                  {[320, 480, 600, 800].map((width) => (
                    <WidthProbe
                      key={width}
                      width={width}
                      label={labelForPostBarWidth(width)}
                    >
                      <PostActionsV2
                        pressedUpvote={width === 480 || width === 800}
                        pressedBookmark={width === 600}
                        awarded={width === 800}
                      />
                    </WidthProbe>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section
            title="Inspiration anchors"
            description="The four products this system borrows from. Each row pairs the lesson with our take."
          >
            <div className="lg:grid-cols-2 grid gap-3">
              <Vignette title="Linear — tight radius, ring focus">
                <ButtonV2 variant={ButtonVariant.Tertiary}>
                  Ghost label
                </ButtonV2>
                <p className="mt-3 text-text-tertiary typo-caption1">
                  Tight 6–8 px radii, focus = accent ring (no transform).
                </p>
              </Vignette>
              <Vignette title="Notion — warm restraint" bg="float">
                <ButtonV2 variant={ButtonVariant.Float}>Float button</ButtonV2>
                <p className="mt-3 text-text-tertiary typo-caption1">
                  Hover = warm bg shift, no scale. &ldquo;Pencil on
                  paper&rdquo;.
                </p>
              </Vignette>
              <Vignette title="ChatGPT — quiet ghost, restrained CTA">
                <div className="flex items-center gap-3">
                  <ButtonV2
                    variant={ButtonVariant.Primary}
                    color={ButtonColor.Cabbage}
                    size={ButtonSize.Small}
                  >
                    Brand CTA
                  </ButtonV2>
                  <ButtonV2
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                  >
                    Ghost chip
                  </ButtonV2>
                </div>
                <p className="mt-3 text-text-tertiary typo-caption1">
                  We borrow ChatGPT&apos;s ghost-default restraint and semibold
                  weight, but stay rectangular — no oval pills.
                </p>
              </Vignette>
              <Vignette title="Claude — sequential color ladder">
                <div className="flex items-center gap-3">
                  <ButtonV2
                    variant={ButtonVariant.Primary}
                    color={ButtonColor.Bun}
                  >
                    Brand CTA
                  </ButtonV2>
                </div>
                <p className="mt-3 text-text-tertiary typo-caption1">
                  60 → 70 → 80 (light) / 40 → 30 → 20 (dark) for default → hover
                  → active. Per-variant focus ring.
                </p>
              </Vignette>
            </div>
          </Section>

          <p className="mt-8 text-text-tertiary typo-caption1">
            Worktree: <code>feat/button-system-overhaul</code> ·{' '}
            <code>btn-v2-*</code> namespace · zero production impact until
            promoted.
          </p>
        </main>
      </div>
    </ProductionGate>
  );
};

ButtonsDevPage.getLayout = (page: ReactNode): ReactNode => page;

export default ButtonsDevPage;
