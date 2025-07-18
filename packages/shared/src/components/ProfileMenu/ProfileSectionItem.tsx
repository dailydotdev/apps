import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { WithClassNameProps } from '../utilities';
import Link from '../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import ConditionalWrapper from '../ConditionalWrapper';
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
  typography,
}: ProfileSectionItemProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  const tag = href ? TypographyTag.Link : TypographyTag.Button;

  const showLinkIcon = href && external;
  const openNewTab = showLinkIcon && !href.startsWith(webappUrl);

  return (
    <ConditionalWrapper
      condition={!!href}
      wrapper={(children) => (
        <Link href={href} passHref>
          {children}
        </Link>
      )}
    >
      <Typography<typeof tag>
        tag={tag}
        color={typography?.color ?? TypographyColor.Tertiary}
        type={typography?.type ?? TypographyType.Subhead}
        className={classNames(
          'flex h-10 cursor-pointer items-center gap-2 rounded-10 px-1 tablet:h-8',
          (href || onClick) && 'hover:bg-surface-float',
          isActive ? 'bg-surface-active' : undefined,
          className,
        )}
        {...combinedClicks(() => onClick?.())}
        {...(openNewTab && { target: '_blank', rel: anchorDefaultRel })}
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
            className="ml-auto text-text-quaternary"
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
    </ConditionalWrapper>
  );
};
