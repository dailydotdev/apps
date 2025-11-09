import type { ReactElement } from 'react';
import React from 'react';
import classnames from 'classnames';
import { LoaderIcon } from '../../icons';
import { IconSize } from '../../Icon';
import type { WithClassNameProps } from '../common';

interface Props {
  className?: string;
  label?: string;
}

export const GenericLoaderSpinner = ({
  className,
  size,
}: { size: IconSize } & WithClassNameProps) => {
  return (
    <LoaderIcon
      size={size}
      className={classnames(
        className,
        `flex-shrink-0 animate-spin drop-shadow-[0_0_5px_var(--theme-shadow-cabbage)]`,
      )}
    />
  );
};

export const GenericLoader = ({
  className,
  label = 'Preparing...',
}: Props): ReactElement => {
  return (
    <div className="z-modal bg-background-default fixed inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <GenericLoaderSpinner size={IconSize.XLarge} className={className} />
        <div>{label}</div>
      </div>
    </div>
  );
};
