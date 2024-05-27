import classNames from 'classnames';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { Button } from '../buttons/Button';
import { ButtonVariant, ButtonIconPosition } from '../buttons/common';
import { ArrowIcon } from '../icons';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';

export type FeedPreviewControlsControlsProps = {
  isOpen: boolean;
  isDisabled?: boolean;
  textDisabled: string;
  origin: Origin;
  onClick: (value: boolean) => void;
};

export const FeedPreviewControls = ({
  isOpen,
  isDisabled = false,
  textDisabled,
  origin,
  onClick,
}: FeedPreviewControlsControlsProps): ReactElement => {
  const { trackEvent } = useAnalyticsContext();

  return (
    <div className="mt-10 flex items-center justify-center gap-10 text-text-quaternary typo-callout">
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
      <Button
        variant={ButtonVariant.Float}
        disabled={isDisabled}
        icon={<ArrowIcon className={classNames(!isOpen && 'rotate-180')} />}
        iconPosition={ButtonIconPosition.Right}
        onClick={() => {
          const newValue = !isOpen;

          trackEvent({
            event_name: AnalyticsEvent.ToggleFeedPreview,
            target_id: newValue,
            extra: JSON.stringify({ origin }),
          });

          onClick(newValue);
        }}
      >
        {isDisabled ? textDisabled : `${isOpen ? 'Hide' : 'Show'} feed preview`}
      </Button>
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
    </div>
  );
};
