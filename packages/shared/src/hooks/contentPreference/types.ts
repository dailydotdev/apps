import type {
  ContentPreference,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { ContentPreferenceStatus } from '../../graphql/contentPreference';
import { RequestKey } from '../../lib/query';
import type { PropsParameters } from '../../types';
import type { UseMutationMatcher } from '../mutationSubscription/types';

export type ContentPreferenceMutation = ({
  id,
  entity,
  entityName,
  feedId,
  opts,
}: {
  id: string;
  entity: ContentPreferenceType;
  entityName: string;
  feedId?: string;
  opts?: Partial<{
    extra: Record<string, unknown>;
  }>;
}) => Promise<void>;

export const contentPreferenceMutationMatcher: UseMutationMatcher<
  PropsParameters<ContentPreferenceMutation>
> = ({ status, mutation }) => {
  const [requestKey] = Array.isArray(mutation.options.mutationKey)
    ? mutation.options.mutationKey
    : [];

  return (
    status === 'success' &&
    [
      RequestKey.ContentPreferenceFollow,
      RequestKey.ContentPreferenceUnfollow,
      RequestKey.ContentPreferenceSubscribe,
      RequestKey.ContentPreferenceUnsubscribe,
      RequestKey.ContentPreferenceUnblock,
      RequestKey.ContentPreferenceBlock,
    ].includes(requestKey as RequestKey)
  );
};

export const mutationKeyToContentPreferenceStatusMap: Partial<
  Record<RequestKey, ContentPreferenceStatus | null>
> = {
  [RequestKey.ContentPreferenceFollow]: ContentPreferenceStatus.Follow,
  [RequestKey.ContentPreferenceUnfollow]: null,
  [RequestKey.ContentPreferenceSubscribe]: ContentPreferenceStatus.Subscribed,
  [RequestKey.ContentPreferenceUnsubscribe]: ContentPreferenceStatus.Follow,
  [RequestKey.ContentPreferenceUnblock]: null,
  [RequestKey.ContentPreferenceBlock]: ContentPreferenceStatus.Blocked,
};

export const isFollowingContent = (
  contentPreference: ContentPreference | undefined,
): boolean => {
  return [
    ContentPreferenceStatus.Follow,
    ContentPreferenceStatus.Subscribed,
  ].includes(contentPreference?.status);
};
