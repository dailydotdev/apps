import React, { ReactElement } from 'react';
import classNames from 'classnames';

interface OrDividerProps {
  className?: string;
}

function OrDivider({ className }: OrDividerProps): ReactElement {
  return (
    <div
      className={classNames('flex relative justify-center w-full', className)}
    >
      <span className="absolute top-1/2 z-0 w-full h-px bg-theme-divider-tertiary" />
      <div className="z-1 px-3 bg-theme-bg-tertiary text-theme-label-quaternary">
        or
      </div>
    </div>
  );
}

export default OrDivider;
