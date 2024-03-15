import React, { ReactElement } from 'react';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { Origin } from '../../../lib/analytics';
import { Post } from '../../../graphql/posts';
import { usePostShareLoop } from '../../../hooks/post/usePostShareLoop';
import { postAnalyticsEvent } from '../../../lib/feed';
import { ShareProvider } from '../../../lib/share';
import { ReferralCampaignKey } from '../../../hooks';
import { useTrackedLink } from '../../../hooks/utils/useTrackedLink';

interface PostContentShareProps {
  post: Post;
}

export function PostContentShare({
  post,
}: PostContentShareProps): ReactElement {
  const { shouldShowOverlay, onInteract } = usePostShareLoop(post);
  const { shareLink, isLoading } = useTrackedLink({
    link: post.commentsPermalink,
    cid: ReferralCampaignKey.SharePost,
    enabled: shouldShowOverlay,
  });

  if (!shouldShowOverlay || isLoading) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary px-4 py-2 tablet:flex-row tablet:gap-4">
      <span className="font-bold text-theme-label-tertiary typo-callout">
        Should anyone else see this post?
      </span>
      <InviteLinkInput
        className={{ container: 'w-full flex-1' }}
        link={shareLink}
        onCopy={onInteract}
        trackingProps={postAnalyticsEvent('share post', post, {
          extra: {
            provider: ShareProvider.CopyLink,
            origin: Origin.PostContent,
          },
        })}
      />
    </div>
  );
}
