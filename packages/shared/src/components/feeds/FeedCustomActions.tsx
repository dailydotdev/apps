import React, { ReactElement, ReactNode } from 'react';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { TrashIcon } from '../icons';

export type FeedCustomActionsProps = {
  isLoading?: boolean;
  isDisabled?: boolean;
  onDiscard?: () => void;
  onDelete?: () => void;
  children?: ReactNode;
};

export const FeedCustomActions = ({
  isLoading = false,
  isDisabled = false,
  onDiscard,
  onDelete,
  children,
}: FeedCustomActionsProps): ReactElement => {
  return (
    <div className="flex h-auto w-full flex-col items-center justify-between gap-4 border-b-2 border-accent-cabbage-default bg-background-subtle p-6 tablet:flex-row tablet:gap-0">
      <div className="text-center tablet:text-left">{children}</div>
      <div className="flex items-center gap-3">
        {!!onDelete && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<TrashIcon />}
            onClick={() => {
              onDelete();
            }}
          />
        )}
        {!!onDiscard && (
          <Button
            type="button"
            size={ButtonSize.Large}
            variant={ButtonVariant.Float}
            onClick={onDiscard}
          >
            Discard
          </Button>
        )}
        <Button
          type="submit"
          size={ButtonSize.Large}
          variant={ButtonVariant.Primary}
          disabled={isDisabled}
          loading={isLoading}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
