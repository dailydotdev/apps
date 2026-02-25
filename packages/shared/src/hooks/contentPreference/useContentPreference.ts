import { useMutation } from '@tanstack/react-query';
import {
  CONTENT_PREFERENCE_BLOCK_MUTATION,
  CONTENT_PREFERENCE_FOLLOW_MUTATION,
  CONTENT_PREFERENCE_UNBLOCK_MUTATION,
  CONTENT_PREFERENCE_UNFOLLOW_MUTATION,
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { useAuthContext } from '../../contexts/AuthContext';
import { gqlClient } from '../../graphql/common';
import { useToastNotification } from '../useToastNotification';
import type { ContentPreferenceMutation } from './types';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { AuthTriggers } from '../../lib/auth';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useActivePostContext } from '../../contexts/ActivePostContext';

export type UseContentPreference = {
  follow: ContentPreferenceMutation;
  unfollow: ContentPreferenceMutation;
  subscribe: ContentPreferenceMutation;
  unsubscribe: ContentPreferenceMutation;
  block: ContentPreferenceMutation;
  unblock: ContentPreferenceMutation;
};

type UseContentPreferenceProps = {
  showToastOnSuccess?: boolean;
};

const getTargetType = (entity: ContentPreferenceType): string =>
  entity === ContentPreferenceType.Keyword ? TargetType.Tag : entity;

