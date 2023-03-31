import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { IconProps } from './Icon';

export type UserBadgeProps = {
  className?: string;
  content: ReactNode;
  icon: ReactElement<IconProps>;
};

const UserBadge = ({
  className,
  content,
  icon,
}: UserBadgeProps): ReactElement => {
  return (
    <span
      className={classNames(
        'flex items-center ml-2 typo-footnote font-bold capitalize',
        className,
      )}
    >
      {icon}
      {content}
    </span>
  );
};

export default UserBadge;
