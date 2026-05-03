import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';

/**
 * `CardActionBar` — flex-row container for `CardAction` rows.
 *
 * Four layouts cover the surfaces in this codebase:
 *
 * | Layout       | When                                   | Behaviour                                              |
 * | ---          | ---                                    | ---                                                    |
 * | `default`    | Sticky bottom bar, modal footer        | `gap-1`, left-aligned, content width.                  |
 * | `feedCard`   | **Feed grid / list post cards**        | `flex-1 min-w-0 justify-between`, fills card, no push. |
 * | `between`    | Post-detail action strip               | `gap-1 justify-between w-full`, distributes labels.    |
 * | `compact`    | Comment row, modal header              | `gap-0.5`, left-aligned, content width.                |
 *
 * **Width contract** (why `feedCard` is its own thing): a feed grid
 * card can render anywhere from ~140 px (6-col grid on a laptop)
 * up to ~700 px (single-column list on desktop). The action bar
 * lives at the bottom of that card and **must not push the card
 * wider than its grid-track allowance**, otherwise the whole feed
 * grid breaks. v1 `ActionButtons` solves this with
 * `flex flex-1 items-center justify-between` + `Small` (32 px)
 * buttons — the bar fills the available width, distributes children
 * evenly, and `min-w-0` lets children shrink. `feedCard` mirrors
 * that contract, and the matching `CardAction` rule is
 * **`density="compact"` for grid cards** (32 px keeps the natural
 * width of the row inside a 140 – 280 px container).
 *
 * Spacing rationale:
 *
 * - `gap-1` (4 px) for default / feedCard / between matches the
 *   engagement-bar density of Linear, Notion, dev.to. Tighter
 *   (`gap-0`) makes hover bg overlap awkwardly between adjacent
 *   buttons; looser (`gap-2`) reads as "separate actions" rather
 *   than a unified bar.
 * - `gap-0.5` (2 px) for compact lets a denser comment row fit four
 *   actions in ~140 px without crowding labels (matches GitHub
 *   comment toolbars).
 *
 * The bar itself does not own background / border — by design. A
 * sticky variant is the consumer's job (wrap in a `sticky bottom-0`
 * div with `bg-background-default` + a top border). Keeping the bar
 * "transparent" means it can drop into any surface — feed card,
 * modal footer, sticky bottom — without restyling its own chrome.
 *
 * No `role="toolbar"`: the WAI-ARIA toolbar pattern requires roving
 * `tabIndex` and arrow-key navigation between actions, which is
 * intentionally not implemented here — every reference engagement
 * bar (Reddit, X, YouTube, LinkedIn, Facebook, Instagram) treats
 * each action as a regular tab-stop, and we match that contract.
 * Consumers who want a true toolbar (e.g. a comment editor's
 * formatting strip) should compose their own with the ARIA pattern.
 */
export type CardActionBarLayout =
  | 'default'
  | 'feedCard'
  | 'between'
  | 'compact';

const layoutToClass: Record<CardActionBarLayout, string> = {
  default: 'gap-1',
  feedCard: 'flex-1 min-w-0 gap-1 justify-between',
  between: 'gap-1 justify-between w-full',
  compact: 'gap-0.5',
};

export type CardActionBarProps = HTMLAttributes<HTMLDivElement> & {
  layout?: CardActionBarLayout;
  children: ReactNode;
};

function CardActionBarComponent(
  { layout = 'default', className, children, ...rest }: CardActionBarProps,
  ref?: Ref<HTMLDivElement>,
): ReactElement {
  return (
    <div
      {...rest}
      ref={ref}
      className={classNames(
        'flex items-center',
        layoutToClass[layout],
        className,
      )}
    >
      {children}
    </div>
  );
}

export const CardActionBar = forwardRef(CardActionBarComponent);
