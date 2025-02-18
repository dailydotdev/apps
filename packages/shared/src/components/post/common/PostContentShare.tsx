import type { ReactElement } from 'react';
import React from 'react';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { Origin } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { usePostActions } from '../../../hooks/post/usePostActions';
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
  const { onInteract, interaction } = usePostActions(post);
  const { isLoading, shareLink } = useGetShortUrl({
    query: {
      url: post.commentsPermalink,
      cid: ReferralCampaignKey.SharePost,
      enabled: interaction === 'upvote',
    },
  });

  if (interaction !== 'upvote' || isLoading) {
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
        onCopy={() => onInteract('none')}
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
