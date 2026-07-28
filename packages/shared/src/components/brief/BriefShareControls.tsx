import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CopyIcon, LinkIcon, VIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { ShareActions } from '../share/ShareActions';
import type { Post } from '../../graphql/posts';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';
import { useSharePost } from '../../hooks/useSharePost';
import { useShareCopyIcon } from '../../hooks/useShareCopyIcon';
import { useLogContext } from '../../contexts/LogContext';
import { usePostLogEvent } from '../../lib/feed';
import { LogEvent } from '../../lib/log';
import type { Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';

interface BriefCopyLinkButtonProps {
  post: Post;
  origin: Origin;
  size?: ButtonSize;
}

/**
 * Copy the briefing's link, confirming with the design system's success
 * checkmark. Split out because the header renders it on its own when the
 * sharing gate is off, and beside the share arrow when it is on.
 */
export const BriefCopyLinkButton = ({
  post,
  origin,
  size = ButtonSize.Small,
}: BriefCopyLinkButtonProps): ReactElement => {
  const { copyLink } = useSharePost(origin);
  const showCopyIcon = useShareCopyIcon();
  const [copiedKey, markCopied] = useCopyFeedback();
  const isCopied = !!copiedKey;
  const restingIcon = showCopyIcon ? <CopyIcon /> : <LinkIcon />;

  return (
    <Tooltip content={isCopied ? 'Copied!' : 'Copy link'}>
      <Button
        type="button"
        size={size}
        variant={ButtonVariant.Tertiary}
        aria-label="Copy link"
        icon={
          isCopied ? <VIcon className="text-status-success" /> : restingIcon
        }
        onClick={() => {
          markCopied();
          copyLink({ post });
        }}
      />
    </Tooltip>
  );
};

interface BriefShareControlsProps extends BriefCopyLinkButtonProps {
  className?: string;
}

/**
 * The briefing's sharing pair, used by both the `/briefing` row and the post
 * header so the two surfaces stay in step: copy link on the left, then the
 * arrow that opens the social surface — a popover on desktop, the native sheet
 * on mobile. One glyph per meaning; the arrow is never a one-tap copy.
 */
export const BriefShareControls = ({
  post,
  origin,
  size = ButtonSize.Small,
  className,
}: BriefShareControlsProps): ReactElement => {
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();

  return (
    <div className={className}>
      <BriefCopyLinkButton post={post} origin={origin} size={size} />
      <ShareActions
        link={post?.commentsPermalink}
        text={post?.title ?? ''}
        cid={ReferralCampaignKey.SharePost}
        emailTitle={post?.title ?? ''}
        emailSummary={post?.summary}
        buttonSize={size}
        buttonVariant={ButtonVariant.Tertiary}
        label="Share briefing"
        onShare={(provider) =>
          logEvent(
            postLogEvent(LogEvent.SharePost, post, {
              extra: { provider, origin },
            }),
          )
        }
      />
    </div>
  );
};
