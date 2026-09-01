import type { ReactElement } from 'react';
import React from 'react';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { LinkIcon } from '../../components/icons';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { useCopyText } from '../../hooks/useCopy';
import type { HighlightSnapshotButtonProps } from './HighlightSnapshotButton';
import { HighlightSnapshotButton } from './HighlightSnapshotButton';

/**
 * The pair an expanded highlight ends on. Snapshot leads because the page it
 * links to has usually moved on by the time anyone opens it; copy link is the
 * familiar fallback beside it.
 */
export function HighlightShareActions({
  link,
  ...props
}: HighlightSnapshotButtonProps): ReactElement {
  // useCopyText, not useCopyLink: the link variant reaches for the shortener,
  // which needs an authenticated user, and the page has to work signed out.
  const [, copyLink] = useCopyText(link);

  return (
    <>
      <Tooltip content="Copy link">
        <Button
          aria-label="Copy link"
          icon={<LinkIcon />}
          onClick={() => copyLink({ message: '✅ Copied link' })}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Tertiary}
        />
      </Tooltip>
      <HighlightSnapshotButton
        {...props}
        link={link}
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
      />
    </>
  );
}
