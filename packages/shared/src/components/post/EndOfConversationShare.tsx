import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import { ShareActions } from '../share/ShareActions';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useSharingVisibility } from '../../hooks/useSharingVisibility';
import { featureShareEndOfConversation } from '../../lib/featureManagement';
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

export const hasActiveDiscussion = (post: Post): boolean =>
  (post.numComments ?? 0) > activeDiscussionCommentThreshold;

export interface EndOfConversationShareProps {
  post: Post;
  className?: string;
}

/**
 * The band itself, including the activity threshold but without the feature
 * gates, so Storybook can render both sides of the threshold without a
 * GrowthBook instance.
 */
export const EndOfConversationShareBand = ({
  post,
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
    <aside
      // Labelled by its own visible copy, so no aria-label here — a second
      // "Share this discussion" label would shadow the share button's.
      className={classNames(
        'flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-center tablet:flex-row tablet:justify-between tablet:text-left',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <Typography bold type={TypographyType.Callout}>
          Enjoyed this discussion?
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Send it to someone who&apos;d have opinions.
        </Typography>
      </div>
      <ShareActions
        link={post.commentsPermalink}
        text={post.title ?? post.sharedPost?.title ?? ''}
        cid={ReferralCampaignKey.SharePost}
        buttonVariant={ButtonVariant.Primary}
        buttonSize={ButtonSize.Medium}
        label="Share this discussion"
        className="shrink-0"
        onShare={onShare}
      />
    </aside>
  );
};

/**
 * Encouraging share band rendered below the comment list of an active
 * discussion. Gated by the initiative kill-switch plus its own experiment flag,
 * and only evaluated once the post is past the activity threshold.
 */
export const EndOfConversationShare = ({
  post,
  className,
}: EndOfConversationShareProps): ReactElement | null => {
  const isActive = hasActiveDiscussion(post);
  const { isEnabled: isInitiativeEnabled } = useSharingVisibility(isActive);
  const { value: isBandEnabled } = useConditionalFeature({
    feature: featureShareEndOfConversation,
    shouldEvaluate: isActive && isInitiativeEnabled,
  });

  if (!isInitiativeEnabled || !isBandEnabled) {
    return null;
  }

  return <EndOfConversationShareBand post={post} className={className} />;
};
