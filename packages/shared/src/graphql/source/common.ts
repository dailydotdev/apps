import { QueryClient } from 'react-query';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { SourceMemberFlag, Squad } from '../sources';
import { LoggedUser } from '../../lib/user';

export const updateFlagsCache = (
  client: QueryClient,
  squad: Squad,
  user: LoggedUser,
  update: Partial<SourceMemberFlag>,
): void => {
  const queryKey = generateQueryKey(RequestKey.Squad, user, squad?.handle);
  client.setQueryData<Squad>(queryKey, (oldData) => ({
    ...oldData,
    currentMember: {
      ...oldData.currentMember,
      flags: {
        ...(oldData.currentMember.flags ?? {}),
        ...update,
      },
    },
  }));
};
