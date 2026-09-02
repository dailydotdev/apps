import type { ReactElement } from 'react';
import React from 'react';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { LinkIcon } from '../../components/icons';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { useCopyText } from '../../hooks/useCopy';
import type { HighlightSnapshotButtonProps } from './HighlightSnapshotButton';
import { HighlightSnapshotButton } from './HighlightSnapshotButton';

type HighlightShareActionsProps = Pick<
  HighlightSnapshotButtonProps,
  'id' | 'headline' | 'tldr' | 'meta'
> & {
  link: string;
};

export function HighlightShareActions({
  link,
  ...card
}: HighlightShareActionsProps): ReactElement {
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
        {...card}
        link={link}
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
      />
    </>
  );
}
