import React, { ReactElement, useState } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { AnalyticsEvent, TargetId } from '../../lib/analytics';
import { useCopyLink } from '../../hooks/useCopy';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { FieldClassName } from '../fields/BaseFieldContainer';

interface Text {
  copying?: string;
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
  const [hasCopied, setHasCopied] = useState(false);
  const [copying, onCopyLink] = useCopyLink(() => link);
  const { trackEvent } = useAnalyticsContext();
  const onCopyClick = () => {
    onCopyLink();
    trackEvent({
      event_name: AnalyticsEvent.CopyReferralLink,
      target_id: targetId,
    });
    setHasCopied(true);

    if (onCopy) {
      onCopy();
    }
  };

  const renderText = () => {
    const copy = text?.initial ?? 'Copy link';

    if (text?.copying) {
      return copying ? text?.copying : copy;
    }

    if (hasCopied) {
      return text?.copied ?? 'Copied';
    }

    return copy;
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
          buttonSize={ButtonSize.Small}
          className="btn-primary"
          onClick={onCopyClick}
        >
          {renderText()}
        </Button>
      }
      readOnly
    />
  );
}
