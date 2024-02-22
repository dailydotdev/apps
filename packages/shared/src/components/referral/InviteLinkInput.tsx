import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { AnalyticsEvent, TargetId } from '../../lib/analytics';
import { useCopyLink } from '../../hooks/useCopy';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { FieldClassName } from '../fields/BaseFieldContainer';

interface Text {
  copied?: string;
  initial?: string;
}

interface InviteLinkInputProps {
  targetId: TargetId;
  link: string;
  text?: Text;
  onCopy?: () => void;
  className?: FieldClassName;
}

export function InviteLinkInput({
  link,
  targetId,
  text = {},
  onCopy,
  className,
}: InviteLinkInputProps): ReactElement {
  const [copied, onCopyLink] = useCopyLink(() => link);
  const { trackEvent } = useAnalyticsContext();
  const onCopyClick = () => {
    onCopyLink();
    trackEvent({
      event_name: AnalyticsEvent.CopyReferralLink,
      target_id: targetId,
    });

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
