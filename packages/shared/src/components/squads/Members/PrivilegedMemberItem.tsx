import type { ReactElement } from 'react';
import React from 'react';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import type { SourceMember, SourceMemberRole } from '../../../graphql/sources';
import { SourceMemberRole as SourceMemberRoleEnum } from '../../../graphql/sources';
import { ProfileLink } from '../../profile/ProfileLink';
import { ProfileTooltip } from '../../profile/ProfileTooltip';
import UserBadge from '../../UserBadge';

interface PrivilegedMemberItemProps {
  user: SourceMember['user'];
  badge?: string;
  role?: SourceMemberRole;
}

export function PrivilegedMemberItem({
  user,
  badge,
  role = SourceMemberRoleEnum.Member,
}: PrivilegedMemberItemProps): ReactElement {
  return (
    <ProfileTooltip userId={user.id} tooltip={{ placement: 'bottom' }}>
      <ProfileLink
        href={user.permalink}
        className="flex flex-row items-center gap-2 rounded-10 border border-border-subtlest-tertiary p-2"
      >
        <ProfilePicture user={user} size={ProfileImageSize.Large} />
        <div className="flex-col">
          <span className="flex truncate text-text-tertiary typo-subhead">
            {user.name}
          </span>
          {badge && (
            <UserBadge className="w-fit" role={role}>
              {badge}
            </UserBadge>
          )}
        </div>
      </ProfileLink>
    </ProfileTooltip>
  );
}
