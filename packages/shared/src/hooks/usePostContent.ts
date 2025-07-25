import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Post, PostsEngaged, SharedPost } from '../graphql/posts';
import { POSTS_ENGAGED_SUBSCRIPTION, PostType } from '../graphql/posts';
import { useLogContext } from '../contexts/LogContext';
import { useActiveFeedContext } from '../contexts';
import { postLogEvent } from '../lib/feed';
import useOnPostClick from './useOnPostClick';
import useSubscription from './useSubscription';
import type { PostOrigin } from './log/useLogContextData';
import { updatePostCache } from '../lib/query';
import { ReferralCampaignKey } from '../lib';
import { useGetShortUrl } from './utils/useGetShortUrl';
import { ShareProvider } from '../lib/share';
import { useCopyPostLink } from './useCopyPostLink';
import type { EmptyPromise } from '../lib/func';
import type { Origin } from '../lib/log';
import { LogEvent } from '../lib/log';

export interface UsePostContent {
  onCopyPostLink: () => void;
  onReadArticle: () => Promise<void>;
}

export interface UsePostContentProps {
  origin: PostOrigin;
  post: Post;
}

interface UseReadArticle {
  origin: Origin;
  post: Post | SharedPost;
}

export const useReadArticle = ({
  post,
  origin,
}: UseReadArticle): EmptyPromise => {
  const onPostClick = useOnPostClick({ origin });

  return useCallback(
    () =>
      onPostClick({
        post: post?.sharedPost || post,
        optional: { parent_id: post.sharedPost && post.id },
      }),
    [onPostClick, post],
  );
};

const usePostContent = ({
  origin,
  post,
}: UsePostContentProps): UsePostContent => {
  const id = post?.id;
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { logOpts } = useActiveFeedContext();
  const onReadArticle = useReadArticle({ origin, post });
  const { commentsPermalink } = post;
  const cid = ReferralCampaignKey.SharePost;
  const { getShortUrl } = useGetShortUrl();
  const [, copyLink] = useCopyPostLink();
  const logShareEvent = useCallback(
    (provider: ShareProvider) =>
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider, origin },
          ...(logOpts && logOpts),
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [origin, post, logOpts],
  );

  const onCopyLink = useCallback(async () => {
    const shortLink = await getShortUrl(commentsPermalink, cid);
    copyLink({ link: shortLink });
    logShareEvent(ShareProvider.CopyLink);
  }, [cid, commentsPermalink, copyLink, getShortUrl, logShareEvent]);

  useSubscription(
    () => ({
      query: POSTS_ENGAGED_SUBSCRIPTION,
      variables: {
        ids: [id],
      },
    }),
    {
      next: (data: PostsEngaged) => {
        if (data.postsEngaged.id === id) {
          updatePostCache(queryClient, post.id, data.postsEngaged);
        }
      },
    },
  );

  const loggedPostEvent = useRef(null);

  useEffect(() => {
    if (!post) {
      return;
    }

    if (loggedPostEvent.current === post.id) {
      return;
    }

    loggedPostEvent.current = post.id;

    logEvent(
      postLogEvent(`${origin} view`, post, {
        extra: {
          clickbait_badge:
            post.type === PostType.Share
              ? post.sharedPost.clickbaitTitleDetected
              : post.clickbaitTitleDetected,
        },
        ...(logOpts && logOpts),
      }),
    );
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  return {
    onReadArticle,
    onCopyPostLink: onCopyLink,
  };
};

export default usePostContent;
