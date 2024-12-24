import { useMemo } from 'react';
import type { Source, SourceMemberRole } from '../graphql/sources';
import type { PublicProfile } from '../lib/user';

export type UseMemberRoleForSourceProps = {
  source?: Source;
  user?: Pick<PublicProfile, 'id'>;
};

export type UseMemberRoleForSourceResult = {
  role?: SourceMemberRole;
};

export const useMemberRoleForSource = ({
  source,
  user,
}: UseMemberRoleForSourceProps): UseMemberRoleForSourceResult => {
  return useMemo(() => {
    const role = source?.privilegedMembers?.find(
      (member) => member.user.id === user?.id,
    )?.role;

    return { role };
  }, [user, source]);
};
