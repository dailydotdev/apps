import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { CopyIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { useCopyMyFeed } from '../../hooks/feed/useCopyMyFeed';
import { useCopyMyFeedEnabled } from '../../hooks/feed/useCopyMyFeedEnabled';

const LABEL = 'Copy my feed';

interface CopyMyFeedButtonProps {
  className?: string;
}

// Feed-nav affordance that copies (or natively shares, on mobile) a text
// digest of the posts currently loaded in the active feed. Renders nothing
// while the `share_copy_my_feed` / `sharing_visibility` flags are off so the
// nav chrome stays byte-identical for control users.
export function CopyMyFeedButton({
  className,
}: CopyMyFeedButtonProps): ReactElement | null {
  const isEnabled = useCopyMyFeedEnabled();
  const { hasPosts, isCopying, copyMyFeed } = useCopyMyFeed({
    enabled: isEnabled,
  });

  if (!isEnabled) {
    return null;
  }

  return (
    <Tooltip content={LABEL}>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        icon={<CopyIcon secondary={isCopying} />}
        aria-label={LABEL}
        disabled={!hasPosts}
        className={className}
        onClick={copyMyFeed}
      />
    </Tooltip>
  );
}
