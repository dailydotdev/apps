import React, { ReactElement, useContext } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import XIcon from '@dailydotdev/shared/icons/x.svg';
import DndContext from './DndContext';

export default function DndBanner(): ReactElement {
  const { setDndSettings } = useContext(DndContext);

  const turnOff = () => setDndSettings(null);

  return (
    <div className="flex relative flex-col laptop:flex-row laptop:justify-center items-start laptop:items-center laptop:p-0 py-3 pr-12 pl-3 laptop:h-8 typo-footnote bg-theme-bg-onion">
      <div>
        <strong>Do not disturb mode is active</strong>
      </div>
      <Button
        buttonSize="xsmall"
        className="mt-2 laptop:mt-0 laptop:ml-4 btn-primary"
        onClick={turnOff}
      >
        Turn off
      </Button>
      <Button
        buttonSize="xsmall"
        className="laptop:inset-y-0 top-2 right-2 laptop:my-auto btn-tertiary"
        style={{ position: 'absolute' }}
        icon={<XIcon />}
        onClick={turnOff}
      />
    </div>
  );
}
