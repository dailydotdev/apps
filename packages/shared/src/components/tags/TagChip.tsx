import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonV2, ButtonSize } from '../buttons/ButtonV2';
import { MiniCloseIcon, PlusIcon } from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import Link from '../utilities/Link';
import { getTagPageLink } from '../../lib/links';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

/**
 * Tag chip — a single, unified design for `#tag` chips across the
 * product (article post / modal, tags directory, search results).
 *
 * Anatomy: `[ #tag ] [ vertical separator ] [ + or × button ]`
 *
 * Sizes follow the v2 button scale:
 *   - "sm"   → 24 px chip (XSmall)         — article tag list, in-card chips
 *   - "md"   → 32 px chip (Small)          — tags directory, search panels
 *   - "lg"   → 40 px chip (Medium)         — featured / hero placements
 *
 * The action button (follow / unfollow) is always present so a chip
 * never looks visually different just because it happens to be already
 * followed. If a callsite truly does not want the action, it should
 * use the plain `TagLink` instead.
 */
export type TagChipSize = 'sm' | 'md' | 'lg';

interface TagChipProps {
  tag: string;
  isFollowed?: boolean;
  onFollow?: (tag: string) => void;
  onUnfollow?: (tag: string) => void;
  size?: TagChipSize;
  className?: string;
}

const SizeMap: Record<
  TagChipSize,
  {
    height: string;
    horizontal: string;
    typography: TypographyType;
    button: ButtonSize;
    icon: IconSize;
    radius: string;
    separatorHeight: string;
  }
> = {
  sm: {
    height: 'h-6',
    horizontal: 'pl-2 pr-1',
    typography: TypographyType.Caption1,
    button: ButtonSize.XSmall,
    icon: IconSize.XSmall,
    radius: 'rounded-8',
    separatorHeight: 'h-3',
  },
  md: {
    height: 'h-8',
    horizontal: 'pl-3 pr-1.5',
    typography: TypographyType.Footnote,
    button: ButtonSize.Small,
    icon: IconSize.Size16,
    radius: 'rounded-10',
    separatorHeight: 'h-4',
  },
  lg: {
    height: 'h-10',
    horizontal: 'pl-4 pr-2',
    typography: TypographyType.Callout,
    button: ButtonSize.Medium,
    icon: IconSize.Size16,
    radius: 'rounded-12',
    separatorHeight: 'h-5',
  },
};

export const TagChip = ({
  tag,
  isFollowed = false,
  onFollow,
  onUnfollow,
  size = 'sm',
  className,
}: TagChipProps): ReactElement => {
  const cfg = SizeMap[size];
  const action = isFollowed ? onUnfollow : onFollow;
  const showAction = !!action;
  const actionLabel = isFollowed ? `Unfollow #${tag}` : `Follow #${tag}`;
  const ActionIcon = isFollowed ? MiniCloseIcon : PlusIcon;

  return (
    <span
      role="listitem"
      className={classNames(
        'inline-flex items-center bg-surface-float',
        cfg.height,
        cfg.radius,
        showAction ? cfg.horizontal : 'px-2',
        className,
      )}
    >
      <Link href={getTagPageLink(tag)} passHref prefetch={false}>
        <Typography
          tag={TypographyTag.Link}
          type={cfg.typography}
          color={TypographyColor.Tertiary}
          className="cursor-pointer no-underline transition-colors hover:text-text-primary"
          title={`Check all #${tag} posts`}
        >
          #{tag}
        </Typography>
      </Link>
      {showAction && (
        <>
          <span
            role="separator"
            aria-hidden
            className={classNames(
              'mx-2 w-px bg-border-subtlest-tertiary',
              cfg.separatorHeight,
            )}
          />
          <Tooltip content={actionLabel}>
            <ButtonV2
              type="button"
              size={cfg.button}
              icon={<ActionIcon aria-hidden size={cfg.icon} />}
              onClick={() => action?.(tag)}
              aria-label={actionLabel}
            />
          </Tooltip>
        </>
      )}
    </span>
  );
};
