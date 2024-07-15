import React, { ReactElement } from 'react';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { Origin } from '../../../lib/log';
import { Post } from '../../../graphql/posts';
import { usePostShareLoop } from '../../../hooks/post/usePostShareLoop';
import { postLogEvent } from '../../../lib/feed';
import { ShareProvider } from '../../../lib/share';
import { ReferralCampaignKey, useGetShortUrl } from '../../../hooks';
import { PostContentWidget } from './PostContentWidget';

interface PostContentShareProps {
  post: Post;
}

export function PostContentShare({
  post,
}: PostContentShareProps): ReactElement {
  const { shouldShowOverlay, onInteract } = usePostShareLoop(post);
  const { isLoading, shareLink } = useGetShortUrl({
    query: {
      url: post.commentsPermalink,
      cid: ReferralCampaignKey.SharePost,
      enabled: shouldShowOverlay,
    },
  });

  if (!shouldShowOverlay || isLoading) {
    return null;
  }

  return (
    <PostContentWidget
      className="mt-6"
      title="Should anyone else see this post?"
    >
      <InviteLinkInput
        className={{ container: 'w-full flex-1' }}
        link={shareLink}
        onCopy={onInteract}
        logProps={postLogEvent('share post', post, {
          extra: {
            provider: ShareProvider.CopyLink,
            origin: Origin.PostContent,
          },
        })}
      />
    </PostContentWidget>
  );
}
