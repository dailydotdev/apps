import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import classNames from 'classnames';
import { largeNumberFormat } from '../lib';

export type InteractionCounterProps = {
  className?: string;
  value: number | null;
};

export default function InteractionCounter({
  className,
  value,
  ...props
}: InteractionCounterProps): ReactElement {
  const [shownValue, setShownValue] = useState(value);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const formattedValue = largeNumberFormat(value);
    const formattedShownValue = largeNumberFormat(shownValue);
    if (formattedValue !== formattedShownValue) {
      if (value < shownValue) {
        setShownValue(value);
      } else {
        setAnimate(false);
        requestIdleCallback(() => setAnimate(true));
      }
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const elementClassName = classNames(
    'flex h-5 min-w-[2ch] flex-col items-start overflow-hidden text-left !leading-5',
    className,
  );

  if (shownValue === value) {
    return (
      <span className={elementClassName} {...props}>
        {largeNumberFormat(shownValue)}
      </span>
    );
  }

  const updateShownValue = () => {
    setAnimate(false);
    setShownValue(value);
  };

  const animationContainerClassName =
    'flex flex-col items-start transition-transform duration-300 ease-in-out will-change-transform';
  const rowClassName = 'inline-block h-5 shrink-0 !leading-5';

  return (
    <span className={elementClassName} {...props}>
      <span
        className={classNames(
          animationContainerClassName,
          animate ? '-translate-y-5' : 'translate-y-0',
        )}
        onTransitionEnd={updateShownValue}
      >
        <span className={rowClassName}>{largeNumberFormat(shownValue)}</span>
        <span className={rowClassName}>{largeNumberFormat(value)}</span>
      </span>
    </span>
  );
}
