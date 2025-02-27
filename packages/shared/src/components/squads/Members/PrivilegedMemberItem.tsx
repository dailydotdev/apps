import type { ReactElement } from 'react';
import React from 'react';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import type { SourceMember } from '../../../graphql/sources';
import { ProfileTooltip } from '../../profile/ProfileTooltip';
import { ProfileLink } from '../../profile/ProfileLink';
import UserBadge from '../../UserBadge';
import { getRoleName } from '../../utilities';

interface PrivilegedMemberItemProps {
  member: SourceMember;
}

export function PrivilegedMemberItem({
  member: { user, role },
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
          <UserBadge className="w-fit" role={role}>
            {getRoleName(role)}
          </UserBadge>
        </div>
      </ProfileLink>
    </ProfileTooltip>
  );
}
