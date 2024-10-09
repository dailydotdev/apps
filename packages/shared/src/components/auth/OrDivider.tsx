import React, { ReactElement } from 'react';
import classNames from 'classnames';

interface OrDividerProps {
  className?: string;
  textColor?: string;
  borderColor?: string;
  label?: string;
}

function OrDivider({
  className,
  label = 'or',
  textColor = 'text-text-quarternary',
  borderColor = 'bg-border-subtlest-tertiary',
}: OrDividerProps): ReactElement {
  return (
    <div
      aria-hidden
      className={classNames(
        'flex items-center justify-center typo-callout',
        className,
        textColor,
      )}
      role="separator"
    >
      <div className={classNames('h-px flex-1', borderColor)} />
      {label && <span className="px-3">{label}</span>}
      <div className={classNames('h-px flex-1', borderColor)} />
    </div>
  );
}

export default OrDivider;
