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

type ProfileSectionItemPropsCommon = WithClassNameProps & {
  title: string;
  icon?: ReactElement;
  onClick?: () => void;
  showExternalIcon?: boolean;
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
  icon,
  onClick,
  external,
  showExternalIcon,
}: ProfileSectionItemProps): ReactElement => {
  const tag = href ? TypographyTag.Link : TypographyTag.Button;

  const isExternal = href && external;

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
        type={TypographyType.Subhead}
        className={classNames(
          'flex cursor-pointer items-center gap-2 rounded-10 px-1 py-1.5 hover:bg-theme-active',
          className,
        )}
        {...combinedClicks(() => onClick?.())}
        {...(isExternal && { target: '_blank', rel: anchorDefaultRel })}
      >
        {icon}
        <span>{title}</span>

        {(isExternal || showExternalIcon) && (
          <OpenLinkIcon className="ml-auto text-text-quaternary" />
        )}
      </Typography>
    </ConditionalWrapper>
  );
};
