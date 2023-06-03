import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Loader } from '../../Loader';
import VIcon from '../../icons/V';
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
  if (!isUptoDate && !isUpdating) return null;

  const label = (() => {
    if (isUpdating) return 'Saving changes';

    return isUptoDate ? 'All changes saved' : '';
  })();

  const icon = (() => {
    if (isUpdating) return <Loader />;

    return isUptoDate ? <VIcon size={IconSize.Medium} /> : '';
  })();

  return (
    <span
      className={classNames(
        'flex flex-row items-center gap-1 typo-callout font-bold text-theme-label-tertiary',
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
