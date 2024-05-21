import classNames from 'classnames';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { Button } from '../buttons/Button';
import { ButtonVariant, ButtonIconPosition } from '../buttons/common';
import { ArrowIcon } from '../icons';

export type FeedCustomPreviewControlsProps = {
  isOpen: boolean;
  isDisabled?: boolean;
  onClick: (value: boolean) => void;
};

export const FeedCustomPreviewControls = ({
  isOpen,
  isDisabled = false,
  onClick,
}: FeedCustomPreviewControlsProps): ReactElement => {
  return (
    <div className="mt-10 flex items-center justify-center gap-10 text-text-quaternary typo-callout">
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
      <Button
        variant={ButtonVariant.Float}
        disabled={isDisabled}
        icon={<ArrowIcon className={classNames(!isOpen && 'rotate-180')} />}
        iconPosition={ButtonIconPosition.Right}
        onClick={() => {
          onClick(!isOpen);
        }}
      >
        {isDisabled
          ? `Select tags to show feed preview`
          : `${isOpen ? 'Hide' : 'Show'} feed preview`}
      </Button>
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
    </div>
  );
};
