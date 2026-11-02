import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

// The pulse that marks a chat as happening right now.
export const LiveDot = ({
  isLive = true,
  className,
}: {
  isLive?: boolean;
  className?: string;
}): ReactElement => (
  <span
    aria-hidden="true"
    className={classNames(
      'relative inline-flex size-2 shrink-0 rounded-full',
      isLive ? 'bg-brand-default' : 'bg-text-quaternary',
      className,
    )}
  >
    {isLive && (
      <span className="opacity-60 absolute inset-0 animate-ping rounded-full bg-brand-default motion-reduce:hidden" />
    )}
  </span>
);
