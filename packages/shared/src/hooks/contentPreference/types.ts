import {
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
}: {
  id: string;
  entity: ContentPreferenceType;
  entityName: string;
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
};
