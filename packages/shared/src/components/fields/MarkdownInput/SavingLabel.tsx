import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Loader } from '../../Loader';
import { VIcon } from '../../icons';
import { IconSize } from '../../Icon';

interface SavingLabelProps {
  isUptoDate?: boolean;
  isUpdating?: boolean;
  className?: string;
}

export function SavingLabel({
  isUptoDate,
  isUpdating,
  className,
}: SavingLabelProps): ReactElement {
  if (!isUptoDate && !isUpdating) {
    return null;
  }

  const getLabel = () => {
    if (isUpdating) {
      return 'Saving';
    }

    return isUptoDate ? 'Saved' : '';
  };

  const getIcon = () => {
    if (isUpdating) {
      return <Loader />;
    }

    return isUptoDate ? <VIcon size={IconSize.Medium} /> : '';
  };

  return (
    <span
      className={classNames(
        'text-text-tertiary typo-callout flex flex-row items-center gap-1 px-2 font-bold',
        className,
      )}
    >
      {getIcon()}
      {getLabel()}
    </span>
  );
}
