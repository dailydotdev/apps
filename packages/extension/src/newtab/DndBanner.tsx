import React, { ReactElement, useContext } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import XIcon from '@dailydotdev/shared/icons/x.svg';
import DndContext from './DndContext';

export default function DndBanner(): ReactElement {
  const { setDndSettings } = useContext(DndContext);

  const turnOff = () => setDndSettings(null);

  return (
    <div className="relative flex flex-col items-start py-3 pl-3 pr-12 typo-footnote laptop:h-8 laptop:flex-row laptop:items-center laptop:justify-center laptop:p-0 bg-theme-bg-onion">
      <div>
        <strong>Do not disturb mode is active</strong>
      </div>
      <Button
        buttonSize="xsmall"
        className="mt-2 laptop:ml-4 laptop:mt-0 btn-primary"
        onClick={turnOff}
      >
        Turn off
      </Button>
      <Button
        buttonSize="xsmall"
        className="top-2 right-2 laptop:inset-y-0 laptop:my-auto btn-tertiary"
        style={{ position: 'absolute' }}
        icon={<XIcon />}
        onClick={turnOff}
      />
    </div>
  );
}
