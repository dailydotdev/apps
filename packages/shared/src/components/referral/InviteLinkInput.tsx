import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import type { TextFieldProps } from '../fields/TextField';
import { TextField } from '../fields/TextField';
import { useCopyLink } from '../../hooks/useCopy';
import { useLogContext } from '../../contexts/LogContext';
import type { FieldClassName } from '../fields/BaseFieldContainer';
import type { LogEvent } from '../../hooks/log/useLogQueue';

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
  // Replaces the built-in copy button, for surfaces that need a richer control
  // (e.g. the split copy/share button). Optional so every other consumer keeps
  // its original button and copy handling.
  actionButton?: TextFieldProps['actionButton'];
}

export function InviteLinkInput({
  link,
  text = {},
  onCopy,
  className,
  logProps,
  actionButton,
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
        actionButton ?? (
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            onClick={onCopyClick}
          >
            {renderText()}
          </Button>
        )
      }
      readOnly
    />
  );
}
