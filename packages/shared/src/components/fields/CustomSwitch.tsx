import React, { ReactElement, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './CustomSwitch.module.css';
import classed from '../../lib/classed';

export interface ContentsSwitchProps {
  className?: string;
  inputId: string;
  name: string;
  checked?: boolean;
  onToggle?: () => unknown;
  leftContent: React.FC<{ className?: string }> | string;
  rightContent: React.FC<{ className?: string }> | string;
}

const ContentContainer = classed(
  'span',
  'relative flex items-center justify-center z-2 px-3',
);

const baseContentClass = 'transform transition-transform text-base';
const unselectedContentClass = 'text-theme-label-tertiary scale-125';
const selectedContentClass = 'scale-150';

export function CustomSwitch({
  className,
  inputId,
  name,
  checked,
  onToggle,
  leftContent: LeftContent,
  rightContent: RightContent,
}: ContentsSwitchProps): ReactElement {
  const leftRef = useRef<HTMLElement>();
  const rightRef = useRef<HTMLElement>();
  const [width, setWidth] = useState('');

  useEffect(() => {
    if (!leftRef?.current || !rightRef?.current) {
      return;
    }

    const element = checked ? rightRef.current : leftRef.current;
    const { width: elementWidth } = element.getBoundingClientRect();
    setWidth(`${elementWidth}px`);
  }, [checked]);

  const leftClasses = classNames(
    baseContentClass,
    checked ? unselectedContentClass : selectedContentClass,
  );
  const rightClasses = classNames(
    baseContentClass,
    checked ? selectedContentClass : unselectedContentClass,
  );

  return (
    <label
      className={classNames(
        'group relative flex h-9 w-fit cursor-pointer typo-callout font-bold',
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
      <ContentContainer
        ref={leftRef}
        className={checked && 'text-theme-label-tertiary'}
      >
        {typeof LeftContent === 'string' ? (
          LeftContent
        ) : (
          <LeftContent className={classNames(leftClasses)} />
        )}
      </ContentContainer>
      <ContentContainer
        ref={rightRef}
        className={!checked && 'text-theme-label-tertiary'}
      >
        {typeof RightContent === 'string' ? (
          RightContent
        ) : (
          <RightContent className={rightClasses} />
        )}
      </ContentContainer>
      <span className="absolute inset-0 my-auto h-7 bg-cabbage-50 rounded-10 opacity-24 group-hover:opacity-32" />
      <span
        className={classNames(
          'absolute  top-0 h-full rounded-xl z-1',
          styles.knob,
          checked && styles.checked,
        )}
        style={{ width }}
      />
    </label>
  );
}
