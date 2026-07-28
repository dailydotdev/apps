import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import { ShareBand } from '../share/ShareBand';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import type { ShareProvider } from '../../lib/share';

/**
 * A share prompt only earns its place at the end of a thread that has real
 * back-and-forth — prompting on a quiet post trains people to ignore it. The
 * band stays hidden until the post has MORE than this many comments, read from
 * the typed `Post.numComments` field (total comments, replies included).
 */
export const activeDiscussionCommentThreshold = 3;

const hasActiveDiscussion = (post: Post): boolean =>
  (post.numComments ?? 0) > activeDiscussionCommentThreshold;

export type EndOfConversationShareVariant = 'card' | 'flat';

export interface EndOfConversationShareProps {
  post: Post;
  /**
   * `flat` (default) drops the fill and leans on a single hairline rule to
   * separate the strip from the comments above it; `card` is the heavier
   * self-contained surface.
   */
  variant?: EndOfConversationShareVariant;
  className?: string;
}

/**
 * Encouraging share band rendered below the comment list of an active
 * discussion. Ships to everyone — the comment threshold is the only condition.
 */
export const EndOfConversationShare = ({
  post,
  variant = 'flat',
  className,
}: EndOfConversationShareProps): ReactElement | null => {
  const { logEvent } = useLogContext();

  if (!hasActiveDiscussion(post)) {
    return null;
  }

  const onShare = (provider: ShareProvider): void =>
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider, origin: Origin.EndOfConversation },
      }),
    );

  return (
    <ShareBand
      title="Enjoyed this discussion?"
      description="Send it to someone who’d have opinions."
      link={post.commentsPermalink}
      text={post.title ?? post.sharedPost?.title ?? ''}
      cid={ReferralCampaignKey.SharePost}
      className={classNames(
        variant === 'card' &&
          'rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
        variant === 'flat' &&
          'border-t border-border-subtlest-tertiary pb-4 pt-6',
        className,
      )}
      onShare={onShare}
    />
  );
};
