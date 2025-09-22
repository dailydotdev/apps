import React from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeedData, Post, VotePollResponse } from '../graphql/posts';
import { votePoll } from '../graphql/posts';
import {
  findIndexOfPostInData,
  updateCachedPagePost,
  updatePostCache,
} from '../lib/query';
import { useActiveFeedContext } from '../contexts';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import useNotificationSettings from './notifications/useNotificationSettings';
import { useToastNotification } from './useToastNotification';
import { ButtonSize } from '../components/buttons/common';
import { BellIcon } from '../components/icons';
import { useAuthContext } from '../contexts/AuthContext';

const usePoll = ({ post }: { post: Post }) => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { queryKey } = useActiveFeedContext();
  const queryClient = useQueryClient();
  const { toggleGroup, getGroupStatus } = useNotificationSettings();
  const { displayToast } = useToastNotification();

  const { mutate, isPending: isCastingVote } = useMutation({
    mutationFn: (optionId: string) => votePoll({ postId: post.id, optionId }),
    onSuccess: (data: VotePollResponse, optionId: string) => {
      const postUpdate = {
        numPollVotes: data.numPollVotes,
        pollOptions: data.pollOptions,
        userState: {
          ...post.userState,
          pollOption: { id: optionId },
        },
      };

      updatePostCache(queryClient, post.id, postUpdate);
      const updateFeed = updateCachedPagePost(queryKey, queryClient);
      const feedData =
        queryClient.getQueryData<InfiniteData<FeedData>>(queryKey);

      const { pageIndex, index } = findIndexOfPostInData(
        feedData,
        post.id,
        false,
      );

      if (pageIndex > -1 && index > -1) {
        const currentPost = feedData.pages[pageIndex].page.edges[index].node;
        const updatedPost = {
          ...currentPost,
          ...postUpdate,
        };
        updateFeed(pageIndex, index, updatedPost);
      }

      const isSubscribed = getGroupStatus('pollResult', 'inApp');
      if (post?.author?.id !== user?.id && !isSubscribed) {
        displayToast('Your vote is in, get notified when the poll ends', {
          action: {
            onClick: () => toggleGroup('pollResult', true, 'inApp'),
            copy: 'Enable',
            buttonProps: {
              className: 'bg-background-default text-text-primary',
              size: ButtonSize.Small,
              icon: <BellIcon />,
            },
          },
        });
      }
    },
  });

  const onVote = (optionId: string, optionValue: string) => {
    mutate(optionId);
    logEvent({
      event_name: LogEvent.VotePoll,
      extra: JSON.stringify({ optionId, optionValue }),
    });
  };

  return { onVote, isCastingVote };
};

export default usePoll;
