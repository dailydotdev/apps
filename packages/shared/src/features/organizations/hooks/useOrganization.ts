import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiErrorResult } from '../../../graphql/common';
import { DEFAULT_ERROR, gqlClient } from '../../../graphql/common';
import { ORGANIZATION_QUERY, UPDATE_ORGANIZATION_MUTATION } from '../graphql';
import type { UpdateOrganizationInput, UserOrganization } from '../types';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { parseOrDefault } from '../../../lib/func';
import { useToastNotification } from '../../../hooks';
import type { LoggedUser } from '../../../lib/user';

export const generateOrganizationQueryKey = (user: LoggedUser, orgId: string) =>
  generateQueryKey(RequestKey.Organizations, user, orgId);

export const useOrganization = (orgId: string) => {
  const { displayToast } = useToastNotification();
  const { user, isAuthReady } = useAuthContext();
  const enableQuery = !!orgId && !!user && isAuthReady;
  const queryKey = generateOrganizationQueryKey(user, orgId);
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey,
    enabled: enableQuery,
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

  const { organization, role, referralToken, referralUrl } = data || {};

  return {
    organization,
    role,
    referralToken,
    referralUrl,
    isFetching,
    onUpdateOrganization,
    isUpdatingOrganization,
  };
};
