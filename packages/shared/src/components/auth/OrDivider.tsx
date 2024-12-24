import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface ClassName {
  container?: string;
  text?: string;
  border?: string;
}

interface OrDividerProps {
  className?: ClassName;
  label?: string;
}

function OrDivider({
  className = {},
  label = 'or',
}: OrDividerProps): ReactElement {
  const borderColor = className?.border || 'bg-border-subtlest-tertiary';
  return (
    <div
      aria-hidden
      className={classNames(
        'flex items-center justify-center typo-callout',
        className?.container,
        className?.text || 'text-text-quarternary',
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
