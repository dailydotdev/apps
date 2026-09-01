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
  /**
   * Spacing belongs to the host: PostContainer is a flex column with no gap
   * and hand-rolls every margin, while the focus card's column already spaces
   * its children. A margin that reads as even in one is lopsided in the other.
   */
  className?: string;
}

export function PostContentShare({
  post,
  className = 'my-4',
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
      // Deliberately not dismissed: a copy is not always the end of it, and a
      // prompt that vanishes under the cursor takes the second network with it.
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider, origin: Origin.PostContent },
          ...(logOpts && logOpts),
        }),
      );
    },
    [logEvent, logOpts, post],
  );

  if (interaction !== 'upvote') {
    return null;
  }

  if (areSharePromptsEnabled) {
    // A prompt, not a form: the link in an input asks to be read before it can
    // be used, and there is only one thing to do with it. The band and its
    // split control are #6369/#6378's, so this and the end-of-thread band read
    // as one pair.
    return (
      <ShareBand
        cid={ReferralCampaignKey.SharePost}
        className={className}
        description="Send it to someone who’d have opinions."
        // The permalink, not the pre-fetched short URL: that query is disabled
        // for signed-out readers and yields nothing when the shortener fails,
        // and the undefined reached the share sheet as its title. The control
        // shortens at press time and falls back to the tracked URL.
        link={post.commentsPermalink}
        onShare={onShare}
        text={post.title ?? post.sharedPost?.title ?? ''}
        title="Should anyone else see this post?"
      />
    );
  }

  // Only the widget below waits on the pre-fetched short URL — it puts the
  // link in an input, so it has nothing to show until the link exists. A
  // disabled query stays pending forever, so this cannot gate the band.
  if (isLoading) {
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
