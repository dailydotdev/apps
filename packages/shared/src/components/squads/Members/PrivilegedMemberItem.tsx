import React, { ReactElement } from 'react';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import SquadMemberBadge from '../SquadMemberBadge';
import { SourceMember } from '../../../graphql/sources';
import { ProfileTooltip } from '../../profile/ProfileTooltip';
import { ProfileLink } from '../../profile/ProfileLink';

interface PrivilegedMemberItemProps {
  member: SourceMember;
}

export function PrivilegedMemberItem({
  member: { user, role },
}: PrivilegedMemberItemProps): ReactElement {
  return (
    <ProfileTooltip user={user} tooltip={{ placement: 'bottom' }}>
      <ProfileLink
        href={user.permalink}
        className="flex flex-row items-center rounded-10 border border-border-subtlest-tertiary p-2"
      >
        <ProfilePicture user={user} size={ProfileImageSize.Large} />
        <div className="flex-col">
          <span className="ml-2.5 flex truncate text-text-tertiary typo-subhead">
            {user.name}
          </span>
          <SquadMemberBadge role={role} />
        </div>
      </ProfileLink>
    </ProfileTooltip>
  );
}
