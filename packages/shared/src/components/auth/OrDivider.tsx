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
        'flex items-center justify-center text-theme-label-quaternary typo-callout',
        className,
      )}
    >
      <div className="h-px flex-1 bg-theme-divider-tertiary" />
      {label && <span className="px-3">{label}</span>}
      <div className="h-px flex-1 bg-theme-divider-tertiary" />
    </div>
  );
}

export default OrDivider;
