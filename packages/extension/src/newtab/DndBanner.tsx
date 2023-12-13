import React, { ReactElement, useContext } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import XIcon from '@dailydotdev/shared/src/components/icons/MiniClose';
import DndContext from './DndContext';

export default function DndBanner(): ReactElement {
  const { onDndSettings } = useContext(DndContext);

  const turnOff = () => onDndSettings(null);

  return (
    <div className="flex relative laptop:fixed z-3 flex-col laptop:flex-row laptop:justify-center items-start laptop:items-center laptop:p-0 py-3 pr-12 pl-3 w-full laptop:h-8 typo-footnote bg-theme-bg-onion">
      <strong>daily.dev in a new tab is paused</strong>
      <Button
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Primary}
        className="mt-2 laptop:mt-0 laptop:ml-4"
        onClick={turnOff}
      >
        Unpause
      </Button>
      <Button
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Tertiary}
        className="laptop:inset-y-0 top-2 right-2 laptop:my-auto absolute"
        icon={<XIcon />}
        onClick={turnOff}
      />
    </div>
  );
}
