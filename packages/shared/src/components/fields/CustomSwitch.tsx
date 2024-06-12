import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import styles from './CustomSwitch.module.css';
import classed from '../../lib/classed';

export interface ContentsSwitchProps {
  className?: string;
  inputId: string;
  name: string;
  checked?: boolean;
  onToggle?: () => unknown;
  leftContent: ReactNode | string;
  rightContent: ReactNode | string;
}

const ContentContainer = classed(
  'span',
  'relative flex items-center justify-center z-2 px-3',
);

const baseContentClass = 'transform transition-transform text-base';
const unselectedContentClass = 'text-text-tertiary';
const selectedContentClass = 'scale-125';

export function CustomSwitch({
  className,
  inputId,
  name,
  checked,
  onToggle,
  leftContent,
  rightContent,
}: ContentsSwitchProps): ReactElement {
  const leftRef = useRef<HTMLElement>();
  const rightRef = useRef<HTMLElement>();
  const [leftWidth, setLeftWidth] = useState(0);
  const [rightWidth, setRightWidth] = useState(0);

  useEffect(() => {
    if (!leftRef?.current || !rightRef?.current) {
      return;
    }

    const { width: left } = leftRef.current.getBoundingClientRect();
    setLeftWidth(left);
    const { width: right } = rightRef.current.getBoundingClientRect();
    setRightWidth(right);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftRef?.current, rightRef?.current]);

  const leftClasses = classNames(
    baseContentClass,
    checked ? unselectedContentClass : selectedContentClass,
  );
  const rightClasses = classNames(
    baseContentClass,
    checked ? selectedContentClass : unselectedContentClass,
  );

  const width = checked ? rightWidth : leftWidth;
  const difference = Math.abs(rightWidth - leftWidth);

  return (
    <label
      className={classNames(
        'group relative flex h-9 w-fit cursor-pointer font-bold typo-callout',
        className,
      )}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        name={name}
        type="checkbox"
        className="absolute size-0 opacity-0"
        checked={checked}
        onChange={onToggle}
      />
      <ContentContainer
        ref={leftRef}
        className={checked && 'text-text-tertiary'}
      >
        {typeof leftContent === 'string'
          ? leftContent
          : React.cloneElement(leftContent as ReactElement, {
              className: classNames(
                (leftContent as ReactElement).props.className,
                leftClasses,
              ),
            })}
      </ContentContainer>
      <ContentContainer
        ref={rightRef}
        className={!checked && 'text-text-tertiary'}
      >
        {typeof rightContent === 'string'
          ? rightContent
          : React.cloneElement(rightContent as ReactElement, {
              className: classNames(
                (rightContent as ReactElement).props.className,
                rightClasses,
              ),
            })}
      </ContentContainer>
      <span className="absolute inset-0 my-auto h-7 rounded-10 bg-accent-cabbage-bolder opacity-24 group-hover:opacity-32" />
      <span
        className={classNames(
          'absolute top-0 z-1 h-full rounded-12',
          styles.knob,
        )}
        style={{
          width: `${width}px`,
          transform: checked
            ? `translateX(calc(100% + ${difference}px))`
            : 'translateX(0)',
        }}
      />
    </label>
  );
}
