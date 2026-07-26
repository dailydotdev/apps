import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { Origin, LogEvent } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { usePostActions } from '../../../hooks/post/usePostActions';
import { ShareProvider } from '../../../lib/share';
import { ReferralCampaignKey, useGetShortUrl } from '../../../hooks';
import { PostContentWidget } from './PostContentWidget';
import { useActiveFeedContext } from '../../../contexts';
import { postLogEvent } from '../../../lib/feed';
import { ShareActions } from '../../share/ShareActions';
import { useSharingVisibility } from '../../../hooks/useSharingVisibility';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureShareUpvotePrompt } from '../../../lib/featureManagement';
import { useLogContext } from '../../../contexts/LogContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { UpvoteIcon } from '../../icons';
import { IconSize } from '../../Icon';
import CloseButton from '../../CloseButton';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';

/**
 * `card` is the full-width block with the eight-tile social row. `band` is the
 * lighter treatment: encouraging copy on the left, one split copy-link control
 * on the right, with the social networks a chevron away instead of always on
 * screen. It borrows its shape from `EndOfConversationShare` — if `band` wins,
 * the two should share one extracted component rather than this near-copy.
 */
export type PostContentSharePromptVariant = 'card' | 'band';

const BAND_COPY = {
  title: 'Enjoyed this post?',
  description: 'Send it to someone who’d have opinions.',
};

interface PostContentShareProps {
  post: Post;
  promptVariant?: PostContentSharePromptVariant;
  /**
   * `band` only. `card` keeps the widget on its own float surface, the way the
   * control widget sits in the post body; `flat` leans on a single hairline.
   */
  bandSurface?: 'card' | 'flat';
  /** Copy overrides, while the wording is still being chosen. */
  title?: string;
  description?: string;
}

export function PostContentShare({
  post,
  promptVariant = 'card',
  bandSurface = 'card',
  title = BAND_COPY.title,
  description = BAND_COPY.description,
}: PostContentShareProps): ReactElement | null {
  const { onInteract, interaction } = usePostActions({ post });
  const { logOpts } = useActiveFeedContext();
  const { logEvent } = useLogContext();
  const isUpvoted = interaction === 'upvote';
  const { isLoading, shareLink } = useGetShortUrl({
    query: {
      url: post.commentsPermalink,
      cid: ReferralCampaignKey.SharePost,
      enabled: isUpvoted,
    },
  });
  const { isEnabled: isSharingVisible } = useSharingVisibility(isUpvoted);
  const { value: isPromptEnabled } = useConditionalFeature({
    feature: featureShareUpvotePrompt,
    shouldEvaluate: isSharingVisible,
  });

  if (!isUpvoted || isLoading) {
    return null;
  }

  const shareText = post.title || 'I found this on daily.dev';
  const buildLogEvent = (provider: ShareProvider) =>
    postLogEvent(LogEvent.SharePost, post, {
      extra: { provider, origin: Origin.PostContent },
      ...(logOpts && logOpts),
    });

  if (!isSharingVisible || !isPromptEnabled) {
    return (
      <PostContentWidget
        className="mt-6"
        title="Should anyone else see this post?"
      >
        <InviteLinkInput
          className={{ container: 'w-full flex-1' }}
          link={shareLink}
          onCopy={() => onInteract('none')}
          logProps={buildLogEvent(ShareProvider.CopyLink)}
        />
      </PostContentWidget>
    );
  }

  if (promptVariant === 'band') {
    // Same peak-intent moment, quieter footprint: the networks live behind the
    // chevron, so the prompt reads as one line of encouragement plus a single
    // control rather than a wall of tiles. No close button — the band is light
    // enough to ignore, matching the end-of-conversation strip.
    return (
      <aside
        className={classNames(
          'mt-6 flex flex-col items-center gap-3 text-center tablet:flex-row tablet:justify-between tablet:text-left',
          bandSurface === 'card' &&
            'rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
          bandSurface === 'flat' &&
            'border-t border-border-subtlest-tertiary pt-6',
        )}
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <Typography bold type={TypographyType.Callout}>
            {title}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
        </div>
        <ShareActions
          variant="split"
          link={shareLink}
          text={shareText}
          emailTitle={shareText}
          buttonVariant={ButtonVariant.Primary}
          buttonSize={ButtonSize.Small}
          label="Copy link"
          triggerText="Copy link"
          dropdownLabel="More share options"
          className="shrink-0"
          onShare={(provider) => logEvent(buildLogEvent(provider))}
        />
      </aside>
    );
  }

  // The prompt fires right after an upvote — peak intent — so it stays mounted
  // after a share instead of self-dismissing, letting the user hit more than
  // one destination. Dismissal moves to the explicit close button.
  return (
    <section className="mt-6 flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <div className="flex flex-row items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-brand-float text-brand-default">
          <UpvoteIcon secondary size={IconSize.Small} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            Good call. Now pass it on.
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Send it to the one person who’ll actually read it. That’s how
            millions of developers find the good stuff on daily.dev.
          </Typography>
        </div>
        <CloseButton
          type="button"
          size={ButtonSize.Small}
          aria-label="Dismiss share prompt"
          onClick={() => onInteract('none')}
        />
      </div>
      <ShareActions
        variant="inline"
        link={shareLink}
        text={shareText}
        emailTitle={shareText}
        className="justify-center laptop:justify-start"
        onShare={(provider) => logEvent(buildLogEvent(provider))}
      />
    </section>
  );
}
