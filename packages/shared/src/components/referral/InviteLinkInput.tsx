import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { useCopyLink } from '../../hooks/useCopy';
import { useLogContext } from '../../contexts/LogContext';
import { FieldClassName } from '../fields/BaseFieldContainer';
import { LogEvent } from '../../hooks/log/useLogQueue';

interface Text {
  copied?: string;
  initial?: string;
}

interface InviteLinkInputProps {
  link: string;
  text?: Text;
  onCopy?: () => void;
  className?: FieldClassName;
  logProps: LogEvent;
}

export function InviteLinkInput({
  link,
  text = {},
  onCopy,
  className,
  logProps,
}: InviteLinkInputProps): ReactElement {
  const [copied, onCopyLink] = useCopyLink(() => link);
  const { logEvent } = useLogContext();
  const onCopyClick = () => {
    onCopyLink();
    logEvent(logProps);

    if (onCopy) {
      onCopy();
    }
  };

  const renderText = () => {
    const copy = text?.initial ?? 'Copy link';
    const copiedText = text?.copied ?? 'Copied';

    return copied ? copiedText : copy;
  };

  return (
    <TextField
      className={className}
      name="inviteURL"
      inputId="inviteURL"
      label="Your unique invite URL"
      type="url"
      autoComplete="off"
      value={link}
      fieldType="tertiary"
      actionButton={
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={onCopyClick}
        >
          {renderText()}
        </Button>
      }
      readOnly
    />
  );
}
