import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { ThemeMode } from '../../contexts/SettingsContext';
import classed from '../../lib/classed';
import { Radio, RadioOption, RadioProps } from '../fields/Radio';
import { HTMLElementComponent } from '../utilities';

interface ThemeWidgetProps extends Omit<RadioProps, 'options' | 'name'> {
  option: RadioOption;
}

const Background: HTMLElementComponent = ({ className }) => (
  <div
    className={classNames(
      'absolute right-0 bottom-0 rounded-tl-14 p-3 h-4/5 w-32 typo-footnote',
      className,
    )}
  >
    daily.dev
  </div>
);

const DarkNode = classed(Background, 'bg-theme-label-invert');
const LightNode = classed(
  Background,
  'bg-theme-label-primary text-theme-label-invert',
);
const bg: Record<ThemeMode, ReactNode> = {
  dark: <DarkNode />,
  light: <LightNode />,
  auto: (
    <>
      <DarkNode />
      <LightNode className="translate-x-1/2" />
    </>
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
