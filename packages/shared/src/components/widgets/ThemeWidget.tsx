import React, { ReactElement, ReactNode } from 'react';
import { ThemeMode } from '../../contexts/SettingsContext';
import { Radio, RadioOption, RadioProps } from '../fields/Radio';
import ThemeWidgetBackground, {
  DarkNode,
  DarkNodeLayout,
  LightNode,
  LightNodeLayout,
} from './ThemeWidgetBackground';

interface ThemeWidgetProps extends Omit<RadioProps, 'options' | 'name'> {
  option: RadioOption;
  onChange: (value: ThemeMode) => void;
}

const bg: Record<ThemeMode, ReactNode> = {
  dark: DarkNodeLayout,
  light: LightNodeLayout,
  auto: (
    <ThemeWidgetBackground className="grid grid-cols-2 gap-4 pt-6 ml-auto w-36 rounded-14">
      {LightNode}
      {DarkNode}
    </ThemeWidgetBackground>
  ),
};

function ThemeWidget({ option, ...props }: ThemeWidgetProps): ReactElement {
  return (
    <div className="flex overflow-hidden relative flex-row items-center pl-4 w-full h-24 rounded-14 bg-theme-divider-tertiary">
      <Radio {...props} options={[option]} name="theme" />
      {bg[option.value]}
    </div>
  );
}

export default ThemeWidget;
