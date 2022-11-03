import React, { ReactElement, useContext } from 'react';
import SettingsContext, { themes } from '../../contexts/SettingsContext';
import ThemeWidget from '../widgets/ThemeWidget';
import OnboardingStep from './OnboardingStep';

function ThemeOnboarding(): ReactElement {
  const { themeMode, setTheme } = useContext(SettingsContext);

  return (
    <OnboardingStep
      title="Your eyes don’t lie"
      description="daily.dev looks good in dark mode or in light mode, the choice is yours!"
      className={{ content: 'grid grid-cols-1 gap-6 mt-11 px-11' }}
    >
      {themes.map((theme) => (
        <ThemeWidget
          key={theme.label}
          option={theme}
          value={themeMode}
          onChange={setTheme}
        />
      ))}
    </OnboardingStep>
  );
}

export default ThemeOnboarding;
