import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CopyIcon, LinkedInIcon, TwitterIcon } from '../icons';
import { getLinkedInShareLink, getTwitterShareLink } from '../../lib/share';
import { webappUrl } from '../../lib/constants';
import { Typography, TypographyType } from '../typography/Typography';

interface MilestoneShareActionsProps {
  message: string;
}

export function MilestoneShareActions({
  message,
}: MilestoneShareActionsProps): ReactElement {
  const [isCopied, setIsCopied] = useState(false);
  const shareLink = useMemo(() => {
    if (typeof window === 'undefined') {
      return webappUrl;
    }

    return window.location.href;
  }, []);

  const onShareX = (): void => {
    window.open(
      getTwitterShareLink(shareLink, message),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const onShareLinkedIn = (): void => {
    window.open(
      getLinkedInShareLink(shareLink),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const onCopyLink = async (): Promise<void> => {
    await navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Typography type={TypographyType.Footnote}>Share on</Typography>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Share on X"
          icon={<TwitterIcon />}
          onClick={onShareX}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
        />
        <Button
          aria-label="Share on LinkedIn"
          icon={<LinkedInIcon />}
          onClick={onShareLinkedIn}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
        />
        <Button
          aria-label="Copy share link"
          icon={<CopyIcon />}
          onClick={onCopyLink}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
        />
      </div>
      {isCopied && (
        <Typography type={TypographyType.Footnote} className="text-text-tertiary">
          Link copied
        </Typography>
      )}
    </div>
  );
}
