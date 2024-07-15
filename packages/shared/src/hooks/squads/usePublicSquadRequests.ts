import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { differenceInDays, subDays } from 'date-fns';
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
import { PUBLIC_SQUAD_REQUEST_COOLDOWN } from '../../lib/config';

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

interface UsePublicSquadRequestsResult {
  submitForReview: () => Promise<PublicSquadRequest>;
  isSubmitLoading: boolean;
  requests: InfiniteData<Connection<PublicSquadRequest>>;
  latestRequest: PublicSquadRequest;
  isFetched: boolean;
  status: SquadStatus;
  daysLeft: number;
}

interface UsePublicSquadRequestsProps {
  isQueryEnabled?: boolean;
  sourceId: string;
  status?: string;
  isPublic?: boolean;
  onSuccessfulSubmission?: () => void;
}

const remoteStatusMap: Record<PublicSquadRequestStatus, SquadStatus> = {
  [PublicSquadRequestStatus.Approved]: SquadStatus.Approved,
  [PublicSquadRequestStatus.Rejected]: SquadStatus.Rejected,
  [PublicSquadRequestStatus.Pending]: SquadStatus.Pending,
};

export const usePublicSquadRequests = ({
  isQueryEnabled,
  isPublic,
  sourceId,
  onSuccessfulSubmission,
}: UsePublicSquadRequestsProps): UsePublicSquadRequestsResult => {
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const client = useQueryClient();
  const key = useMemo(
    () => generateQueryKey(RequestKey.PublicSquadRequests, user),
    [user],
  );
  const { data: requests, isFetched } = useInfiniteQuery(
    key,
    (params) => getPublicSquadRequests({ ...params, sourceId }),
    {
      enabled: isQueryEnabled && !!sourceId && !isPublic,
      staleTime: StaleTime.Default,
    },
  );

  const { mutateAsync: submitForReview, isLoading: isSubmitLoading } =
    useMutation(() => submitSquadForReview(sourceId), {
      onSuccess: () => {
        displayToast(
          `Your Squad's public access request is in review. You'll hear back from us shortly.`,
        );

        client.invalidateQueries(key);

        if (onSuccessfulSubmission) {
          onSuccessfulSubmission();
        }
      },
      onError: (error: ApiErrorResult) => {
        const result = parseOrDefault<Record<string, string>>(
          error?.response?.errors?.[0]?.message,
        );

        displayToast(typeof result === 'string' ? result : DEFAULT_ERROR);
      },
    });

  const edges = requests?.pages.at(-1)?.edges;
  const latestRequest = edges?.[edges?.length - 1]?.node;

  const status = useMemo(() => {
    if (isPublic) {
      return SquadStatus.Approved;
    }

    if (!latestRequest) {
      return SquadStatus.InProgress;
    }

    if (latestRequest.status === PublicSquadRequestStatus.Rejected) {
      const withinCooldown = subDays(new Date(), PUBLIC_SQUAD_REQUEST_COOLDOWN);
      const requestDate = new Date(latestRequest.createdAt);
      return withinCooldown < requestDate
        ? SquadStatus.Rejected
        : SquadStatus.InProgress;
    }

    return remoteStatusMap[latestRequest.status];
  }, [latestRequest, isPublic]);

  const daysLeft = useMemo(() => {
    if (
      !latestRequest ||
      latestRequest.status !== PublicSquadRequestStatus.Rejected
    ) {
      return 0;
    }

    const difference = differenceInDays(
      new Date(),
      new Date(latestRequest.createdAt),
    );

    return Math.max(0, PUBLIC_SQUAD_REQUEST_COOLDOWN - difference);
  }, [latestRequest]);

  return {
    submitForReview,
    isSubmitLoading,
    requests,
    isFetched: isFetched && !!requests,
    latestRequest,
    status,
    daysLeft,
  };
};
