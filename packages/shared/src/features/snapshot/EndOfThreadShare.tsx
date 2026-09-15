import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { ShareBand } from '../../components/share/ShareBand';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import type { ShareProvider } from '../../lib/share';
import type { Post } from '../../graphql/posts';

/** Below this a thread is a couple of remarks rather than a discussion. */
const MIN_COMMENTS = 3;

/**
 * #6349's end-of-conversation band. It sits where reading actually stops, and
 * the link is the whole offer: a still image of a live thread is stale within
 * hours, so there is no snapshot here.
 *
 * The band and its split copy-link control come from #6369/#6378, which built
 * this surface and the post-upvote prompt as one pair. Neither landed, so the
 * components are carried here; if that stack revives, this and PostContentShare
 * should collapse into its EndOfConversationShare.
 */
export function EndOfThreadShare({
  post,
  commentsCount,
  className = 'my-6',
}: {
  post: Post;
  commentsCount: number;
  /** The hosts space their children differently; see PostContentShare. */
  className?: string;
}): ReactElement | null {
  const { logEvent } = useLogContext();

  const onShare = useCallback(
    (provider: ShareProvider) =>
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider, origin: Origin.EndOfConversation },
        }),
      ),
    [logEvent, post],
  );

  // Nothing to be at the end of: a thread of one or two replies is not a
  // conversation worth passing on, and the band would just be a second
  // copy-link button under it.
  if (commentsCount < MIN_COMMENTS) {
    return null;
  }

  return (
    <ShareBand
      cid={ReferralCampaignKey.SharePost}
      className={className}
      description="Send it to someone who’d have opinions."
      link={post.commentsPermalink}
      onShare={onShare}
      origin={Origin.EndOfConversation}
      post={post}
      text={post.title ?? post.sharedPost?.title ?? ''}
      title="Enjoyed this discussion?"
    />
  );
}
