import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { BriefingType } from '../../../graphql/posts';
import { getGenerateBriefingMutationOptions } from '../../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { ActionType } from '../../../graphql/actions';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions, useToastNotification } from '../../../hooks';
import { useBriefContext } from '../../../components/cards/brief/BriefContext';

interface UseGenerateBriefingProps {
  onGenerated?: () => void;
}

export const useGenerateBrief = ({ onGenerated }: UseGenerateBriefingProps) => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { completeAction } = useActions();
  const { setBrief } = useBriefContext();

  const { isPending: isGenerating, mutateAsync: requestBrief } = useMutation({
    ...getGenerateBriefingMutationOptions(),
    onSuccess: async ({ id, balance }) => {
      displayToast('Your Presidential Briefing is being generated ✅');

      if (balance) {
        updateUser({
          ...user,
          balance,
        });
      }

      setBrief({
        id,
        createdAt: new Date(),
      });

      await Promise.all([
        queryClient.refetchQueries({
          queryKey: generateQueryKey(RequestKey.Feeds, user, 'briefing'),
        }),
        completeAction(ActionType.GeneratedBrief),
      ]);

      onGenerated?.();
    },
    onError: () => {
      displayToast(
        'There was an error generating your Presidential Briefing. Please try again later.',
      );
    },
  });

  const generate = useCallback(
    ({ type }: { type: BriefingType }) => {
      if (!isGenerating && !!user) {
        requestBrief({ type });
      }
    },
    [requestBrief, isGenerating, user],
  );

  return {
    isGenerating,
    generate,
  };
};
