import React, { ReactElement, useEffect, useState } from 'react';
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
    if (value !== shownValue) {
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
    'flex h-5 min-w-[1ch] flex-col overflow-hidden',
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

  const childClassName =
    'h-5 inline-block transition-[opacity,transform] ease-in-out duration-300 will-change-[opacity,transform]';

  return (
    <span className={elementClassName} {...props}>
      <span
        className={classNames(
          childClassName,
          animate ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100',
        )}
      >
        {largeNumberFormat(shownValue)}
      </span>
      <span
        className={classNames(
          childClassName,
          animate ? '-translate-y-full opacity-100' : 'translate-y-0 opacity-0',
        )}
        onTransitionEnd={updateShownValue}
      >
        {largeNumberFormat(value)}
      </span>
    </span>
  );
}
