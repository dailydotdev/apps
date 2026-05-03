import type {
  HTMLAttributes,
  ReactElement,
  Ref,
  MouseEventHandler,
} from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { ButtonV2 } from './ButtonV2';
import type { AllowedElements } from './ButtonV2';
import { ButtonSize, ButtonVariant, ButtonIconPosition } from './common';
import type { ColorName } from '../../styles/colors';
import InteractionCounter from '../InteractionCounter';

/**
 * `CardAction` — purpose-built primitive for the engagement row that
 * appears on every post / comment / share card (Upvote, Downvote,
 * Comment, Award, Bookmark, Share).
 *
 * Why a dedicated primitive instead of plain `ButtonV2`:
 *
 * - The pattern surfaces in 5+ places (feed grid, feed list, post
 *   detail, comment row, modal) and historically each site re-derived
 *   icon-only sizing, counter rendering, pressed-icon swap, and
 *   responsive label hiding. Extracting them removes 4 sources of
 *   accidental drift.
 * - Touch ergonomics. Card actions ship at `Tertiary / Small` today
 *   (32 px), which sits below WCAG 2.5.5 AAA (44 px), Apple HIG
 *   (44 pt) and Material 3 (48 dp). Twitter/X, Reddit, YouTube,
 *   dev.to, LinkedIn and Substack all target 36 – 40 px desktop /
 *   44 px+ mobile. `CardAction` defaults to **comfortable = 40 px**
 *   (`ButtonSize.Medium`) and exposes `density="compact"` (32 px) for
 *   genuinely tight contexts (toolbars, dense menus, **and feed grid
 *   cards** — see "Card width contract" below).
 * - The counter is part of the click target (Reddit / X pattern), not
 *   a sibling text node like `QuaternaryButton`. One affordance, one
 *   click target — clearer for screen readers and easier to hit.
 *
 * **Card width contract** — pick the density that matches the
 * surface, not the touch-target ideal in the abstract:
 *
 * | Surface                                        | Density       |
 * | ---                                            | ---           |
 * | Single-column mobile feed                      | `comfortable` |
 * | Post-detail action strip                       | `comfortable` |
 * | Sticky bottom bar (mobile webview / modal)     | `comfortable` |
 * | **Multi-column feed grid card (2+ columns)**   | **`compact`** |
 * | Comment row                                    | `compact`     |
 * | Dense menu / toolbar                           | `compact`     |
 *
 * The reason: a feed grid card is sized by the production
 * `FeedContext` (eco mode) → `Feed.module.css` chain, which clamps
 * each card at **272 px (MIN, the moment 2-col grid kicks in at the
 * `tablet` 656 px breakpoint) → 340 px (MAX, the `21.25 rem`
 * `desktopL+` clamp)**. 5 actions at 40 px + counters easily exceeds
 * 272 – 340 px and overflows narrow cards, **breaking the grid
 * track**. v1 `ActionButtons` shipped at `Small` (32 px) for exactly
 * this reason. Pair `density="compact"` with
 * `<CardActionBar layout="feedCard">` to inherit the v1 width
 * contract (`flex-1 min-w-0 justify-between`).
 *
 * Pressed state pattern: pass `iconPressed` to swap the icon (e.g.
 * outline → filled upvote arrow); the underlying `ButtonV2` already
 * handles `aria-pressed`, the deeper-shade press background, and the
 * inset press-feedback shadow.
 */
export type CardActionDensity = 'comfortable' | 'compact';

const densityToSize: Record<CardActionDensity, ButtonSize> = {
  comfortable: ButtonSize.Medium,
  compact: ButtonSize.Small,
};

