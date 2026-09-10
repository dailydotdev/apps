import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { Origin, LogEvent } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { usePostActions } from '../../../hooks/post/usePostActions';
import type { ShareProvider } from '../../../lib/share';
import { ReferralCampaignKey } from '../../../hooks';
import { useActiveFeedContext } from '../../../contexts';
import { postLogEvent } from '../../../lib/feed';
import { ShareBand } from '../../share/ShareBand';
import { useLogContext } from '../../../contexts/LogContext';

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
  const { interaction, onInteract } = usePostActions({ post });
  const { logOpts } = useActiveFeedContext();
  const { logEvent } = useLogContext();

  // usePostActions keeps this in the query cache keyed by post id, forever and
  // shared with every other surface showing the post. Left raised, the upvote
  // this band answered would also uncover the feed card's own share prompt
  // (useCardCover) once the modal closes, so the flag is released with the
  // surface that set it. A ref, so the cleanup does not re-run per keystroke
  // of state and dismiss the band while it is still on screen.
  const isRaised = useRef(false);
  isRaised.current = interaction === 'upvote';

  useEffect(
    () => () => {
      if (isRaised.current) {
        onInteract('none');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
    [],
  );

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

  // A prompt, not a form: the link in an input asks to be read before it can
  // be used, and there is only one thing to do with it. The band and its split
  // control are #6369/#6378's, so this and the end-of-thread band read as one
  // pair.
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
