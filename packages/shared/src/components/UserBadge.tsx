import classNames from 'classnames';
import React, { FunctionComponent, ReactElement, ReactNode } from 'react';
import { IconProps, IconSize } from './Icon';
import { useViewSize, ViewSize } from '../hooks';

export type UserBadgeProps = {
  className?: string;
  content: ReactNode;
  Icon: FunctionComponent<IconProps>;
  iconProps?: IconProps;
  removeMargins?: boolean;
  disableResponsive?: boolean;
};

const UserBadge = ({
  className,
  content,
  Icon,
  iconProps,
  removeMargins,
  disableResponsive,
}: UserBadgeProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <span
      className={classNames(
        'flex items-center font-bold capitalize typo-caption2',
        !removeMargins && 'ml-1 tablet:ml-2',
        !disableResponsive && 'tablet:gap-0.5 tablet:typo-footnote',
        className,
      )}
    >
      {typeof Icon === 'function' && (
        <Icon
          size={isMobile || disableResponsive ? IconSize.XXSmall : undefined}
          {...iconProps}
        />
      )}
      {content}
    </span>
  );
};

export default UserBadge;
