import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { WorldState } from './worldState';

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="flex min-w-5 justify-center rounded-6 border border-border-subtlest-tertiary bg-background-subtle px-1.5 font-sans text-text-secondary typo-caption1">
    {children}
  </kbd>
);

/**
 * You are on a bird.
 *
 * Everything that reads the world from outside it is hidden while you are
 * inside it, so this is the only chrome left, and it has to carry the one key
 * that gets you off, because nothing else on screen says how to leave.
 */
export function WorldRiding({ state }: { state: WorldState }): ReactElement {
  const manual = state.riding?.manual;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-2 flex justify-center px-4">
      <div className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-16 border border-border-subtlest-tertiary bg-background-default px-4 py-2.5">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          bold
        >
          Riding
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="flex flex-wrap items-center gap-1"
        >
          {manual ? (
            <>
              <Key>W</Key>
              <Key>S</Key> forward/back · <Key>A</Key>
              <Key>D</Key> turn · <Key>space</Key>
              <Key>shift</Key> up/down · move the mouse to look · <Key>esc</Key>{' '}
              to get off
            </>
          ) : (
            <>
              move the mouse to look · <Key>W</Key>
              <Key>A</Key>
              <Key>S</Key>
              <Key>D</Key> take the controls · <Key>esc</Key> to get off
            </>
          )}
        </Typography>
      </div>
    </div>
  );
}
