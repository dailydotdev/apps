import type { ReactElement } from 'react';
import React from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { Switch } from '../fields/Switch';

const ReadingStreakSwitch = (): ReactElement => {
  const { optOutReadingStreak, toggleOptOutReadingStreak } =
    useSettingsContext();

  return (
    <Switch
      inputId="reading-streaks-switch"
      name="reading-streaks"
      compact={false}
      checked={!optOutReadingStreak}
      onToggle={toggleOptOutReadingStreak}
    >
      Show reading streaks
    </Switch>
  );
};

export default ReadingStreakSwitch;
