import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { SourceMemberRole } from '../graphql/sources';
import { isPrivilegedRole } from '../graphql/squads';
import type { OrganizationMemberRole } from '../features/organizations/types';

type UserBadgeProps = {
  role?: SourceMemberRole | OrganizationMemberRole;
  className?: string;
  children: ReactNode;
};

const userBadgeColor = {
  purple: 'text-brand-default bg-action-share-active',
  gray: 'text-text-tertiary bg-surface-float',
};

const getBadgeColorByRole = (
  role: SourceMemberRole | OrganizationMemberRole,
): string => {
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
        'flex items-center rounded-6 px-1 capitalize typo-footnote tablet:gap-0.5',
        getBadgeColorByRole(role),
        className,
      )}
    >
      {children}
    </span>
  );
};

export default UserBadge;
