import React, { ReactElement } from 'react';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { Origin } from '../../../lib/logs';
import { Post } from '../../../graphql/posts';
import { usePostShareLoop } from '../../../hooks/post/usePostShareLoop';
import { postLogsEvent } from '../../../lib/feed';
import { ShareProvider } from '../../../lib/share';
import { ReferralCampaignKey, useGetShortUrl } from '../../../hooks';

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
    <div className="mt-6 flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary px-4 py-2 laptop:flex-row laptop:gap-4">
      <span className="font-bold text-text-tertiary typo-callout">
        Should anyone else see this post?
      </span>
      <InviteLinkInput
        className={{ container: 'w-full flex-1' }}
        link={shareLink}
        onCopy={onInteract}
        trackingProps={postLogsEvent('share post', post, {
          extra: {
            provider: ShareProvider.CopyLink,
            origin: Origin.PostContent,
          },
        })}
      />
    </div>
  );
}
