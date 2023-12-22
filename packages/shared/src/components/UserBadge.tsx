import classNames from 'classnames';
import React, { FunctionComponent, ReactElement, ReactNode } from 'react';
import { IconProps, IconSize } from './Icon';
import { useViewSize, ViewSize } from '../hooks';

export type UserBadgeProps = {
  className?: string;
  content: ReactNode;
  Icon: FunctionComponent<IconProps>;
  iconProps?: IconProps;
};

const UserBadge = ({
  className,
  content,
  Icon,
  iconProps,
}: UserBadgeProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <span
      className={classNames(
        'ml-1 flex items-center font-bold capitalize typo-caption2 tablet:ml-2 tablet:gap-0.5 tablet:typo-footnote',
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
