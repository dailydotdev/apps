import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ButtonV2,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { AnalyticsIcon } from '@dailydotdev/shared/src/components/icons/Analytics';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { DownvoteIcon } from '@dailydotdev/shared/src/components/icons/Downvote';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import type { DemoActions } from './demo';
import { compactCount } from './demo';

/* ------------------------------------------------------------------------ */
/* Sizes                                                                     */
/* ------------------------------------------------------------------------ */

export type Size = 28 | 32 | 36 | 40;

const box: Record<Size, string> = {
  28: '!h-7 !rounded-10',
  32: '!h-8 !rounded-10',
  36: '!h-9 !rounded-12',
  40: '!h-10 !rounded-12',
};
const square: Record<Size, string> = {
  28: '!w-7',
  32: '!w-8',
  36: '!w-9',
  40: '!w-10',
};
export const iconFor: Record<Size, IconSize> = {
  28: IconSize.XSmall,
  32: IconSize.XSmall,
  36: IconSize.Small,
  40: IconSize.Small,
};

/* ------------------------------------------------------------------------ */
/* The action button                                                         */
/* ------------------------------------------------------------------------ */

export interface ActProps {
  size?: Size;
  icon: ReactElement;
  label: string;
  color: ButtonColor;
  count?: number;
  /** Shows the label as text next to the icon (LinkedIn-style). */
  text?: string;
  pressed?: boolean;
  onClick: () => void;
  className?: string;
  /** Muted counter colour, so numbers read as data and icons as actions. */
  quietCount?: boolean;
  /**
   * Bluesky's trick: the button stays small and an invisible pseudo-element
   * makes the clickable area 44px tall at the button's own width, so
   * neighbours never overlap.
   */
  reach?: 'tall';
}

/** ButtonV2 tertiary, the production `CardAction` look, with compact counts. */
export const Act = ({
  size = 32,
  icon,
  label,
  color,
  count,
  text,
  pressed,
  onClick,
  className,
  quietCount,
  reach,
}: ActProps): ReactElement => {
  const content = text ?? (count ? compactCount(count) : undefined);
  return (
    <ButtonV2
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      color={color}
      pressed={pressed}
      onClick={onClick}
      aria-label={label}
      icon={React.cloneElement(icon, { size: iconFor[size] })}
      className={classNames(
        box[size],
        content ? '!gap-1 !pl-1.5 !pr-2' : square[size],
        reach && `reach reach-${reach}`,
        reach && size === 28 && 'reach-28',
        className,
      )}
    >
      {content && (
        <span
          className={classNames(
            'font-medium tabular-nums',
            size >= 36 ? 'typo-callout' : 'typo-footnote',
            quietCount && !pressed && 'text-text-tertiary',
          )}
        >
          {content}
        </span>
      )}
    </ButtonV2>
  );
};

/**
 * The tap-area pseudo-elements, in plain CSS: this Tailwind setup does not
 * generate `after:` inset utilities. Rendered once per card by `RealCard`.
 */
// Measured from the padding box (inside the 1px border): 32px and 28px buttons
// both come out at exactly 44px, checked by hit-testing.
export const reachCss = `
.reach::after { content: ''; position: absolute; left: 0; right: 0; border-radius: 12px; }
.reach-tall { position: relative; }
.reach-tall::after { top: -7px; bottom: -7px; }
.reach-28::after { top: -9px; bottom: -9px; }
`;

/* ------------------------------------------------------------------------ */
/* The six actions, wired to demo state                                      */
/* ------------------------------------------------------------------------ */

export type Kind =
  | 'upvote'
  | 'comment'
  | 'downvote'
  | 'bookmark'
  | 'copy'
  | 'stat'
  | 'more';

export const act = (
  kind: Kind,
  a: DemoActions,
  { bare = false }: { bare?: boolean } = {},
): Omit<ActProps, 'size' | 'className'> => {
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
    case 'more':
      return {
        icon: <MenuIcon />,
        label: 'More',
        color: ButtonColor.Salt,
        onClick: a.noop,
      };
    default:
      return {
        icon: <AnalyticsIcon />,
        label: 'Impressions',
        color: ButtonColor.Cheese,
        count: bare ? undefined : a.impressions,
        onClick: a.noop,
      };
  }
};
