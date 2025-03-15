import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useFeedSettings from '../hooks/useFeedSettings';
import useReportPost from '../hooks/useReportPost';
import { useBookmarkPost } from '../hooks/useBookmarkPost';
import type { Post } from '../graphql/posts';
import { LogEvent, Origin } from '../lib/log';
import { useConditionalFeature, useViewSize, ViewSize } from '../hooks';
import { featureInteractiveFeed } from '../lib/featureManagement';
import { useLogContext } from './LogContext';
import { useAuthContext } from './AuthContext';

export const ONBOARDING_PREVIEW_KEY = 'onboarding-preview';

type InteractiveFeedContextProps = {
  completion: number;
  approvedPosts: string[];
  hiddenPosts: string[];
  hidePost: (postId: string) => void;
  approvePost: (post: Post) => void;
  interactiveFeedExp: boolean;
  isOnboarding: boolean;
};

const InteractiveFeedContext = React.createContext(null);
export const useInteractiveFeedContext = (): InteractiveFeedContextProps =>
  React.useContext(InteractiveFeedContext);

export const InteractiveFeedProvider = ({
  children,
}: PropsWithChildren): ReactElement => {
  const { user } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const router = useRouter();
  const { logEvent } = useLogContext();
  const isOnboarding = router.pathname.includes('/onboarding');
  const shouldEvaluate = useMemo(() => {
    return isLaptop && isOnboarding && !!user?.id;
  }, [isLaptop, isOnboarding, user]);
  const { value: interactiveFeedExp } = useConditionalFeature({
    feature: featureInteractiveFeed,
    shouldEvaluate,
  });
  const { feedSettings } = useFeedSettings({});
  const { hidePost: handleHidePost } = useReportPost();
  const { toggleBookmark } = useBookmarkPost();

  const [posts, setPosts] = useState<{
    approved: string[];
    hidden: string[];
  }>({
    approved: [],
    hidden: [],
  });

  useEffect(() => {
    if (!interactiveFeedExp) {
      return;
    }
    const postsFromStorage = localStorage.getItem(ONBOARDING_PREVIEW_KEY);
    if (postsFromStorage) {
      setPosts(JSON.parse(postsFromStorage));
    }
  }, [interactiveFeedExp]);

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
    setPosts(updatedPosts);
    localStorage.setItem(ONBOARDING_PREVIEW_KEY, JSON.stringify(updatedPosts));
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
    setPosts(updatedPosts);
    localStorage.setItem(ONBOARDING_PREVIEW_KEY, JSON.stringify(updatedPosts));
  };

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

  return (
    <InteractiveFeedContext.Provider
      value={{
        completion,
        approvedPosts: posts.approved,
        hiddenPosts: posts.hidden,
        hidePost,
        approvePost,
        interactiveFeedExp,
        isOnboarding,
      }}
    >
      {children}
    </InteractiveFeedContext.Provider>
  );
};
