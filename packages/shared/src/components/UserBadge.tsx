import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { SourceMemberRole } from '../graphql/sources';

export const userBadgeColor = {
  purple: 'text-brand-default bg-action-share-active',
  gray: 'text-text-tertiary bg-surface-float',
} as const;

type UserBadgeColor = keyof typeof userBadgeColor;

export const getBadgeColorByRole = (role: SourceMemberRole): UserBadgeColor => {
  if ([SourceMemberRole.Moderator, SourceMemberRole.Admin].includes(role)) {
    return 'purple';
  }
  return 'gray';
};

type UserBadgeProps = {
  color?: UserBadgeColor;
  className?: string;
  children: ReactNode;
};

const UserBadge = ({
  className,
  children,
  color = 'gray',
}: UserBadgeProps): ReactElement => {
  if (!children) {
    return null;
  }

  return (
    <span
      className={classNames(
        'flex items-center rounded-6 px-1 font-bold capitalize typo-caption2 tablet:gap-0.5 tablet:typo-footnote',
        userBadgeColor[color],
        className,
      )}
    >
      {children}
    </span>
  );
};

export default UserBadge;
