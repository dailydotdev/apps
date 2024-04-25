import React, { ReactElement } from 'react';
import { ProfilePicture } from '../../ProfilePicture';
import SquadMemberBadge from '../SquadMemberBadge';
import { SourceMember } from '../../../graphql/sources';

interface PrivilegedMemberItemProps {
  member: SourceMember;
}

export function PrivilegedMemberItem({
  member: { user, role },
}: PrivilegedMemberItemProps): ReactElement {
  return (
    <div
      key={user.id}
      className="flex flex-row items-center rounded-10 border border-border-subtlest-tertiary p-2"
    >
      <ProfilePicture user={user} size="large" />
      <div className="flex-col">
        <span className="ml-2.5 text-text-tertiary typo-subhead">
          {user.name}
        </span>
        <SquadMemberBadge role={role} />
      </div>
    </div>
  );
}
