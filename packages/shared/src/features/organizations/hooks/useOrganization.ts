import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type { ApiErrorResult } from '../../../graphql/common';
import { DEFAULT_ERROR, gqlClient } from '../../../graphql/common';
import {
  DELETE_ORGANIZATION_MUTATION,
  LEAVE_ORGANIZATION_MUTATION,
  ORGANIZATION_QUERY,
  REMOVE_ORGANIZATION_MEMBER_MUTATION,
  TOGGLE_ORGANIZATION_MEMBER_SEAT_MUTATION,
  UPDATE_ORGANIZATION_MEMBER_ROLE_MUTATION,
  UPDATE_ORGANIZATION_MUTATION,
} from '../graphql';
import { OrganizationMemberRole } from '../types';
import type { UpdateOrganizationInput, UserOrganization } from '../types';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks';
import type { LoggedUser } from '../../../lib/user';
import { settingsUrl } from '../../../lib/constants';

export const generateOrganizationQueryKey = (
  user: LoggedUser,
  orgId: string,
  ...additional: unknown[]
) => generateQueryKey(RequestKey.Organizations, user, orgId, ...additional);

export const updateOrganizationHandler = async ({
  id,
  form,
}: {
  id: string;
  form: UpdateOrganizationInput;
}): Promise<UserOrganization> => {
  const inputData = { id, name: form.name, image: form.image };
  const res = await gqlClient.request<{
    updateOrganization: UserOrganization;
  }>(UPDATE_ORGANIZATION_MUTATION, inputData);
  return res.updateOrganization;
};

export const removeMember = async ({
  id,
  memberId,
}: {
  id: string;
  memberId: string;
}): Promise<UserOrganization> => {
  const res = await gqlClient.request<{
    removeOrganizationMember: UserOrganization;
  }>(REMOVE_ORGANIZATION_MEMBER_MUTATION, {
    id,
    memberId,
  });

  return res.removeOrganizationMember;
};

export const updateMemberRole = async ({
  id,
  memberId,
  role,
}: {
  id: string;
  memberId: string;
  role: OrganizationMemberRole;
}): Promise<UserOrganization> => {
  const res = await gqlClient.request<{
    updateOrganizationMemberRole: UserOrganization;
  }>(UPDATE_ORGANIZATION_MEMBER_ROLE_MUTATION, {
    id,
    memberId,
    role,
  });

  return res.updateOrganizationMemberRole;
};

export const updateMemberSeat = async ({
  id,
  memberId,
}: {
  id: string;
  memberId: string;
}): Promise<UserOrganization> => {
  const res = await gqlClient.request<{
    toggleOrganizationMemberSeat: UserOrganization;
  }>(TOGGLE_ORGANIZATION_MEMBER_SEAT_MUTATION, {
    id,
    memberId,
  });

  return res.toggleOrganizationMemberSeat;
};

export const deleteOrganizationHandler = async (organizationId: string) =>
  gqlClient.request(DELETE_ORGANIZATION_MUTATION, {
    id: organizationId,
  });

export const leaveOrganizationHandler = async (organizationId: string) =>
  gqlClient.request(LEAVE_ORGANIZATION_MUTATION, {
    id: organizationId,
  });

export const useOrganization = (
  organizationId: string,
  queryOptions?: Partial<UseQueryOptions<UserOrganization>>,
) => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { user, isAuthReady, refetchBoot } = useAuthContext();
  const enableQuery = !!organizationId && !!user && isAuthReady;
  const queryKey = generateOrganizationQueryKey(user, organizationId);
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await gqlClient.request<{
        organization: UserOrganization;
      }>(ORGANIZATION_QUERY, { id: organizationId });

      return res?.organization || null;
    },
    staleTime: StaleTime.Default,
    ...queryOptions,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enableQuery
        : enableQuery,
  });

  const updateOrganizationData = async (newData: UserOrganization) =>
    queryClient.setQueryData(queryKey, () => newData);

  /**
   * Handles the successful completion of an organization-related operation.
   *
   * This function returns an async handler that updates the organization data,
   * displays a toast message, and optionally executes a callback after the update.
   *
   * @param toastMessage - The message to display in the toast notification upon success.
   * @param callback - An optional async callback to execute after updating the organization data.
   * @returns An async function that takes the updated `UserOrganization` and any additional arguments,
   *          updates the organization data, displays the toast, and invokes the callback if provided.
   */
  const onSuccess = (
    toastMessage: string,
    callback?: (...args: unknown[]) => Promise<void>,
  ) => {
    return async (res: UserOrganization, ...args: unknown[]) => {
      await updateOrganizationData(res);
      displayToast(toastMessage);
      if (callback) {
        await callback(...args);
      }
    };
  };

  /**
   * Handles errors by displaying a toast notification with the error message.
   * If the error message is unavailable, displays a default error message.
   *
   * @param _err - The API error result object containing error details.
   */
  const onError = (_err: ApiErrorResult) => {
    displayToast(_err?.response?.errors?.[0]?.message || DEFAULT_ERROR);
  };

  const { mutateAsync: updateOrganization, isPending: isUpdatingOrganization } =
    useMutation({
      mutationFn: ({ form }: { form: UpdateOrganizationInput }) =>
        updateOrganizationHandler({ id: organizationId, form }),
      onSuccess: onSuccess('The organization has been updated'),
      onError,
    });

  const { mutate: removeOrganizationMember } = useMutation({
    mutationFn: ({ memberId }: { memberId: string }) =>
      removeMember({ id: organizationId, memberId }),
    onSuccess: onSuccess('The organization member has been removed'),
    onError,
  });

  const { mutate: updateOrganizationMemberRole } = useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: OrganizationMemberRole;
    }) => updateMemberRole({ id: organizationId, memberId, role }),
    onSuccess: onSuccess('The organization member role has been updated'),
    onError,
  });

  const { mutate: toggleOrganizationMemberSeat } = useMutation({
    mutationFn: ({ memberId }: { memberId: string }) =>
      updateMemberSeat({ id: organizationId, memberId }),
    onSuccess: onSuccess(
      'The organization member seat has been toggled',
      async ({ memberId }) => {
        if (memberId === user.id) {
          await refetchBoot();
        }
      },
    ),
    onError,
  });

  const { mutateAsync: deleteOrganization, isPending: isDeletingOrganization } =
    useMutation({
      mutationFn: () => deleteOrganizationHandler(organizationId),
      onSuccess: async () => {
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.Organizations, user),
        });
        router.replace(`${settingsUrl}/organization`);
      },
      onError,
    });

  const { mutateAsync: leaveOrganization, isPending: isLeavingOrganization } =
    useMutation({
      mutationFn: () => leaveOrganizationHandler(organizationId),
      onSuccess: async () => {
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.Organizations, user),
        });
        await refetchBoot();
        router.replace(`${settingsUrl}/organization`);
      },
      onError,
    });

  const { organization, role, referralToken, referralUrl, seatType } =
    data || {};

  const seats = {
    total: organization?.seats || 0,
    assigned: organization?.activeSeats || 0,
    available: (organization?.seats || 0) - (organization?.activeSeats || 0),
  };

  const isOwner = role === OrganizationMemberRole.Owner;

  return {
    organization,
    seats,
    role,
    referralToken,
    referralUrl,
    seatType,
    isFetching,
    updateOrganization,
    isUpdatingOrganization,
    isOwner,

    deleteOrganization,
    isDeletingOrganization,

    leaveOrganization,
    isLeavingOrganization,

    removeOrganizationMember,
    updateOrganizationMemberRole,
    toggleOrganizationMemberSeat,
  };
};
