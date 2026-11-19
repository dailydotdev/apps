import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { FeedPostExplanationRequest } from './graphql';
import { feedPostExplanationQueryOptions } from './queries';
import type { FeedItemExplain } from './types';

export enum FeedPostExplanationStatus {
  Ready = 'ready',
  Loading = 'loading',
  /** The feed service no longer has the page the post was served in. */
  Expired = 'expired',
  Failed = 'failed',
}

interface UseFeedPostExplanationProps {
  postId: string;
  /** The card's own, in Debug mode. */
  explain: FeedItemExplain | null | undefined;
  /** The feed request the post was served in, to ask for it otherwise. */
  request: FeedPostExplanationRequest | undefined;
}

interface UseFeedPostExplanation {
  explain: FeedItemExplain | null | undefined;
  status: FeedPostExplanationStatus;
}

/**
 * A post's explanation: the one the card carries in Debug mode, otherwise
 * asked for when the full explanation opens, so For You doesn't load one per
 * card on every visit.
 */
export const useFeedPostExplanation = ({
  postId,
  explain,
  request,
}: UseFeedPostExplanationProps): UseFeedPostExplanation => {
  const { user } = useAuthContext();
  const isOnDemand = explain === undefined && !!request;
  const { data, isPending, isError } = useQuery(
    feedPostExplanationQueryOptions(
      user,
      postId,
      isOnDemand ? request : undefined,
    ),
  );

  if (!isOnDemand) {
    return { explain, status: FeedPostExplanationStatus.Ready };
  }
  if (data) {
    return { explain: data, status: FeedPostExplanationStatus.Ready };
  }
  if (isError) {
    return { explain: undefined, status: FeedPostExplanationStatus.Failed };
  }
  if (isPending) {
    return { explain: undefined, status: FeedPostExplanationStatus.Loading };
  }
  return { explain: undefined, status: FeedPostExplanationStatus.Expired };
};
