import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { MiniCloseIcon as XIcon } from './icons';
import { useDndContext } from '../contexts/DndContext';

/**
 * Top-of-page banner shown while a daily.dev DnD pause is active.
 * Lives in shared so the extension's `MainFeedPage` can mount it via
 * `customBanner`. Webapp surfaces don't render this — DnD storage is
 * extension-local, so a webapp Resume click can't reach it anyway.
 */
export const DndBanner = (): ReactElement => {
  const { onDndSettings } = useDndContext();

  // The strict signature requires a DndSettings object, but the underlying
  // `usePersistentContext('dnd')` mutation accepts null at runtime to clear
  // the IDB key. Match the same call site pattern used elsewhere.
  const turnOff = () =>
    (onDndSettings as unknown as (s: null) => Promise<void>)?.(null);

  return (
    <div className="relative z-popup flex w-full flex-col items-start bg-accent-onion-default py-3 pl-3 pr-12 typo-footnote laptop:fixed laptop:h-8 laptop:flex-row laptop:items-center laptop:justify-center laptop:p-0">
      <strong>daily.dev in a new tab is paused</strong>
      <Button
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Primary}
        className="mt-2 laptop:ml-4 laptop:mt-0"
        onClick={turnOff}
      >
        Unpause
      </Button>
      <Button
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Tertiary}
        className="absolute right-2 top-2 laptop:inset-y-0 laptop:my-auto"
        icon={<XIcon />}
        onClick={turnOff}
      />
    </div>
  );
};

export default DndBanner;
