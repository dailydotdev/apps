import React, { ReactElement } from 'react';
import ScoutIcon from '../icons/Scout';

export default function ScoutBadge(): ReactElement {
  return (
    <span className="ml-2 flex items-center font-bold text-theme-color-bun typo-footnote">
      <ScoutIcon className="mr-0.5" size="small" />
      Scout
    </span>
  );
}
