import React, { ReactElement } from 'react';
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
      return 'Saving changes';
    }

    return isUptoDate ? 'All changes saved' : '';
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
        'flex flex-row items-center gap-1 font-bold text-theme-label-tertiary typo-callout',
        className,
      )}
    >
      {getIcon()}
      {getLabel()}
    </span>
  );
}
