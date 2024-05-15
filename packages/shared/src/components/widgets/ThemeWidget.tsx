import React, { ReactElement, ReactNode } from 'react';
import { ThemeMode } from '../../contexts/SettingsContext';
import { RadioItem, RadioItemProps } from '../fields/RadioItem';
import ThemeWidgetBackground, {
  DarkNode,
  DarkNodeLayout,
  LightNode,
  LightNodeLayout,
} from './ThemeWidgetBackground';

interface ThemeWidgetProps extends Omit<RadioItemProps, 'onChange'> {
  option: RadioItemProps<ThemeMode>;
  onChange: (value: ThemeMode) => void;
}

const bg: Record<ThemeMode, ReactNode> = {
  dark: DarkNodeLayout,
  light: LightNodeLayout,
  auto: (
    <ThemeWidgetBackground className="ml-auto grid w-36 grid-cols-2 gap-4 rounded-14 pt-6">
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
      className="relative flex h-24 w-full flex-row items-center overflow-hidden rounded-14 bg-border-subtlest-tertiary pl-4 hover:cursor-pointer"
    >
      <RadioItem
        {...props}
        name="theme"
        id={option.value}
        value={option.value}
        onChange={() => onChange(option.value)}
        className={{ content: 'my-0.5 truncate' }}
      >
        {option.label}
      </RadioItem>
      {bg[option.value]}
    </label>
  );
}

export default ThemeWidget;
