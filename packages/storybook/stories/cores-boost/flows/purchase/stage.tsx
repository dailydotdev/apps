import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

/** The page behind a flow. react-modal binds to #__next, so modals mount
 * once that element is in the DOM. */
export const Stage = ({
  children,
  background,
  onRestart,
  isDone,
}: {
  children: ReactNode;
  /** What the app shows behind the modals */
  background?: ReactNode;
  onRestart?: () => void;
  isDone?: boolean;
}): ReactElement => {
  const [isMounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div id="__next" className="min-h-screen bg-background-default">
      {background}
      {isDone && onRestart && (
        <div className="p-6">
          <Button variant={ButtonVariant.Primary} onClick={onRestart}>
            Start over
          </Button>
        </div>
      )}
      {isMounted && children}
    </div>
  );
};
