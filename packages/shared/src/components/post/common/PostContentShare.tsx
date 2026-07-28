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
import { ShareBand } from '../../share/ShareBand';
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
 * What the prompt contains, in descending weight:
 *
 * - `band` (default) — a single line: encouraging copy on the left, one split
 *   copy-link control on the right, the networks behind its chevron. Borrows
 *   its shape from `EndOfConversationShare`.
 * - `hero` — the fuller block (upvote badge, headline, description, dismiss)
 *   with that same split control under it.
 * - `card` — the same block with all eight networks laid out as tiles.
 * - `control` — the "Should anyone else see this post?" widget shipping today.
 *   An explicit treatment rather than a flag state, so it stays comparable
 *   against the others now that the prompt is no longer flag-gated.
 *
 * If `band` or `hero` ships, its share control and `EndOfConversationShare`'s
 * should come from one extracted component rather than these near-copies.
 */
export type PostContentSharePromptVariant =
  | 'control'
  | 'card'
  | 'hero'
  | 'band';

/**
 * How the prompt is contained, independent of what it contains.
 *
 * `flat` (default) spends no chrome at all — no fill, no border, no rule. Its
 * margins are matched top and bottom so it sits centred between the action bar
 * above it and the comment box below, reading as one more line of the page
 * rather than a section break. `card` puts it on its own float surface, the way
 * the control widget sits in the post body today.
 */
export type PostContentShareSurface = 'flat' | 'card';

// Spacing deliberately lives outside these: `PostContainer` is a flex column
// with no gap and every child hand-rolls its own margins, so what reads as
// "equal air above and below" depends on the neighbours. Each host passes its
// own `className`; the default suits a container that supplies no gap.
const DEFAULT_SPACING = 'my-4';

const SURFACE_CLASS: Record<PostContentShareSurface, string> = {
  flat: '',
  card: 'rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
};

const PROMPT_COPY = {
  card: {
    title: 'Good call. Now pass it on.',
    description:
      'Send it to the one person who’ll actually read it. That’s how millions of developers find the good stuff on daily.dev.',
  },
  band: {
    title: 'Enjoyed this post?',
    description: 'Send it to someone who’d have opinions.',
  },
};

interface PostContentShareProps {
  post: Post;
  promptVariant?: PostContentSharePromptVariant;
  surface?: PostContentShareSurface;
  /** Vertical spacing, owned by the host — see `DEFAULT_SPACING`. */
  className?: string;
  /** Copy overrides, while the wording is still being chosen. */
  title?: string;
  description?: string;
}

export function PostContentShare({
  post,
  promptVariant = 'band',
  surface = 'flat',
  className = DEFAULT_SPACING,
  title,
  description,
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
  if (!isUpvoted || isLoading) {
    return null;
  }

  const shareText = post.title || 'I found this on daily.dev';
  const defaultCopy = PROMPT_COPY[promptVariant === 'band' ? 'band' : 'card'];
  const promptTitle = title ?? defaultCopy.title;
  const promptDescription = description ?? defaultCopy.description;
  const buildLogEvent = (provider: ShareProvider) =>
    postLogEvent(LogEvent.SharePost, post, {
      extra: { provider, origin: Origin.PostContent },
      ...(logOpts && logOpts),
    });

  // Ships to everyone: no longer behind `share_upvote_prompt` or the
  // `sharing_visibility` master gate, matching the end-of-conversation band in
  // #6369. Today's widget stays available as an explicit treatment so the two
  // can be compared side by side.
  if (promptVariant === 'control') {
    return (
      <PostContentWidget
        className={className}
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
    // enough to ignore, matching the end-of-conversation strip it shares its
    // markup with.
    return (
      <ShareBand
        title={promptTitle}
        description={promptDescription}
        // Already the tracked short URL, so no `cid` — that would shorten twice.
        link={shareLink}
        text={shareText}
        emailTitle={shareText}
        className={classNames(SURFACE_CLASS[surface], className)}
        onShare={(provider) => logEvent(buildLogEvent(provider))}
      />
    );
  }

  // The prompt fires right after an upvote — peak intent — so it stays mounted
  // after a share instead of self-dismissing, letting the user hit more than
  // one destination. Dismissal moves to the explicit close button.
  return (
    <section
      className={classNames(
        'flex flex-col gap-4',
        SURFACE_CLASS[surface],
        className,
      )}
    >
      <div className="flex flex-row items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-brand-float text-brand-default">
          <UpvoteIcon secondary size={IconSize.Small} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            {promptTitle}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {promptDescription}
          </Typography>
          {promptVariant === 'hero' && (
            // Same block, one control: the networks move behind the chevron, so
            // the prompt keeps its prominence without an eight-tile row under
            // it. It lives inside the text column rather than beside it — the
            // header row already ends in the close button, and a second control
            // there would read as a pair of dismissals. Nesting it here also
            // lines its left edge up with the headline and description by
            // construction, instead of hanging under the badge.
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
              className="mt-3 self-start"
              onShare={(provider) => logEvent(buildLogEvent(provider))}
            />
          )}
        </div>
        <CloseButton
          type="button"
          size={ButtonSize.Small}
          aria-label="Dismiss share prompt"
          onClick={() => onInteract('none')}
        />
      </div>
      {promptVariant === 'card' && (
        <ShareActions
          variant="inline"
          link={shareLink}
          text={shareText}
          emailTitle={shareText}
          className="justify-center laptop:justify-start"
          onShare={(provider) => logEvent(buildLogEvent(provider))}
        />
      )}
    </section>
  );
}
