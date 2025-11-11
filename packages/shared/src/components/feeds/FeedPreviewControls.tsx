import classNames from 'classnames';
import React from 'react';
import type { ReactElement } from 'react-markdown/lib/react-markdown';
import { Button } from '../buttons/Button';
import { ButtonVariant, ButtonIconPosition } from '../buttons/common';
import { ArrowIcon } from '../icons';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';

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
  const { logEvent } = useLogContext();

  return (
    <div className="text-text-quaternary typo-callout mt-10 flex items-center justify-center gap-10">
      <div className="bg-border-subtlest-tertiary h-px flex-1" />
      <Button
        variant={ButtonVariant.Primary}
        disabled={isDisabled}
        icon={<ArrowIcon className={classNames(!isOpen && 'rotate-180')} />}
        iconPosition={ButtonIconPosition.Right}
        onClick={() => {
          const newValue = !isOpen;

          logEvent({
            event_name: LogEvent.ToggleFeedPreview,
            target_id: newValue,
            extra: JSON.stringify({ origin }),
          });

          onClick(newValue);
        }}
      >
        {isDisabled ? textDisabled : `${isOpen ? 'Hide' : 'Show'} feed preview`}
      </Button>
      <div className="bg-border-subtlest-tertiary h-px flex-1" />
    </div>
  );
};
