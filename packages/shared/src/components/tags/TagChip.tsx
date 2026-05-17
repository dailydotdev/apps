import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonV2, ButtonSize } from '../buttons/ButtonV2';
import { PlusIcon } from '../icons';
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
 * Two visual states, intentionally distinct:
 *
 *   - **Followed** → plain bordered link chip, no action button.
 *     This is the "stable" treatment: a tag the user already follows
 *     should read as a passive label, not as an interactive control.
 *     Unfollow lives on the tag page itself, not inline.
 *
 *   - **Not followed** → filled chip + vertical separator + `+` action
 *     button. The `+` is the call-to-action; without it the chip would
 *     look identical to the followed state.
 *
 * Sizes follow the v2 button scale:
 *   - "sm"   → 24 px chip (XSmall)         — article tag list, in-card chips
 *   - "md"   → 32 px chip (Small)          — tags directory, search panels
 *   - "lg"   → 40 px chip (Medium)         — featured / hero placements
 */
export type TagChipSize = 'sm' | 'md' | 'lg';

interface TagChipProps {
  tag: string;
  isFollowed?: boolean;
  onFollow?: (tag: string) => void;
  size?: TagChipSize;
  className?: string;
}

const SizeMap: Record<
  TagChipSize,
  {
    height: string;
    horizontalAction: string;
    horizontalPlain: string;
    typography: TypographyType;
    button: ButtonSize;
    icon: IconSize;
    radius: string;
    separatorHeight: string;
  }
> = {
  sm: {
    height: 'h-6',
    horizontalAction: 'pl-2 pr-1',
    horizontalPlain: 'px-2',
    typography: TypographyType.Caption1,
    button: ButtonSize.XSmall,
    icon: IconSize.XSmall,
    radius: 'rounded-8',
    separatorHeight: 'h-3',
  },
  md: {
    height: 'h-8',
    horizontalAction: 'pl-3 pr-1.5',
    horizontalPlain: 'px-3',
    typography: TypographyType.Footnote,
    button: ButtonSize.Small,
    icon: IconSize.Size16,
    radius: 'rounded-10',
    separatorHeight: 'h-4',
  },
  lg: {
    height: 'h-10',
    horizontalAction: 'pl-4 pr-2',
    horizontalPlain: 'px-4',
    typography: TypographyType.Callout,
    button: ButtonSize.Medium,
    icon: IconSize.Size16,
    radius: 'rounded-12',
    separatorHeight: 'h-5',
  },
};

const TagLabel = ({
  tag,
  type,
}: {
  tag: string;
  type: TypographyType;
}): ReactElement => (
  <Link href={getTagPageLink(tag)} passHref prefetch={false}>
    <Typography
      tag={TypographyTag.Link}
      type={type}
      color={TypographyColor.Tertiary}
      // `min-w-0 truncate` keeps very long tags (e.g. polyglot
      // multi-word system labels) inside the chip instead of pushing
      // the trailing `+` button off-screen. The chip itself can be
      // capped by callers via `className="max-w-..."`.
      className="block min-w-0 cursor-pointer truncate no-underline transition-colors hover:text-text-primary"
      title={`Check all #${tag} posts`}
    >
      #{tag}
    </Typography>
  </Link>
);

export const TagChip = ({
  tag,
  isFollowed = false,
  onFollow,
  size = 'sm',
  className,
}: TagChipProps): ReactElement => {
  const cfg = SizeMap[size];

  if (isFollowed) {
    return (
      <span
        role="listitem"
        className={classNames(
          // `max-w-full` keeps the chip from breaking out of its
          // column / flex parent on extremely long tags.
          'inline-flex max-w-full items-center border border-border-subtlest-tertiary transition-colors hover:bg-border-subtlest-tertiary',
          cfg.height,
          cfg.radius,
          cfg.horizontalPlain,
          className,
        )}
      >
        <TagLabel tag={tag} type={cfg.typography} />
      </span>
    );
  }

  const showAction = !!onFollow;

  return (
    <span
      role="listitem"
      className={classNames(
        'inline-flex max-w-full items-center bg-surface-float',
        cfg.height,
        cfg.radius,
        showAction ? cfg.horizontalAction : cfg.horizontalPlain,
        className,
      )}
    >
      <TagLabel tag={tag} type={cfg.typography} />
      {showAction && (
        <>
          <span
            role="separator"
            aria-hidden
            className={classNames(
              // `shrink-0` so the separator never collapses when the
              // label needs to truncate.
              'mx-2 w-px shrink-0 bg-border-subtlest-tertiary',
              cfg.separatorHeight,
            )}
          />
          <Tooltip content={`Follow #${tag}`}>
            <ButtonV2
              type="button"
              size={cfg.button}
              className="shrink-0"
              icon={<PlusIcon aria-hidden size={cfg.icon} />}
              onClick={() => onFollow?.(tag)}
              aria-label={`Follow #${tag}`}
            />
          </Tooltip>
        </>
      )}
    </span>
  );
};