/**
 * Icon size override per density, intentionally larger than the
 * default `buttonSizeToIconSizeV2` map.
 *
 * Default ButtonV2 icon scaling targets a 50 % icon-to-button ratio
 * (Tailwind UI / GitHub Primer style). That works for action buttons
 * inside chrome (toolbars, modals, page headers) where the icon
 * accompanies a label or sits next to other affordances. It is
 * **noticeably under-sized for engagement bars**, where icons often
 * stand alone, identify the action, and have to read at a glance from
 * a feed scroll.
 *
 * Reference platforms cluster at 50 – 62 % ratios for engagement-bar
 * icons:
 *
 *   Reddit (post action bar)  20 / 36 = 56 %
 *   X / Twitter (tweet bar)   18 – 20 / 32 – 36 = 50 – 62 %
 *   LinkedIn (post bar)       20 / 40 = 50 % (with text label)
 *   Facebook (engagement)     18 – 20 / 36 = 50 – 56 %
 *   Instagram (post bar)      24 / 40 = 60 %
 *   YouTube (video bar)       20 / 36 = 56 % (with text label)
 *   Material 3 default        24 / 40 = 60 %
 *   Material 3 small          20 – 24 / 32 = 62 – 75 %
 *   Claude (message bar)      18 / 32 = 56 %
 *   ChatGPT (message bar)     16 / 32 = 50 % (hover-only bar, accepts smaller)
 *
 * Our default 16 / 32 (compact) sat at the bottom of the band — same
 * size as ChatGPT, which compensates with hover-only visibility.
 * Engagement bars on a feed are *always* visible, so they need to read
 * one step bigger.
 *
 *   comfortable  24 px in 40 px   = 60 %  (M3 default, Instagram)
 *   compact      20 px in 32 px   = 62 %  (M3 small icon button, X mobile)
 *
 * Consumers can still override per-instance by passing an icon with an
 * explicit `size` prop — `useGetIconWithSizeV2` in `common.ts` honours
 * `icon.props.size ?? buttonSizeToIconSizeV2[size]`.
 */
const densityToIconSize: Record<CardActionDensity, IconSize> = {
  comfortable: IconSize.Small, // 24 px
  compact: IconSize.XSmall, // 20 px
};

type IconElement = React.ReactElement<IconProps>;

// Pass-through HTML attributes (id, role, aria-*, data-*, type, etc.)
// for the underlying button / anchor element. Excludes the few props
// we own explicitly (icon, label, onClick, etc.) so the public API
// stays unambiguous.
type CardActionPassthroughProps = Omit<
  HTMLAttributes<AllowedElements>,
  | 'children'
  | 'className'
  | 'onClick'
  | 'aria-label'
  | 'aria-pressed'
  | 'aria-busy'
  | 'aria-disabled'
>;

type CardActionBaseProps = CardActionPassthroughProps & {
  /** Icon shown in the default (idle) state. */
  icon: IconElement;
  /**
   * Optional pressed-state icon. Falls back to `icon` if omitted; pass
   * a `secondary`-variant icon (e.g. filled upvote) for the
   * "voted-on" affordance.
   */
  iconPressed?: IconElement;
  /**
   * Required for accessibility. Becomes the `aria-label` when the
   * button is icon-only; renders inline when `labelVisible` is true.
   */
  label: string;
  /**
   * Optional engagement counter. Hidden when null / undefined / 0 to
   * match the convention across reference platforms — an empty count
   * adds visual noise without adding signal.
   */
  count?: number | null;
  /**
   * Branded color applied via the underlying `Tertiary` variant —
   * tints hover, active, and pressed text + bg-overlay. Pick by
   * intent (Avocado upvote, Ketchup downvote, BlueCheese comment,
   * Cabbage award, Bun bookmark).
   */
  color?: ColorName;
  pressed?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /**
   * - `'comfortable'` = 40 px. Use on **single-column mobile feed**,
   *   **post-detail strip**, and **sticky bottom bar** where the
   *   container is ≥ 320 px and the row can breathe. Default.
   * - `'compact'` = 32 px. Use on **multi-column feed grid cards**
   *   (2+ columns), **comment rows**, and **dense menus / toolbars**
   *   where the container can be 140 – 280 px wide. 40 px overflows
   *   here and breaks the card width — see the "Card width contract"
   *   block at the top of this file.
   */
  density?: CardActionDensity;
  /**
   * Render the label inline next to the icon (post-detail strip
   * pattern: "Comment", "Award"). Off by default — most surfaces are
   * icon-only with the label living in the `aria-label`.
   */
  labelVisible?: boolean;
  className?: string;
  buttonClassName?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * When provided, renders as `<a>` instead of `<button>`. Useful for
   * the Comment action which navigates to the thread on feed cards.
   */
  href?: string;
};

