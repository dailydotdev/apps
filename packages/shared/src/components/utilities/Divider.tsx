import React, { ReactElement } from 'react';
import classNames from 'classnames';

interface DividerProps {
  className?: string;
  vertical?: boolean;
}

export const Divider = ({
  className = 'bg-theme-divider-primary',
  vertical = false,
}: DividerProps): ReactElement => {
  if (vertical) {
    return <span className={classNames(className, 'h-5 w-px')} />;
  }

  return <span className={classNames(className, 'h-px w-full')} />;
};
