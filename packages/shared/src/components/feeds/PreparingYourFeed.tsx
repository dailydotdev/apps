import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';

interface PreparingYourFeedProps {
  text: string;
  isAnimating?: boolean;
}

export const Container = classed(
  'div',
  'flex flex-col overflow-x-hidden items-center min-h-screen w-full h-full max-h-screen flex-1 z-max',
);

export function PreparingYourFeed({
  text,
  isAnimating,
}: PreparingYourFeedProps): ReactElement {
  return (
    <Container className="justify-center">
      <span className="flex h-1.5 w-full max-w-[19.125rem] flex-row items-center rounded-12 bg-border-subtlest-tertiary px-0.5">
        <span
          className={classNames(
            'relative flex h-0.5 w-0 flex-row items-center bg-brand-default transition-[width] duration-[2500ms]',
            isAnimating && 'w-full',
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.1, 0.7, 1.0, 0.1)',
          }}
        >
          <span className="absolute right-0 h-5 w-5 translate-x-1/2 bg-brand-default blur-[0.625rem]" />
        </span>
      </span>
      <span className="mt-3 font-normal text-text-secondary typo-body">
        {text}
      </span>
    </Container>
  );
}
