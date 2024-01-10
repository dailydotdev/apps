import React, { ReactElement, useEffect, useState } from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import classNames from 'classnames';
import styles from './InteractionCounter.module.css';

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

  if (shownValue === value) {
    return (
      <span className={className} {...props}>
        {shownValue}
      </span>
    );
  }

  const updateShownValue = () => {
    setAnimate(false);
    setShownValue(value);
  };

  return (
    <span
      className={classNames(
        'relative overflow-hidden',
        styles.interactionCounter,
        className,
      )}
      {...props}
    >
      <span
        className={
          animate ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }
      >
        {shownValue}
      </span>
      <span
        className={`absolute left-0 top-0 ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        onTransitionEnd={updateShownValue}
      >
        {value}
      </span>
    </span>
  );
}
