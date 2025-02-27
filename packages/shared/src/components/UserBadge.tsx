import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { SourceMemberRole } from '../graphql/sources';
import { isPrivilegedRole } from '../graphql/squads';

type UserBadgeProps = {
  role?: SourceMemberRole;
  className?: string;
  children: ReactNode;
};

const userBadgeColor = {
  purple: 'text-brand-default bg-action-share-active',
  gray: 'text-text-tertiary bg-surface-float',
};

const getBadgeColorByRole = (role: SourceMemberRole): string => {
  if (isPrivilegedRole(role)) {
    return userBadgeColor.purple;
  }
  return userBadgeColor.gray;
};

const UserBadge = ({
  className,
  children,
  role = SourceMemberRole.Member,
}: UserBadgeProps): ReactElement => {
  if (!children) {
    return null;
  }

  return (
    <span
      className={classNames(
        'flex items-center rounded-6 px-1 font-bold capitalize typo-footnote tablet:gap-0.5',
        getBadgeColorByRole(role),
        className,
      )}
    >
      {children}
    </span>
  );
};

export default UserBadge;
