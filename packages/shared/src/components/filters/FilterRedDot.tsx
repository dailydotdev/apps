import React, { ReactElement, useContext } from 'react';
import SettingsIcon from '../../../icons/settings.svg';
import RedDot from '../RedDot';
import AlertContext from '../../contexts/AlertContext';

export default function FilterRedDot(): ReactElement {
  const {
    alerts: { filter: shouldShowFilterRedDot },
  } = useContext(AlertContext) || {};

  return (
    <div className="relative">
      <SettingsIcon />
      {shouldShowFilterRedDot && <RedDot />}
    </div>
  );
}