function CardActionComponent(
  {
    icon,
    iconPressed,
    label,
    count,
    color,
    pressed,
    loading,
    disabled,
    density = 'comfortable',
    labelVisible,
    className,
    buttonClassName,
    onClick,
    href,
    ...rest
  }: CardActionBaseProps,
  ref?: Ref<AllowedElements>,
): ReactElement {
  const size = densityToSize[density];
  const baseIcon = pressed && iconPressed ? iconPressed : icon;
  // Apply the engagement-bar icon size unless the consumer has
  // explicitly set one on the icon prop (escape hatch for unusual
  // contexts — e.g. a brand glyph that needs a fixed dimension).
  const renderIcon = baseIcon.props.size
    ? baseIcon
    : React.cloneElement(baseIcon, { size: densityToIconSize[density] });
  const showCount = typeof count === 'number' && count > 0;
  const showLabel = !!labelVisible;
  const hasContent = showCount || showLabel;

  return (
    <ButtonV2
      {...rest}
      ref={ref}
      tag={href ? 'a' : 'button'}
      href={href}
      variant={ButtonVariant.Tertiary}
      size={size}
      color={color}
      pressed={pressed}
      loading={loading}
      disabled={disabled}
      icon={renderIcon}
      iconPosition={ButtonIconPosition.Left}
      onClick={onClick}
      aria-label={label}
      className={classNames(
        // When count or label render as children, ButtonV2 drops
        // icon-only square sizing and grows horizontally — for the
        // 40 px (comfortable) row we add a micro-min so short counts
        // ("1") don't collapse below the icon-only square. The 32 px
        // (compact) row needs no floor: the icon already drives a
        // 32 px square minimum.
        hasContent && density === 'comfortable' && 'min-w-[2.5rem]',
        // Engagement-bar tightening: when the button shows ONLY a
        // counter (no inline label), drop the standard `Tertiary`
        // padding + icon gap so the 5-action row fits inside the
        // production-MIN 272 px feed card.
        //
        // ButtonV2's `Small` size ships `px-3 + gap-1.5` (12 + 6 px)
        // — calibrated for toolbar / card-row buttons where each
        // button stands alone with a label. Engagement bars are a
        // different beast: 5 actions packed onto a card whose
        // content area is ~232 px (272 px MIN − 40 px chrome), so
        // we need V1's footprint where the counter sat OUTSIDE the
        // button as a sibling span. We bring the count INSIDE the
        // click target (Reddit / X pattern — one affordance, one
        // tap) but match V1's pixel budget by tightening padding
        // and gap. Math at 272 px MIN with 5 actions (Upvote 1.2K,
        // Downvote, Comment 42, Bookmark, Copy):
        //
        //   default `px-3 gap-1.5`  → 80 + 32 + 66 + 32 + 32 = 242 px → overflows
        //   tightened (this rule)   → 64 + 32 + 52 + 32 + 32 = 212 px → fits
        //
        // Same compact applies to comfortable density (40 px row) —
        // a 5-action post-detail bar at 320 px gets the same
        // breathing-room budget. Label-mode (inline text) keeps the
        // standard padding because Comment / Award / Bookmark labels
        // need the breathing room ButtonV2 is calibrated for.
        showCount && !showLabel && '!gap-1 !px-1.5',
        // Never push the parent (card / bar / cell) wider than its
        // grid track. Without this, a long label or counter on a
        // 4 – 7-col feed grid would overflow horizontally.
        'max-w-full',
        className,
        buttonClassName,
      )}
    >
      {hasContent && (
        // `card-action-content` is the stable hook target for the
        // post-detail responsive collapse (see
        // `usePostActionsLabelVisibility`). Hiding this wrapper —
        // not the inner label — is what makes the button drop back
        // to a true icon-only square: `display:none` removes the
        // wrapper from the flex layout entirely (no `gap-X` penalty
        // between icon and ghost child) and the
        // `.btn-v2:has(> .card-action-content.hidden)` rule in
        // `buttons-v2.css` collapses padding + locks aspect-ratio
        // to 1:1, so a 40 px row collapses cleanly to a 40 × 40 hit.
        <span className="card-action-content inline-flex min-w-0 items-center gap-1 font-medium tabular-nums typo-footnote">
          {showLabel && (
            <span className="card-action-label truncate">{label}</span>
          )}
          {showCount && <InteractionCounter value={count ?? 0} />}
        </span>
      )}
    </ButtonV2>
  );
}

export type CardActionProps = CardActionBaseProps & {
  ref?: Ref<AllowedElements>;
};

export const CardAction = forwardRef(CardActionComponent);
