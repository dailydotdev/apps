import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import classNames from 'classnames';
import { largeNumberFormat } from '../lib';

export type InteractionCounterProps = {
  className?: string;
  value: number;
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

  // Static (non-animating) render uses inline-flex + items-center so the
  // text vertically centers inside the 20 px box. The animated render
  // keeps flex-col so the two stacked numbers can slide on the y-axis.
  if (shownValue === value) {
    return (
      <span
        className={classNames(
          'inline-flex h-5 min-w-[1ch] items-center justify-start leading-none',
          className,
        )}
        {...props}
      >
        {largeNumberFormat(shownValue)}
      </span>
    );
  }

  const updateShownValue = () => {
    setAnimate(false);
    setShownValue(value);
  };

  const childClassName =
    'h-5 inline-flex items-center leading-none transition-[opacity,transform] ease-in-out duration-300 will-change-[opacity,transform]';

  return (
    <span
      className={classNames(
        'flex h-5 min-w-[1ch] flex-col overflow-hidden',
        className,
      )}
      {...props}
    >
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
