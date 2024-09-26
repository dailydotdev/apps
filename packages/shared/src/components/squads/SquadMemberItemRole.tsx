import React, { ReactElement } from 'react';
import { SourceMember, SourceMemberRole } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';
import SquadMemberBadge from './SquadMemberBadge';

interface SquadMemberItemRoleProps {
  member: SourceMember;
}

function SquadMemberItemRole({
  member,
}: SquadMemberItemRoleProps): ReactElement {
  const { user: loggedUser } = useAuthContext();
  const { role, user } = member;

  const sameUser = loggedUser && loggedUser.id === user.id;

  if (role === SourceMemberRole.Member) {
    return null;
  }

  return (
    <SquadMemberBadge
      className={sameUser ? 'mr-10' : 'mr-2'}
      role={member.role}
    />
  );
}

export default SquadMemberItemRole;
