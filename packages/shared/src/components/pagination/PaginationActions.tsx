import React, { ReactElement } from 'react';
import ArrowIcon from '../icons/Arrow';
import { UsePagination } from '../../hooks/utils';
import { Button, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';

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
    <div className="hidden laptop:flex justify-between items-center p-3 border-t border-theme-divider-tertiary">
      <p className="ml-1 text-theme-label-tertiary typo-callout">
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
    <div className="flex justify-end items-center p-3 border-t border-theme-divider-tertiary">
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
