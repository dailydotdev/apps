import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { LinkIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import type { UseShareOrCopyLinkProps } from '../../hooks/useShareOrCopyLink';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';

interface CopyLinkButtonProps {
  shareProps: UseShareOrCopyLinkProps;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const LABEL = 'Copy link';

export const CopyLinkButton = ({
  shareProps,
  className,
  size = ButtonSize.Small,
  variant = ButtonVariant.Float,
}: CopyLinkButtonProps): ReactElement => {
  const [, onShareOrCopyLink] = useShareOrCopyLink(shareProps);

  return (
    <Tooltip content={LABEL}>
      <Button
        aria-label={LABEL}
        className={className}
        icon={<LinkIcon />}
        onClick={() => onShareOrCopyLink()}
        size={size}
        variant={variant}
      />
    </Tooltip>
  );
};
