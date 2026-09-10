import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { LinkIcon } from '../icons/Link';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { Tooltip } from '../tooltip/Tooltip';
import { useCopyLink } from '../../hooks/useCopy';
import type { PostHighlight } from '../../graphql/highlights';
import type { Origin } from '../../lib/log';
import { getHighlightsShareUrl } from '../../lib/links';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import { useLogHighlightShare } from '../../features/snapshot/useLogHighlightShare';

export function CopyHighlightsLink({
  highlight,
  origin,
  className,
  size = ButtonSize.Small,
}: {
  /** Links to this highlight's post, or to the page without one. */
  highlight?: Pick<PostHighlight, 'id' | 'post'>;
  origin: Origin;
  className?: string;
  size?: ButtonSize;
}): ReactElement {
  const [copied, copyLink] = useCopyLink();
  const logShare = useLogHighlightShare(origin, highlight);

  return (
    <Tooltip content="Copy link">
      <Button
        aria-label="Copy link"
        className={className}
        icon={<CopyStateIcon copied={copied} icon={LinkIcon} />}
        onClick={(event: MouseEvent) => {
          // The feed card's rows are links.
          event.preventDefault();
          event.stopPropagation();
          logShare(ShareProvider.CopyLink);
          // `shorten`, not an awaited short URL: the write has to stay inside
          // the task that handled the click or Safari refuses it.
          copyLink(
            highlight
              ? {
                  link: highlight.post.commentsPermalink,
                  shorten: true,
                  cid: ReferralCampaignKey.SharePost,
                }
              : {
                  link: getHighlightsShareUrl(),
                  shorten: true,
                  cid: ReferralCampaignKey.ShareHighlights,
                },
          );
        }}
        size={size}
        type="button"
        variant={ButtonVariant.Tertiary}
      />
    </Tooltip>
  );
}
