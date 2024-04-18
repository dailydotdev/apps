import classNames from 'classnames';
import React, { ReactElement } from 'react';

interface TabLabelProps {
  label: string;
  isActive?: boolean;
  showActiveAsH1?: boolean;
}
const TabLabel = ({
  label,
  isActive = false,
  showActiveAsH1 = false,
}: TabLabelProps): ReactElement => {
  const Tag = showActiveAsH1 && isActive ? 'h1' : 'span';

  return (
    <Tag
      className={classNames(
        'inline rounded-10 px-3 py-1.5',
        isActive && 'bg-theme-active',
      )}
    >
      {label}
    </Tag>
  );
};

export default TabLabel;
