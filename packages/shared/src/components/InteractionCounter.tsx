import React, { ReactElement, useEffect, useState } from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import styles from './InteractionCounter.module.css';

export type InteractionCounterProps = { value: number | null };

export default function InteractionCounter({
  value,
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
  }, [value]);

  if (shownValue === value) {
    return <>{shownValue}</>;
  }

  const updateShownValue = () => {
    setAnimate(false);
    setShownValue(value);
  };

  return (
    <span className={`relative overflow-hidden ${styles.interactionCounter}`}>
      <span
        className={
          animate ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
        }
      >
        {shownValue}
      </span>
      <span
        className={`absolute top-0 left-0 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}
        onTransitionEnd={updateShownValue}
      >
        {value}
      </span>
    </span>
  );
}
