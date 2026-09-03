import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { LinkIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { useCopyText } from '../../hooks/useCopy';
import { getHighlightsUrl } from '../../lib/links';
import { useSharePlacement } from '../../features/snapshot/useSharePlacement';
import { featureHappeningNowShare } from '../../lib/featureManagement';

export function CopyHighlightsLink({
  link,
  className,
  size = ButtonSize.Small,
}: {
  link?: string;
  className?: string;
  size?: ButtonSize;
}): ReactElement | null {
  const isEnabled = useSharePlacement({ feature: featureHappeningNowShare });
  // useCopyText, not useCopyLink: the link variant reaches for the shortener,
  // which needs an authenticated user, and the page has to work signed out.
  const [, copyLink] = useCopyText(link ?? getHighlightsUrl());

  if (!isEnabled) {
    return null;
  }

  return (
    <Tooltip content="Copy link">
      <Button
        aria-label="Copy link"
        className={className}
        icon={<LinkIcon />}
        onClick={(event: MouseEvent) => {
          // The feed card is a link, and the page header sits above a tab bar.
          event.preventDefault();
          event.stopPropagation();
          copyLink({ message: '✅ Copied link' });
        }}
        size={size}
        type="button"
        variant={ButtonVariant.Tertiary}
      />
    </Tooltip>
  );
}
