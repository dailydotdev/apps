import React, { ReactElement, ReactNode, useState } from 'react';
import classNames from 'classnames';
import { PaginationActions, PaginationActionsProps } from './PaginationActions';

interface PaginationContainerProps extends Pick<PaginationActionsProps, 'max'> {
  className?: string;
  children: ReactNode;
}

export function PaginationContainer({
  className,
  children,
  max,
}: PaginationContainerProps): ReactElement {
  const [page, setPage] = useState(0);

  return (
    <div className={classNames('flex flex-col', className)}>
      {children}
      <PaginationActions
        onPrevious={() => setPage((value) => value - 1)}
        onNext={() => setPage((value) => value + 1)}
        current={page}
        max={max}
      />
    </div>
  );
}
