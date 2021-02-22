/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { ReactElement, useEffect, useState } from 'react';
import requestIdleCallback from 'next/dist/client/request-idle-callback';

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
    <span
      css={css`
        position: relative;
        overflow: hidden;
        min-width: 1ch;

        & > * {
          display: inline-block;
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
          will-change: opacity, transform;
        }
      `}
    >
      <span
        css={css`
          opacity: 1;
          transform: translateY(0);

          && {
            ${animate &&
            `
            opacity: 0;
            transform: translateY(-100%);
          `}
          }
        `}
      >
        {shownValue}
      </span>
      <span
        css={css`
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          transform: translateY(100%);

          && {
            ${animate &&
            `
            opacity: 1;
            transform: translateY(0);
          `}
          }
        `}
        onTransitionEnd={updateShownValue}
      >
        {value}
      </span>
    </span>
  );
}
