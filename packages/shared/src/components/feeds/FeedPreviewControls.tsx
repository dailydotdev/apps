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
  'data-funnel-track'?: string;
};

export const FeedPreviewControls = ({
  isOpen,
  isTagStyle,
  isDisabled = false,
  textDisabled,
  origin,
  onClick,
  'data-funnel-track': funnelTrack,
}: FeedPreviewControlsControlsProps): ReactElement => {
  const { logEvent } = useLogContext();

  const handleClick = () => {
    const newValue = !isOpen;

    logEvent({
      event_name: LogEvent.ToggleFeedPreview,
      // The analytics pipeline types target_id as a string and drops the
      // whole batch on a boolean, so stringify the new visibility state.
      target_id: String(newValue),
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
          data-funnel-track={funnelTrack}
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
          data-funnel-track={funnelTrack}
        >
          {label}
        </Button>
      )}
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
    </div>
  );
};
