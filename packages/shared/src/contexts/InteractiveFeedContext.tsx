import type { PropsWithChildren, ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useFeedSettings from '../hooks/useFeedSettings';
import useReportPost from '../hooks/useReportPost';
import { useBookmarkPost } from '../hooks/useBookmarkPost';
import type { Post } from '../graphql/posts';
import { LogEvent, Origin } from '../lib/log';
import { useLogContext } from './LogContext';
import { RequestKey } from '../lib/query';

export const ONBOARDING_PREVIEW_KEY = 'onboarding-preview';

interface InteractiveFeedContextData {
  approvedPosts: string[];
  hiddenPosts: string[];
  hidePost: (postId: string) => void;
  approvePost: (post: Post) => void;
  interactiveFeedExp: boolean;
}

const InteractiveFeedContext = React.createContext<InteractiveFeedContextData>({
  approvedPosts: [],
  hiddenPosts: [],
  hidePost: () => {},
  approvePost: () => {},
  interactiveFeedExp: false,
});
export const useInteractiveFeedContext = (): InteractiveFeedContextData =>
  React.useContext(InteractiveFeedContext);

interface InteractiveFeedState {
  approved: string[];
  hidden: string[];
}

interface UseInteractiveCompletion {
  posts: InteractiveFeedState;
  updatePosts: (newPosts: InteractiveFeedState) => void;
  completion: number;
}

export const useInteractiveCompletion = (): UseInteractiveCompletion => {
  const client = useQueryClient();
  const { feedSettings } = useFeedSettings({});
  const { data: posts } = useQuery<InteractiveFeedState>({
    queryKey: [RequestKey.InteractiveFeed],
    initialData: () => {
      const postsFromStorage = localStorage.getItem(ONBOARDING_PREVIEW_KEY);

      if (postsFromStorage) {
        return JSON.parse(postsFromStorage);
      }

      return { approved: [], hidden: [] };
    },
  });
  const updatePosts = useCallback(
    (newPosts: InteractiveFeedState) => {
      client.setQueryData([RequestKey.InteractiveFeed], newPosts);
      localStorage.setItem(ONBOARDING_PREVIEW_KEY, JSON.stringify(newPosts));
    },

    [client],
  );

  const completion = useMemo(() => {
    let totalCompletion = 0;

    if (feedSettings?.includeTags?.length) {
      totalCompletion += Math.min(75, feedSettings.includeTags.length * 5);
    }

    if (feedSettings?.blockedTags?.length) {
      totalCompletion += Math.min(25, feedSettings.blockedTags.length * 5);
    }

    if (posts.approved.length) {
      totalCompletion += Math.min(25, posts.approved.length * 5);
    }

    return totalCompletion > 100 ? 100 : totalCompletion;
  }, [posts, feedSettings]);

  return { posts, updatePosts, completion };
};

export const InteractiveFeedProvider = ({
  children,
}: PropsWithChildren): ReactElement => {
  const { logEvent } = useLogContext();
  const { hidePost: handleHidePost } = useReportPost();
  const { toggleBookmark } = useBookmarkPost();
  const { posts, updatePosts } = useInteractiveCompletion();

  const approvePost = (post: Post) => {
    toggleBookmark({
      post,
      origin: Origin.Feed,
      opts: {
        extra: {
          feed: 'onboarding',
        },
      },
      disableToast: true,
    });
    const updatedPosts = {
      ...posts,
      approved: [...posts.approved, post.id],
    };
    updatePosts(updatedPosts);
  };

  const hidePost = (postId: string) => {
    handleHidePost(postId);
    const updatedPosts = {
      ...posts,
      hidden: [...posts.hidden, postId],
    };
    logEvent({
      event_name: LogEvent.HidePost,
      origin: Origin.Feed,
      extra: JSON.stringify({
        feed: 'onboarding',
      }),
    });
    updatePosts(updatedPosts);
  };

  return (
    <InteractiveFeedContext.Provider
      value={{
        approvedPosts: posts.approved,
        hiddenPosts: posts.hidden,
        hidePost,
        approvePost,
        interactiveFeedExp: true,
      }}
    >
      {children}
    </InteractiveFeedContext.Provider>
  );
};
