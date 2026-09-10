import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { LinkIcon } from '../icons/Link';
import { CopyStateIcon } from './CopyStateIcon';
import { Tooltip } from '../tooltip/Tooltip';
import type { UseShareOrCopyLinkProps } from '../../hooks/useShareOrCopyLink';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import type { Origin } from '../../lib/log';

interface CopyLinkButtonProps {
  shareProps: UseShareOrCopyLinkProps &
    Required<Pick<UseShareOrCopyLinkProps, 'logObject'>>;
  origin: Origin;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const LABEL = 'Copy link';
const COPIED_LABEL = 'Copied!';

export const CopyLinkButton = ({
  shareProps,
  origin,
  className,
  size = ButtonSize.Small,
  variant = ButtonVariant.Float,
}: CopyLinkButtonProps): ReactElement => {
  // Stays false on the native-share path, where the OS sheet is the feedback.
  const [copied, onShareOrCopyLink] = useShareOrCopyLink({
    ...shareProps,
    logObject: (provider) => ({
      ...shareProps.logObject(provider),
      extra: JSON.stringify({ provider, origin }),
    }),
  });

  return (
    <Tooltip content={copied ? COPIED_LABEL : LABEL}>
      <Button
        aria-label={LABEL}
        className={className}
        icon={<CopyStateIcon copied={copied} icon={LinkIcon} />}
        onClick={() => onShareOrCopyLink()}
        size={size}
        type="button"
        variant={variant}
      />
    </Tooltip>
  );
};
