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

export type TagChipSize = 'sm' | 'md' | 'lg';

interface TagChipProps {
  tag: string;
  isFollowed?: boolean;
  onFollow?: (tag: string) => void;
  size?: TagChipSize;
  className?: string;
  // Override the destination (defaults to the /tags page). The Explore
  // surfaces pass the /explore equivalent so chips stay on-brand.
  link?: string;
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
  link,
}: {
  tag: string;
  type: TypographyType;
  link?: string;
}): ReactElement => (
  <Link href={link ?? getTagPageLink(tag)} passHref prefetch={false}>
    <Typography
      tag={TypographyTag.Link}
      type={type}
      color={TypographyColor.Tertiary}
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
  link,
}: TagChipProps): ReactElement => {
  const cfg = SizeMap[size];

  if (isFollowed) {
    return (
      <span
        role="listitem"
        className={classNames(
          'inline-flex max-w-full items-center border border-border-subtlest-tertiary transition-colors hover:bg-border-subtlest-tertiary',
          cfg.height,
          cfg.radius,
          cfg.horizontalPlain,
          className,
        )}
      >
        <TagLabel tag={tag} type={cfg.typography} link={link} />
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
      <TagLabel tag={tag} type={cfg.typography} link={link} />
      {showAction && (
        <>
          <span
            role="separator"
            aria-hidden
            className={classNames(
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
