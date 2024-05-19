import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import { useToastNotification } from '../useToastNotification';
import {
  getPublicSquadRequests,
  submitSquadForReview,
} from '../../graphql/squads';
import { ApiErrorResult, Connection } from '../../graphql/common';
import { parseOrDefault } from '../../lib/func';
import { PublicSquadRequest } from '../../graphql/sources';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

interface UsePublicSquadRequestsResult {
  submitForReview: () => Promise<PublicSquadRequest>;
  isSubmitLoading: boolean;
  requests: InfiniteData<Connection<PublicSquadRequest>>;
  latestRequest: PublicSquadRequest;
  isFetched: boolean;
}

interface UsePublicSquadRequestsProps {
  isQueryEnabled?: boolean;
  sourceId: string;
}

export const usePublicSquadRequests = ({
  isQueryEnabled,
  sourceId,
}: UsePublicSquadRequestsProps): UsePublicSquadRequestsResult => {
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const { data: requests, isFetched } = useInfiniteQuery(
    generateQueryKey(RequestKey.PublicSquadRequests, user),
    (params) => getPublicSquadRequests({ ...params, sourceId }),
    { enabled: isQueryEnabled && !!sourceId, staleTime: StaleTime.Default },
  );

  const { mutateAsync: submitForReview, isLoading: isSubmitLoading } =
    useMutation(() => submitSquadForReview(sourceId), {
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
    requests,
    isFetched: isFetched && !!requests,
    get latestRequest() {
      const edges = requests?.pages[requests?.pages?.length - 1]?.edges;

      return edges?.[edges?.length - 1]?.node;
    },
  };
};
