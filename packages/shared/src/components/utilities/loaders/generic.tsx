import React, { ReactElement } from 'react';
import classnames from 'classnames';
import { LoaderIcon } from '../../icons';
import { IconSize } from '../../Icon';

interface Props {
  className?: string;
  label?: string;
}

export const GenericLoader = ({
  className,
  label = 'Preparing...',
}: Props): ReactElement => {
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-background-default">
      <div className="flex flex-col items-center gap-5">
        <LoaderIcon
          size={IconSize.XLarge}
          className={classnames(
            className,
            `flex-shrink-0 animate-spin drop-shadow-[0_0_5px_var(--theme-shadow-cabbage)]`,
          )}
        />
        <div>{label}</div>
      </div>
    </div>
  );
};
