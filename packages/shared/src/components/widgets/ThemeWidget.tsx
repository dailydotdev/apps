import React, { ReactElement, ReactNode } from 'react';
import { ThemeMode } from '../../contexts/SettingsContext';
import { RadioOption } from '../fields/Radio';
import { RadioItem, RadioItemProps } from '../fields/RadioItem';
import ThemeWidgetBackground, {
  DarkNode,
  DarkNodeLayout,
  LightNode,
  LightNodeLayout,
} from './ThemeWidgetBackground';

interface ThemeWidgetProps extends Omit<RadioItemProps, 'onChange'> {
  option: RadioOption<ThemeMode>;
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

function ThemeWidget({
  option,
  onChange,
  ...props
}: ThemeWidgetProps): ReactElement {
  return (
    <label
      htmlFor={option.value}
      className="flex overflow-hidden relative flex-row items-center pl-4 w-full h-24 rounded-14 hover:cursor-pointer bg-theme-divider-tertiary"
    >
      <RadioItem
        {...props}
        name="theme"
        id={option.value}
        value={option.value}
        onChange={() => onChange(option.value)}
        className="my-0.5 truncate"
      >
        {option.label}
      </RadioItem>
      {bg[option.value]}
    </label>
  );
}

export default ThemeWidget;
