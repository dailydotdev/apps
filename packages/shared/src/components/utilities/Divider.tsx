import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';

interface DividerProps {
  className?: string;
  vertical?: boolean;
}

const DividerBase = classed('span', 'bg-border-subtlest-primary');

export const Divider = ({
  className = 'bg-border-subtlest-primary',
  vertical = false,
}: DividerProps): ReactElement => {
  if (vertical) {
    return <DividerBase className={classNames(className, 'h-5 w-px')} />;
  }

  return <DividerBase className={classNames(className, 'h-px w-full')} />;
};
