import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

interface DigitColumnProps {
  digit: string;
  animate: boolean;
}

function DigitColumn({ digit, animate }: DigitColumnProps): ReactElement {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [prevDigit, setPrevDigit] = useState(digit);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (digit !== displayDigit && animate) {
      setPrevDigit(displayDigit);
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setDisplayDigit(digit);
        setIsAnimating(false);
      }, 400);

      return () => clearTimeout(timer);
    }

    if (digit !== displayDigit) {
      setDisplayDigit(digit);
    }

    return undefined;
  }, [digit, displayDigit, animate]);

  return (
    <span className="relative inline-flex h-[1.2em] w-[0.65em] overflow-hidden">
      <span
        className={classNames(
          'duration-400 absolute inset-0 flex items-center justify-center transition-transform',
          isAnimating ? '-translate-y-full opacity-0' : 'translate-y-0',
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {isAnimating ? prevDigit : displayDigit}
      </span>
      {isAnimating && (
        <span className="absolute inset-0 flex animate-streak-digit-in items-center justify-center">
          {digit}
        </span>
      )}
    </span>
  );
}

export function AnimatedNumber({
  value,
  className,
}: AnimatedNumberProps): ReactElement {
  const prevValueRef = useRef(value);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setShouldAnimate(true);
      prevValueRef.current = value;

      const timer = setTimeout(() => setShouldAnimate(false), 500);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [value]);

  const digits = String(value).split('');

  return (
    <span className={classNames('inline-flex', className)}>
      {digits.map((digit, index) => (
        <DigitColumn
          // eslint-disable-next-line react/no-array-index-key
          key={`${digits.length}-${index}`}
          digit={digit}
          animate={shouldAnimate}
        />
      ))}
    </span>
  );
}
