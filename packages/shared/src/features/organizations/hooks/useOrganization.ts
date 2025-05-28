import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { ApiErrorResult } from '../../../graphql/common';
import { DEFAULT_ERROR, gqlClient } from '../../../graphql/common';
import { ORGANIZATION_QUERY, UPDATE_ORGANIZATION_MUTATION } from '../graphql';
import type { UpdateOrganizationInput, UserOrganization } from '../types';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { parseOrDefault } from '../../../lib/func';
import { useToastNotification } from '../../../hooks';
import type { LoggedUser } from '../../../lib/user';

export const generateOrganizationQueryKey = (
  user: LoggedUser,
  orgId: string,
  ...additional: unknown[]
) => generateQueryKey(RequestKey.Organizations, user, orgId, ...additional);

export const useOrganization = (
  orgId: string,
  queryOptions?: Partial<UseQueryOptions<UserOrganization>>,
) => {
  const { displayToast } = useToastNotification();
  const { user, isAuthReady } = useAuthContext();
  const enableQuery = !!orgId && !!user && isAuthReady;
  const queryKey = generateOrganizationQueryKey(user, orgId);
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await gqlClient.request<{
        organization: UserOrganization;
      }>(ORGANIZATION_QUERY, { id: orgId });

      if (!res || !res.organization) {
        return null;
      }

      return res.organization;
    },
    staleTime: StaleTime.Default,
    ...queryOptions,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enableQuery
        : enableQuery,
  });

  const {
    mutateAsync: onUpdateOrganization,
    isPending: isUpdatingOrganization,
  } = useMutation({
    mutationFn: async ({
      id,
      form,
    }: {
      id: string;
      form: UpdateOrganizationInput;
    }) => {
      const inputData = { id, name: form.name, image: form.image };
      const res = await gqlClient.request<{
        updateOrganization: UserOrganization;
      }>(UPDATE_ORGANIZATION_MUTATION, inputData);
      return res.updateOrganization;
    },
    onSuccess: async (res) => {
      await queryClient.setQueryData(queryKey, () => res);
      displayToast('The organization has been updated');
    },
    onError: (error: ApiErrorResult) => {
      const result = parseOrDefault<Record<string, string>>(
        error?.response?.errors?.[0]?.message,
      );

      displayToast(typeof result === 'object' ? result.handle : DEFAULT_ERROR);
    },
  });

  const { organization, role, referralToken, referralUrl, seatType } =
    data || {};

  const seats = {
    total: organization?.seats || 0,
    assigned: organization?.activeSeats || 0,
    available: (organization?.seats || 0) - (organization?.activeSeats || 0),
  };

  return {
    organization,
    seats,
    role,
    referralToken,
    referralUrl,
    seatType,
    isFetching,
    onUpdateOrganization,
    isUpdatingOrganization,
  };
};
