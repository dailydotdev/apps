import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

const dotDelays = [
  '[animation-delay:0ms]',
  '[animation-delay:150ms]',
  '[animation-delay:300ms]',
];

// Sits where the peer's next bubble will appear.
export const TypingIndicator = ({
  username,
}: {
  username: string;
}): ReactElement => (
  <div
    role="status"
    aria-label={`@${username} is typing`}
    className="flex w-fit items-center gap-1 rounded-16 rounded-bl-4 border border-border-subtlest-tertiary px-3 py-3"
  >
    {dotDelays.map((delay) => (
      <span
        key={delay}
        className={classNames(
          'size-1.5 animate-bounce rounded-full bg-text-tertiary',
          delay,
        )}
      />
    ))}
  </div>
);
