import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';

interface DividerProps {
  className?: string;
  vertical?: boolean;
}

const DividerBase = classed('span', 'bg-theme-divider-primary');

export const Divider = ({
  className,
  vertical = false,
}: DividerProps): ReactElement => {
  if (vertical) {
    return <DividerBase className={classNames(className, 'h-5 w-px')} />;
  }

  return <DividerBase className={classNames(className, 'h-px w-full')} />;
};
