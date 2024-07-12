import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import { useState } from 'react';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { UPDATE_README_MUTATION, USER_README_QUERY } from '../../graphql/users';
import { PublicProfile } from '../../lib/user';
import { useToastNotification } from '../useToastNotification';
import { gqlClient } from '../../graphql/common';

export type UseProfileReadmeRet = {
  readme?: string;
  isLoadingReadme: boolean;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  updateReadme: (content: string) => Promise<unknown>;
  submitting: boolean;
};

export function useProfileReadme(user: PublicProfile): UseProfileReadmeRet {
  const { displayToast } = useToastNotification();
  const client = useQueryClient();
  const [editMode, setEditMode] = useState(false);

  const queryKey = generateQueryKey(RequestKey.Readme, user);
  const { data: remoteReadme, isLoading } = useQuery<{
    user: { readme: string };
  }>(
    queryKey,
    () =>
      gqlClient.request(USER_README_QUERY, {
        id: user.id,
      }),
    {
      enabled: editMode,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  );

  const { mutateAsync: updateReadme, isLoading: submitting } = useMutation<
    { updateReadme: { readmeHtml: string } },
    unknown,
    string
  >((content) => gqlClient.request(UPDATE_README_MUTATION, { content }), {
    onSuccess: async () => {
      setEditMode(false);
      await client.invalidateQueries(queryKey);
      await client.invalidateQueries(
        generateQueryKey(RequestKey.Profile, user),
      );
    },
    onError: (err) => {
      const clientError = err as ClientError;
      const message = clientError?.response?.errors?.[0]?.message;
      if (!message) {
        return;
      }

      displayToast(message);
    },
  });

  return {
    readme: remoteReadme?.user.readme,
    isLoadingReadme: isLoading,
    editMode,
    setEditMode,
    updateReadme,
    submitting,
  };
}
