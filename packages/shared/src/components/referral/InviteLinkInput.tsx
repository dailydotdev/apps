import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { AnalyticsEvent, TargetId } from '../../lib/analytics';
import { useCopyLink } from '../../hooks/useCopy';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { FieldClassName } from '../fields/BaseFieldContainer';

interface InviteLinkInputProps {
  targetId: TargetId;
  link: string;
  copyingText?: string;
  onCopy?: () => void;
  className?: FieldClassName;
}

export function InviteLinkInput({
  link,
  targetId,
  copyingText,
  onCopy,
  className,
}: InviteLinkInputProps): ReactElement {
  const [copying, onCopyLink] = useCopyLink(() => link);
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
    const copy = 'Copy link';

    if (copyingText) {
      return copying ? copyingText : copy;
    }

    return `${copy} ${copying ? '😀' : '😉'}`;
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
