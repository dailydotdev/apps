import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Tooltip } from '../../tooltip/Tooltip';
import { CopyIcon } from '../../icons';
import { useCopyText } from '../../../hooks/useCopy';
import { useGetShortUrl } from '../../../hooks';
import { ReferralCampaignKey } from '../../../lib/referral';
import { useLogContext } from '../../../contexts/LogContext';
import { postLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import { ShareProvider } from '../../../lib/share';

interface CopySummaryButtonProps {
  post: Post;
  /**
   * The TL;DR text. Freeform/welcome posts have no summary, so the button is
   * correctly absent there — pass whatever the surface rendered.
   */
  summary?: string;
  className?: string;
}

/**
 * Secondary action at the end of the TL;DR block: copies the summary plus a
 * short link back to the post, so pasting into a chat keeps the attribution.
 * Deliberately a quiet tertiary button — "Read post" stays the primary CTA.
 */
export const CopySummaryButton = ({
  post,
  summary,
  className,
}: CopySummaryButtonProps): ReactElement | null => {
  const [copying, copyText] = useCopyText();
  const { getShortUrl } = useGetShortUrl();
  const { logEvent } = useLogContext();

  if (!summary) {
    return null;
  }

  const onCopySummary = async () => {
    const shortLink = await getShortUrl(
      post.commentsPermalink,
      ReferralCampaignKey.SharePost,
    );
    await copyText({
      textToCopy: `${summary}\n\n${shortLink}`,
      message: '✅ Copied summary to clipboard',
    });
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: {
          provider: ShareProvider.CopyLink,
          origin: Origin.PostSummary,
        },
      }),
    );
  };

  return (
    <Tooltip content="Copies the TL;DR and a link back to the post">
      <Button
        aria-label="Copy summary"
        className={className}
        icon={<CopyIcon secondary={copying} />}
        onClick={onCopySummary}
        pressed={copying}
        size={ButtonSize.Small}
        type="button"
        variant={ButtonVariant.Tertiary}
      >
        {copying ? 'Copied!' : 'Copy summary'}
      </Button>
    </Tooltip>
  );
};
