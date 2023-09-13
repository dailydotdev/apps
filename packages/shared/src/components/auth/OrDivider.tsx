import React, { ReactElement } from 'react';
import classNames from 'classnames';

interface OrDividerProps {
  className?: string;
  label?: string;
}

function OrDivider({ className, label = 'or' }: OrDividerProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex justify-center items-center typo-callout text-theme-label-quaternary',
        className,
      )}
    >
      <div className="flex-1 h-px bg-theme-divider-tertiary" />
      {label && <span className="px-3">{label}</span>}
      <div className="flex-1 h-px bg-theme-divider-tertiary" />
    </div>
  );
}

export default OrDivider;
