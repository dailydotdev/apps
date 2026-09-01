import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { Origin, LogEvent } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { usePostActions } from '../../../hooks/post/usePostActions';
import { ShareProvider } from '../../../lib/share';
import { ReferralCampaignKey, useGetShortUrl } from '../../../hooks';
import { PostContentWidget } from './PostContentWidget';
import { useActiveFeedContext } from '../../../contexts';
import { postLogEvent } from '../../../lib/feed';
import { ShareBand } from '../../share/ShareBand';
import { useLogContext } from '../../../contexts/LogContext';
import { useSharePlacement } from '../../../features/snapshot/useSharePlacement';
import { featurePostSharePrompts } from '../../../lib/featureManagement';

interface PostContentShareProps {
  post: Post;
}

export function PostContentShare({
  post,
}: PostContentShareProps): ReactElement | null {
  const { onInteract, interaction } = usePostActions({ post });
  const { logOpts } = useActiveFeedContext();
  const { isLoading, shareLink } = useGetShortUrl({
    query: {
      url: post.commentsPermalink,
      cid: ReferralCampaignKey.SharePost,
      enabled: interaction === 'upvote',
    },
  });

  const { logEvent } = useLogContext();
  const areSharePromptsEnabled = useSharePlacement({
    feature: featurePostSharePrompts,
  });

  const onShare = useCallback(
    (provider: ShareProvider) => {
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider, origin: Origin.PostContent },
          ...(logOpts && logOpts),
        }),
      );
      // The prompt has done its job; leaving it up nags.
      onInteract('none');
    },
    [logEvent, logOpts, onInteract, post],
  );

  if (interaction !== 'upvote' || isLoading) {
    return null;
  }

  if (areSharePromptsEnabled) {
    // A prompt, not a form: the link in an input asks to be read before it can
    // be used, and there is only one thing to do with it. The band and its
    // split control are #6369/#6378's, so this and the end-of-thread band read
    // as one pair.
    return (
      <ShareBand
        className="mt-6"
        description="Send it to someone who’d have opinions."
        link={shareLink}
        onShare={onShare}
        text={post.title ?? post.sharedPost?.title ?? ''}
        title="Should anyone else see this post?"
      />
    );
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
        logProps={postLogEvent(LogEvent.SharePost, post, {
          extra: {
            provider: ShareProvider.CopyLink,
            origin: Origin.PostContent,
          },
          ...(logOpts && logOpts),
        })}
      />
    </PostContentWidget>
  );
}
