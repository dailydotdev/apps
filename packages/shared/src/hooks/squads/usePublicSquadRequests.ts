import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { useMemo } from 'react';
import { useToastNotification } from '../useToastNotification';
import {
  getPublicSquadRequests,
  submitSquadForReview,
} from '../../graphql/squads';
import { ApiErrorResult, Connection } from '../../graphql/common';
import { parseOrDefault } from '../../lib/func';
import {
  PublicSquadRequest,
  PublicSquadRequestStatus,
} from '../../graphql/sources';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { SquadStatus } from '../../components/squads/settings';

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

interface UsePublicSquadRequestsResult {
  submitForReview: () => Promise<PublicSquadRequest>;
  isSubmitLoading: boolean;
  requests: InfiniteData<Connection<PublicSquadRequest>>;
  latestRequest: PublicSquadRequest;
  isFetched: boolean;
  status: SquadStatus;
}

interface UsePublicSquadRequestsProps {
  isQueryEnabled?: boolean;
  sourceId: string;
  status?: string;
}

const remoteStatusMap: Record<PublicSquadRequestStatus, SquadStatus> = {
  [PublicSquadRequestStatus.Approved]: SquadStatus.Approved,
  [PublicSquadRequestStatus.Rejected]: SquadStatus.Rejected,
  [PublicSquadRequestStatus.Pending]: SquadStatus.Pending,
};

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

  const edges = requests?.pages[requests?.pages?.length - 1]?.edges;
  const latestRequest = edges?.[edges?.length - 1]?.node;

  const status = useMemo(() => {
    if (!latestRequest) {
      return SquadStatus.InProgress;
    }

    if (latestRequest.status === PublicSquadRequestStatus.Rejected) {
      const fourteenDaysAgo = subDays(new Date(), 14);
      const requestDate = new Date(latestRequest.createdAt);
      return fourteenDaysAgo < requestDate
        ? SquadStatus.Rejected
        : SquadStatus.InProgress;
    }

    return remoteStatusMap[latestRequest.status];
  }, [latestRequest]);

  return {
    submitForReview,
    isSubmitLoading,
    requests,
    isFetched: isFetched && !!requests,
    latestRequest,
    status,
  };
};
