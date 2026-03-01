import type { QueryClient } from '@tanstack/react-query';
import { generateQueryKey, RequestKey } from '../../lib/query';
import type { SourceMemberFlag, Squad } from '../sources';
import type { LoggedUser } from '../../lib/user';

export const updateFlagsCache = (
  client: QueryClient,
  squad: Squad,
  user: LoggedUser,
  update: SourceMemberFlag,
): void => {
  const queryKey = generateQueryKey(RequestKey.Squad, user, squad?.handle);
  const data = client.getQueryData(queryKey);

  if (!data) {
    return;
  }

  client.setQueryData<Squad | undefined>(queryKey, (oldData) => {
    if (!oldData?.currentMember) {
      return oldData;
    }

    return {
      ...oldData,
      currentMember: {
        ...oldData.currentMember,
        flags: {
          ...(oldData.currentMember.flags ?? {}),
          ...update,
        },
      },
    };
  });
};
