import {
  ContentPreference,
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { RequestKey } from '../../lib/query';
import { PropsParameters } from '../../types';
import { UseMutationMatcher } from '../mutationSubscription/types';

export type ContentPreferenceMutation = ({
  id,
  entity,
  entityName,
  opts,
}: {
  id: string;
  entity: ContentPreferenceType;
  entityName: string;
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
};

export const isFollowingContent = (
  contentPreference: ContentPreference | undefined,
): boolean => {
  return [
    ContentPreferenceStatus.Follow,
    ContentPreferenceStatus.Subscribed,
  ].includes(contentPreference?.status);
};
