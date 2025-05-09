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
import { OpenLinkIcon } from '../icons';
import { anchorDefaultRel } from '../../lib/strings';
import { webappUrl } from '../../lib/constants';
import type { IconProps } from '../Icon';

type ProfileSectionItemPropsCommon = WithClassNameProps & {
  title: string;
  icon?: (props: IconProps) => ReactElement;
  onClick?: () => void;
  isActive?: boolean;
  typographyType?: TypographyType;
};

type ProfileSectionItemPropsWithHref = ProfileSectionItemPropsCommon & {
  href: string;
  external?: boolean;
};

type ProfileSectionItemPropsWithoutHref = ProfileSectionItemPropsCommon & {
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
  typographyType = TypographyType.Subhead,
}: ProfileSectionItemProps): ReactElement => {
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
        color={TypographyColor.Tertiary}
        type={typographyType}
        className={classNames(
          'flex cursor-pointer items-center gap-2 rounded-10 px-1 py-1.5',
          (href || onClick) && 'hover:bg-surface-float',
          isActive ? 'bg-surface-active' : undefined,
          className,
        )}
        {...combinedClicks(() => onClick?.())}
        {...(openNewTab && { target: '_blank', rel: anchorDefaultRel })}
      >
        {Icon && <Icon secondary={isActive} />}
        <span>{title}</span>

        {showLinkIcon && (
          <OpenLinkIcon className="ml-auto text-text-quaternary" />
        )}
      </Typography>
    </ConditionalWrapper>
  );
};
