import React, { ReactElement } from 'react';
import ScoutIcon from '../../../icons/filled/scout.svg';

export default function ScoutBadge(): ReactElement {
  return (
    <span className="flex items-center ml-2 text-theme-color-bun typo-footnote">
      <ScoutIcon className="mr-0.5 text-base icon" />
      Scout
    </span>
  );
}
