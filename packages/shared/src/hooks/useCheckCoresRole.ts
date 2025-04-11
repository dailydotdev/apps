import { useQuery } from '@tanstack/react-query';
import { ActionType } from '../graphql/actions';
import { CHECK_CORES_ROLE_QUERY } from '../graphql/njord';
import { generateQueryKey, RequestKey } from '../lib/query';
import type { LoggedUser } from '../lib/user';
import { useAuthContext } from '../contexts/AuthContext';
import { useActions } from './useActions';
import { useRequestProtocol } from './useRequestProtocol';

export const useCheckCoresRole = (): void => {
  const { user, isFetched, updateUser } = useAuthContext();
  const { requestMethod } = useRequestProtocol();
  const { isActionsFetched, checkHasCompleted } = useActions();

  useQuery({
    queryKey: generateQueryKey(RequestKey.CheckCoresRole, user),
    queryFn: async () => {
      const result = await requestMethod<{
        checkCoresRole: Pick<LoggedUser, 'coresRole'>;
      }>(CHECK_CORES_ROLE_QUERY);

      if (result.checkCoresRole.coresRole !== user.coresRole) {
        await updateUser({
          ...user,
          coresRole: result.checkCoresRole.coresRole,
        });
      }

      return result.checkCoresRole;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled:
      !!user &&
      isFetched &&
      isActionsFetched &&
      !checkHasCompleted(ActionType.CheckedCoresRole),
  });
};
