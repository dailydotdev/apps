import React, { ReactElement } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MiniCloseIcon as XIcon } from '@dailydotdev/shared/src/components/icons';
import { useDndContext } from '@dailydotdev/shared/src/contexts/DndContext';

export default function DndBanner(): ReactElement {
  const { onDndSettings } = useDndContext();

  const turnOff = () => onDndSettings(null);

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
}
