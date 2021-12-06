import React, { ReactElement, useContext } from 'react';
import SettingsIcon from '../../../icons/settings.svg';
import { RedDot } from '../notifs';
import AlertContext from '../../contexts/AlertContext';

export default function FilterRedDot(): ReactElement {
  const { alerts } = useContext(AlertContext) || {};
  const { filter: shouldShowFilterRedDot } = alerts || {};

  return (
    <div className="relative">
      <SettingsIcon />
      {shouldShowFilterRedDot && <RedDot />}
    </div>
  );
}
