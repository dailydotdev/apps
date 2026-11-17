import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PostPage, samPost } from '../../real/pages';

/**
 * The page behind a flow, inside the production app shell. By default the
 * real post page of Sam's article, where an award is given.
 */
export const Stage = ({
  children,
  background = <PostPage post={samPost} />,
  onRestart,
  isDone,
}: {
  children?: ReactNode;
  /** What the app shows behind the modals */
  background?: ReactNode;
  onRestart?: () => void;
  isDone?: boolean;
}): ReactElement => (
  <>
    {background}
    {isDone && onRestart && (
      <Button
        className="opacity-60 fixed bottom-2 left-1/2 z-max -translate-x-1/2"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Float}
        onClick={onRestart}
      >
        Start over
      </Button>
    )}
    {children}
  </>
);
