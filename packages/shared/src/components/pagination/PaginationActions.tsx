import React, { ReactElement } from 'react';
import { ArrowIcon } from '../icons';
import { UsePagination } from '../../hooks/utils';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

export type ExtendedPaginationProps = Pick<
  UsePagination,
  'onPrevious' | 'onNext' | 'current'
>;

export interface PaginationActionsProps extends ExtendedPaginationProps {
  max: number;
}

const buttonProps = {
  type: 'button',
  iconOnly: true,
  buttonSize: ButtonSize.Small,
};

export const PaginationActions = ({
  current,
  max,
  onNext,
  onPrevious,
}: PaginationActionsProps): ReactElement => {
  return (
    <div className="hidden items-center justify-between border-t border-border-subtlest-tertiary p-3 laptop:flex">
      <p className="ml-1 text-text-tertiary typo-callout">
        {current}/{max}
      </p>
      <div className="flex ">
        <Button
          {...buttonProps}
          icon={<ArrowIcon className="-rotate-90" />}
          variant={ButtonVariant.Tertiary}
          disabled={current === 1}
          onClick={onPrevious}
        />
        <Button
          {...buttonProps}
          icon={<ArrowIcon className="rotate-90" />}
          variant={ButtonVariant.Tertiary}
          disabled={max === current}
          onClick={onNext}
        />
      </div>
    </div>
  );
};

export interface InfinitePaginationActionsProps
  extends Pick<UsePagination, 'onPrevious' | 'onNext'> {
  hasNext: boolean;
  hasPrevious: boolean;
}

export const InfinitePaginationActions = ({
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
}: InfinitePaginationActionsProps): ReactElement => {
  return (
    <div className="flex items-center justify-end border-t border-border-subtlest-tertiary p-3">
      <Button
        {...buttonProps}
        icon={<ArrowIcon className="-rotate-90" />}
        variant={ButtonVariant.Tertiary}
        disabled={!hasPrevious}
        onClick={onPrevious}
      />
      <Button
        {...buttonProps}
        icon={<ArrowIcon className="rotate-90" />}
        variant={ButtonVariant.Tertiary}
        disabled={!hasNext}
        onClick={onNext}
      />
    </div>
  );
};
