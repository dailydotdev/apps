import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { WithClassNameProps } from '../utilities';
import Link from '../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { combinedClicks } from '../../lib/click';
import { ArrowIcon, OpenLinkIcon } from '../icons';
import { anchorDefaultRel } from '../../lib/strings';
import { webappUrl } from '../../lib/constants';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { useViewSize, ViewSize } from '../../hooks';

type ProfileSectionItemPropsCommon = WithClassNameProps & {
  title: string;
  icon?: (props: IconProps) => ReactElement;
  onClick?: () => void;
  isActive?: boolean;
  // v2 reveals the external-link icon only on hover/focus for a cleaner column.
  // Defaults to the v1 always-visible icon so the production menu is unchanged.
  linkIconHoverOnly?: boolean;
  typography?: Partial<{
    type: TypographyType;
    color: TypographyColor;
  }>;
};

type ProfileSectionItemPropsWithHref = ProfileSectionItemPropsCommon & {
  href: string;
  external?: boolean;
};

export type ProfileSectionItemPropsWithoutHref =
  ProfileSectionItemPropsCommon & {
    href?: undefined;
    external?: never;
  };

export type ProfileSectionItemProps =
  | ProfileSectionItemPropsWithHref
  | ProfileSectionItemPropsWithoutHref;

export const ProfileSectionItem = ({
  className,
  title,
  href,
  icon: Icon,
  onClick,
  external,
  isActive,
  linkIconHoverOnly,
  typography,
}: ProfileSectionItemProps): ReactElement => {
  const router = useRouter();
  const isMobile = useViewSize(ViewSize.MobileL);
  const tag = href ? TypographyTag.Link : TypographyTag.Button;
  const showLinkIcon = href && external;
  const openNewTab = showLinkIcon && !href.startsWith(webappUrl);
  // Warm the destination chunk while the cursor is on the row so the click
  // resolves fast. The dropdown is conditionally mounted, so Next's default
  // viewport prefetch never gets a chance before the click otherwise.
  const isInternal = !!href && !external && href.startsWith(webappUrl);
  const prefetch = () => {
    if (isInternal) {
      router.prefetch(href).catch(() => undefined);
    }
  };
  const content = (
    <Typography<typeof tag>
      tag={tag}
      color={typography?.color ?? TypographyColor.Tertiary}
      type={typography?.type ?? TypographyType.Subhead}
      className={classNames(
        'group flex h-10 cursor-pointer items-center gap-2 rounded-10 px-1 tablet:h-8',
        (href || onClick) && 'hover:bg-surface-float',
        isActive ? 'bg-surface-active' : undefined,
        className,
      )}
      {...combinedClicks(() => onClick?.())}
      {...(openNewTab && { target: '_blank', rel: anchorDefaultRel })}
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      {Icon && (
        <Icon
          secondary={isActive}
          size={isMobile ? IconSize.Small : IconSize.XSmall}
        />
      )}
      <span>{title}</span>

      {!isMobile && showLinkIcon && (
        <OpenLinkIcon
          className={classNames(
            'ml-auto text-text-quaternary',
            linkIconHoverOnly &&
              'opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100',
          )}
          size={IconSize.Size16}
        />
      )}

      {isMobile && !external && (
        <ArrowIcon
          className="ml-auto rotate-90 text-text-quaternary"
          size={IconSize.Size16}
        />
      )}
    </Typography>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} passHref>
      {content}
    </Link>
  );
};
