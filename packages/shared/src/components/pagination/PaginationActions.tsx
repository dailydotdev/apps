import React, { MouseEventHandler, ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';

export interface PaginationActionsProps {
  current: number;
  max: number;
  onNext: MouseEventHandler;
  onPrevious: MouseEventHandler;
}

const buttonProps = {
  type: 'button',
  iconOnly: true,
  buttonSize: ButtonSize.Small,
  icon: <ArrowIcon className="-rotate-90" />,
};

export const PaginationActions = ({
  current,
  max,
  onNext,
  onPrevious,
}: PaginationActionsProps): ReactElement => {
  return (
    <div className="hidden laptop:flex justify-between items-center p-3 border-t border-theme-divider-tertiary">
      <p className="ml-1 text-theme-label-tertiary typo-callout">1/1</p>
      <div className="flex ">
        <Button
          {...buttonProps}
          className="btn-tertiary"
          disabled={current === 1}
          onClick={onNext}
        />
        <Button
          {...buttonProps}
          className="btn-tertiary"
          disabled={max === current}
          onClick={onPrevious}
        />
      </div>
    </div>
  );
};