export const useContentPreference = ({
  showToastOnSuccess,
}: UseContentPreferenceProps = {}): UseContentPreference => {
  const { user, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const referrerPost = useActivePostContext()?.activePost;

  const { mutateAsync: follow } = useMutation({
    mutationKey: generateQueryKey(RequestKey.ContentPreferenceFollow, user),
    mutationFn: async ({
      id,
      entity,
      entityName,
      feedId,
      opts,
    }: Parameters<ContentPreferenceMutation>[0]) => {
      const extra =
        opts?.extra || feedId || referrerPost
          ? JSON.stringify({
              ...opts?.extra,
              feedId,
              ...(!!referrerPost && {
                author:
                  entity === ContentPreferenceType.User &&
                  referrerPost.author?.id === id
                    ? 1
                    : 0,
              }),
            })
          : undefined;
      if (!user) {
        showLogin({ trigger: AuthTriggers.Follow });

        throw new Error('not logged in');
      }

      logEvent({
        event_name: LogEvent.Follow,
        target_id: id,
        target_type: getTargetType(entity),
        extra: extra || undefined,
      });

      await gqlClient.request(CONTENT_PREFERENCE_FOLLOW_MUTATION, {
        id,
        entity,
        feedId,
        status: ContentPreferenceStatus.Follow,
      });

      if (showToastOnSuccess) {
        displayToast(`✅ You are now following ${entityName}`);
      }
    },
  });

  const { mutateAsync: unfollow } = useMutation({
    mutationKey: generateQueryKey(RequestKey.ContentPreferenceUnfollow, user),
    mutationFn: async ({
      id,
      entity,
      entityName,
      feedId,
      opts,
    }: Parameters<ContentPreferenceMutation>[0]) => {
      const extra =
        opts?.extra || feedId
          ? JSON.stringify({ ...opts?.extra, feedId })
          : undefined;
      if (!user) {
        showLogin({ trigger: AuthTriggers.Follow });

        throw new Error('not logged in');
      }

      logEvent({
        event_name: LogEvent.Unfollow,
        target_id: id,
        target_type: getTargetType(entity),
        extra: extra || undefined,
      });

      await gqlClient.request(CONTENT_PREFERENCE_UNFOLLOW_MUTATION, {
        id,
        entity,
        feedId,
      });

      displayToast(`⛔️ You are no longer following ${entityName}`);
    },
  });

  const { mutateAsync: subscribe } = useMutation({
    mutationKey: generateQueryKey(RequestKey.ContentPreferenceSubscribe, user),
    mutationFn: async ({
      id,
      entity,
      entityName,
      feedId,
      opts,
    }: Parameters<ContentPreferenceMutation>[0]) => {
      const extra =
        opts?.extra || feedId
          ? JSON.stringify({ ...opts?.extra, feedId })
          : undefined;
      if (!user) {
        showLogin({ trigger: AuthTriggers.Follow });

        throw new Error('not logged in');
      }

      logEvent({
        event_name: LogEvent.Subscribe,
        target_id: id,
        target_type: getTargetType(entity),
        extra: extra || undefined,
      });

      await gqlClient.request(CONTENT_PREFERENCE_FOLLOW_MUTATION, {
        id,
        entity,
        status: ContentPreferenceStatus.Subscribed,
        feedId,
      });

      displayToast(`✅ You are now subscribed to ${entityName}`);
    },
  });

  const { mutateAsync: unsubscribe } = useMutation({
    mutationKey: generateQueryKey(
      RequestKey.ContentPreferenceUnsubscribe,
      user,
    ),
    mutationFn: async ({
      id,
      entity,
      entityName,
      feedId,
      opts,
    }: Parameters<ContentPreferenceMutation>[0]) => {
      const extra =
        opts?.extra || feedId
          ? JSON.stringify({ ...opts?.extra, feedId })
          : undefined;
      if (!user) {
        showLogin({ trigger: AuthTriggers.Follow });

        throw new Error('not logged in');
      }

      logEvent({
        event_name: LogEvent.Unsubscribe,
        target_id: id,
        target_type: getTargetType(entity),
        extra: extra || undefined,
      });

      await gqlClient.request(CONTENT_PREFERENCE_FOLLOW_MUTATION, {
        id,
        entity,
        status: ContentPreferenceStatus.Follow,
        feedId,
      });

      displayToast(`⛔️ You are no longer subscribed to ${entityName}`);
    },
  });

  const { mutateAsync: block } = useMutation({
    mutationKey: generateQueryKey(RequestKey.ContentPreferenceBlock, user),
    mutationFn: async ({
      id,
      entity,
      entityName,
      feedId,
      opts,
    }: Parameters<ContentPreferenceMutation>[0]) => {
      const extra =
        opts?.extra || feedId
          ? JSON.stringify({ ...opts?.extra, feedId })
          : undefined;
      if (!user) {
        showLogin({ trigger: AuthTriggers.Follow });

        throw new Error('not logged in');
      }

      logEvent({
        event_name: LogEvent.Block,
        target_id: id,
        target_type: getTargetType(entity),
        extra: extra || undefined,
      });

      await gqlClient.request(CONTENT_PREFERENCE_BLOCK_MUTATION, {
        id,
        entity,
        feedId,
      });

      if (opts?.hideToast) {
        return;
      }

      if (entity === ContentPreferenceType.User) {
        displayToast(`🚫 ${entityName} has been blocked`);
      } else {
        displayToast(`⛔️ You blocked the following ${entityName}: ${id}`);
      }
    },
  });

  const { mutateAsync: unblock } = useMutation({
    mutationKey: generateQueryKey(RequestKey.ContentPreferenceUnblock, user),
    mutationFn: async ({
      id,
      entity,
      entityName,
      feedId,
      opts,
    }: Parameters<ContentPreferenceMutation>[0]) => {
      const extra =
        opts?.extra || feedId
          ? JSON.stringify({ ...opts?.extra, feedId })
          : undefined;
      if (!user) {
        showLogin({ trigger: AuthTriggers.Follow });

        throw new Error('not logged in');
      }

      logEvent({
        event_name: LogEvent.Unblock,
        target_id: id,
        target_type: getTargetType(entity),
        extra: extra || undefined,
      });

      await gqlClient.request(CONTENT_PREFERENCE_UNBLOCK_MUTATION, {
        id,
        entity,
        feedId,
      });

      displayToast(`⛔️ You unblocked ${entityName}`);
    },
  });

  return {
    follow,
    unfollow,
    subscribe,
    unsubscribe,
    block,
    unblock,
  };
};
