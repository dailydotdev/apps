import React, { ReactElement } from 'react';
import { ThemeMode, themes } from '../../contexts/SettingsContext';
import ThemeWidget from '../widgets/ThemeWidget';
import OnboardingStep from './OnboardingStep';

interface ThemeOnboardingProps {
  selectedTheme: string;
  onThemeChange: (theme: ThemeMode) => void;
}

function ThemeOnboarding({
  selectedTheme,
  onThemeChange,
}: ThemeOnboardingProps): ReactElement {
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
          value={selectedTheme}
          onChange={onThemeChange}
        />
      ))}
    </OnboardingStep>
  );
}

export default ThemeOnboarding;
