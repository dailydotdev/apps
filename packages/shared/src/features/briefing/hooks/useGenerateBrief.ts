import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { atom } from 'jotai/vanilla';
import { useSetAtom } from 'jotai/react';
import type { BriefingType } from '../../../graphql/posts';
import { getGenerateBriefingMutationOptions } from '../../../graphql/posts';
import { ActionType } from '../../../graphql/actions';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions, useToastNotification } from '../../../hooks';
import { useBriefContext } from '../../../components/cards/brief/BriefContext';

interface UseGenerateBriefingProps {
  onGenerated?: () => void;
}

export const isBriefGenerationPending = atom(false);

export const useGenerateBrief = ({ onGenerated }: UseGenerateBriefingProps) => {
  const { user, updateUser } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { completeAction } = useActions();
  const { setBrief } = useBriefContext();
  const setPendingStatus = useSetAtom(isBriefGenerationPending);

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

      completeAction(ActionType.GeneratedBrief);
      onGenerated?.();
    },
    onError: () => {
      displayToast(
        'There was an error generating your Presidential Briefing. Please try again later.',
      );
    },
    onSettled: () => {
      setPendingStatus(false);
    },
  });

  const generate = useCallback(
    ({ type }: { type: BriefingType }) => {
      setPendingStatus(true);
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
