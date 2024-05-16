import { useMutation } from '@tanstack/react-query';
import { useToastNotification } from '../useToastNotification';
import { submitSquadForReview } from '../../graphql/squads';
import { ApiErrorResult } from '../../graphql/common';
import { parseOrDefault } from '../../lib/func';
import { PublicSquadRequest } from '../../graphql/sources';

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

interface UsePublicSquadRequestsResult {
  submitForReview: (squadId: string) => Promise<PublicSquadRequest>;
  isSubmitLoading: boolean;
}

export const usePublicSquadRequests = (): UsePublicSquadRequestsResult => {
  const { displayToast } = useToastNotification();

  const { mutateAsync: submitForReview, isLoading: isSubmitLoading } =
    useMutation(submitSquadForReview, {
      onSuccess: () => {
        displayToast(
          `Your Squad's public access request is in review. You'll hear back from us shortly.`,
        );
      },
      onError: (error: ApiErrorResult) => {
        const result = parseOrDefault<Record<string, string>>(
          error?.response?.errors?.[0]?.message,
        );

        displayToast(typeof result === 'string' ? result : DEFAULT_ERROR);
      },
    });

  return {
    submitForReview,
    isSubmitLoading,
  };
};
