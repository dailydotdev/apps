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
};

const UserBadge = ({
  className,
  content,
  Icon,
  iconProps,
  removeMargins,
}: UserBadgeProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <span
      className={classNames(
        'flex items-center tablet:gap-0.5 tablet:typo-footnote typo-caption2 font-bold capitalize',
        !removeMargins && 'tablet:ml-2 ml-1',
        className,
      )}
    >
      {typeof Icon === 'function' && (
        <Icon size={isMobile ? IconSize.XXSmall : undefined} {...iconProps} />
      )}
      {content}
    </span>
  );
};

export default UserBadge;
