import React, { ReactElement } from 'react';
import classNames from 'classnames';
import styles from './IconsSwitch.module.css';
import classed from '../../lib/classed';

export interface IconsSwitchProps {
  className?: string;
  inputId: string;
  name: string;
  checked?: boolean;
  onToggle?: () => unknown;
  leftIcon: React.FC<{ className?: string }>;
  rightIcon: React.FC<{ className?: string }>;
}

const IconContainer = classed(
  'span',
  'relative flex flex-1 items-center justify-center z-2',
);

const baseIconClass = 'transform transition-transform text-base';
const unselectedIconClass = 'text-theme-label-secondary scale-125';
const selectedIconClass = 'scale-150';

export function IconsSwitch({
  className,
  inputId,
  name,
  checked,
  onToggle,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
}: IconsSwitchProps): ReactElement {
  return (
    <label
      className={classNames(
        'group relative flex w-28 h-9 cursor-pointer',
        className,
      )}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        name={name}
        type="checkbox"
        className="absolute w-0 h-0 opacity-0"
        checked={checked}
        onChange={onToggle}
      />
      <IconContainer>
        <LeftIcon
          className={classNames(
            baseIconClass,
            checked ? unselectedIconClass : selectedIconClass,
          )}
        />
      </IconContainer>
      <IconContainer>
        <RightIcon
          className={classNames(
            baseIconClass,
            checked ? selectedIconClass : unselectedIconClass,
          )}
        />
      </IconContainer>
      <span className="absolute top-0 bottom-0 left-0 my-auto w-full h-7 bg-water-50 rounded-10 opacity-24 group-hover:opacity-32" />
      <span
        className={classNames(
          'absolute left-0 top-0 w-1/2 h-full rounded-xl z-1 transition-transform transform',
          styles.knob,
          checked && 'translate-x-full',
        )}
      />
    </label>
  );
}
