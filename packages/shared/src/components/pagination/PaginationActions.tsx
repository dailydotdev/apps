import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { UsePagination } from '../../hooks/utils/usePagination';

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
          className="btn-tertiary"
          disabled={current === 1}
          onClick={onNext}
        />
        <Button
          {...buttonProps}
          icon={<ArrowIcon className="rotate-90" />}
          className="btn-tertiary"
          disabled={max === current}
          onClick={onPrevious}
        />
      </div>
    </div>
  );
};
