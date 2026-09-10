import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { LinkIcon } from '../icons/Link';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { Tooltip } from '../tooltip/Tooltip';
import { useCopyLink } from '../../hooks/useCopy';
import type { PostHighlight } from '../../graphql/highlights';
import type { Origin } from '../../lib/log';
import { getHighlightsUrl } from '../../lib/links';
import { ShareProvider } from '../../lib/share';
import { useLogHighlightShare } from '../../features/snapshot/useLogHighlightShare';

export function CopyHighlightsLink({
  highlight,
  origin,
  className,
  size = ButtonSize.Small,
}: {
  /** Links to this highlight on the page, or to the page without one. */
  highlight?: PostHighlight;
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
          copyLink({ link: getHighlightsUrl(highlight?.id) });
        }}
        size={size}
        type="button"
        variant={ButtonVariant.Tertiary}
      />
    </Tooltip>
  );
}
