import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Post,
  PostsEngaged,
  POSTS_ENGAGED_SUBSCRIPTION,
} from '../graphql/posts';
import { useLogContext } from '../contexts/LogContext';
import { postLogEvent } from '../lib/feed';
import useOnPostClick from './useOnPostClick';
import useSubscription from './useSubscription';
import { PostOrigin } from './log/useLogContextData';
import { updatePostCache } from './usePostById';
import { ReferralCampaignKey } from '../lib';
import { useGetShortUrl } from './utils/useGetShortUrl';
import { ShareProvider } from '../lib/share';
import { useCopyPostLink } from './useCopyPostLink';

export interface UsePostContent {
  onCopyPostLink: () => void;
  onReadArticle: () => Promise<void>;
}

export interface UsePostContentProps {
  origin: PostOrigin;
  post: Post;
}

const usePostContent = ({
  origin,
  post,
}: UsePostContentProps): UsePostContent => {
  const id = post?.id;
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const onPostClick = useOnPostClick({ origin });
  const { commentsPermalink } = post;
  const cid = ReferralCampaignKey.SharePost;
  const { getShortUrl } = useGetShortUrl();
  const [, copyLink] = useCopyPostLink();
  const logShareEvent = useCallback(
    (provider: ShareProvider) =>
      logEvent(
        postLogEvent('share post', post, {
          extra: { provider, origin },
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [origin, post],
  );

  const onCopyLink = useCallback(async () => {
    const shortLink = await getShortUrl(commentsPermalink, cid);
    copyLink({ link: shortLink });
    logShareEvent(ShareProvider.CopyLink);
  }, [cid, commentsPermalink, copyLink, getShortUrl, logShareEvent]);

  const onReadArticle = useCallback(
    () =>
      onPostClick({
        post: post?.sharedPost || post,
        optional: { parent_id: post.sharedPost && post.id },
      }),
    [onPostClick, post],
  );

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

    logEvent(postLogEvent(`${origin} view`, post));
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  return {
    onReadArticle,
    onCopyPostLink: onCopyLink,
  };
};

export default usePostContent;
