import React, { ReactElement } from 'react';
import ScoutIcon from '../icons/Scout';
import { IconSize } from '../Icon';

export default function ScoutBadge(): ReactElement {
  return (
    <span className="flex items-center ml-2 font-bold text-theme-color-bun typo-footnote">
      <ScoutIcon className="mr-0.5" size={IconSize.XSmall} />
      Scout
    </span>
  );
}
