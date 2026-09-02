import classNames from 'classnames';
import React from 'react';
import type { ReactElement } from 'react-markdown/lib/react-markdown';
import { Button } from '../buttons/Button';
import { ButtonVariant, ButtonIconPosition } from '../buttons/common';
import { ArrowIcon, EyeCancelIcon, EyeIcon } from '../icons';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';

export type FeedPreviewControlsControlsProps = {
  isOpen: boolean;
  // The onboarding funnel renders this as one of the tag pills above it — a
  // quiet reveal on the divider, the eye carrying the open/closed state — so
  // it doesn't compete with the step's docked CTA. Off elsewhere, where the
  // original primary button stands.
  isTagStyle?: boolean;
  isDisabled?: boolean;
  textDisabled: string;
  origin: Origin;
  onClick: (value: boolean) => void;
};

export const FeedPreviewControls = ({
  isOpen,
  isTagStyle,
  isDisabled = false,
  textDisabled,
  origin,
  onClick,
}: FeedPreviewControlsControlsProps): ReactElement => {
  const { logEvent } = useLogContext();

  const handleClick = () => {
    const newValue = !isOpen;

    logEvent({
      event_name: LogEvent.ToggleFeedPreview,
      target_id: newValue,
      extra: JSON.stringify({ origin }),
    });

    onClick(newValue);
  };

  const label = isDisabled
    ? textDisabled
    : `${isOpen ? 'Hide' : 'Show'} feed preview`;

  return (
    <div
      className={classNames(
        'flex items-center justify-center text-text-quaternary typo-callout',
        isTagStyle ? 'mt-6 gap-4' : 'mt-10 gap-10',
      )}
    >
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
      {isTagStyle ? (
        // `btn-tag` plus the default size is exactly what TagElement renders,
        // so the control sits in the same family as the tags it belongs to.
        <Button
          variant={ButtonVariant.Float}
          className="btn-tag"
          disabled={isDisabled}
          icon={isOpen ? <EyeCancelIcon /> : <EyeIcon />}
          onClick={handleClick}
        >
          {label}
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.Primary}
          disabled={isDisabled}
          icon={<ArrowIcon className={classNames(!isOpen && 'rotate-180')} />}
          iconPosition={ButtonIconPosition.Right}
          onClick={handleClick}
        >
          {label}
        </Button>
      )}
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
    </div>
  );
};
