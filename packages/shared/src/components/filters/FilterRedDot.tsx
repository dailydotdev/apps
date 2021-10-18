import React, { ReactElement } from 'react';
import { useRedDot } from '../../hooks/useRedDot';
import SettingsIcon from '../../../icons/settings.svg';
import RedDot from '../RedDot';

const FILTER_RED_DOT_STATE = 'filter_red_dot';

export default function FilterRedDot(): ReactElement {
  const [shouldShowRedDot] = useRedDot(FILTER_RED_DOT_STATE, true);

  return (
    <div className="relative">
      <SettingsIcon />
      {shouldShowRedDot && <RedDot />}
    </div>
  );
}
