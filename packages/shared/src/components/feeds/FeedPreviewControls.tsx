import classNames from 'classnames';
import React from 'react';
import type { ReactElement } from 'react-markdown/lib/react-markdown';
import { ButtonV2 } from '../buttons/ButtonV2';
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
    <div className="mt-10 flex items-center justify-center gap-10 text-text-quaternary typo-callout">
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
      <ButtonV2
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
      </ButtonV2>
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
    </div>
  );
};
