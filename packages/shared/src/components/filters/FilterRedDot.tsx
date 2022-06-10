import React, { ReactElement, useContext } from 'react';
import SettingsIcon from '../icons/Settings';
import { AlertColor, AlertDot } from '../AlertDot';
import AlertContext from '../../contexts/AlertContext';

export default function FilterRedDot(): ReactElement {
  const { alerts } = useContext(AlertContext) || {};
  const { filter: shouldShowFilterRedDot } = alerts || {};

  return (
    <div className="relative">
      <SettingsIcon />
      {shouldShowFilterRedDot && (
        <AlertDot className="top-0.5 right-0.5" color={AlertColor.BrightRed} />
      )}
    </div>
  );
}
