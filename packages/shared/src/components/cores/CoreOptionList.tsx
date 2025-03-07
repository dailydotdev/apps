import type { ReactElement } from 'react';
import React from 'react';
import { CoreOptionButton } from './CoreOptionButton';

export const CoreOptionList = (): ReactElement => {
  return (
    <ul className="mt-4 flex flex-col gap-2" role="radiogroup">
      <CoreOptionButton id="1" />
      <CoreOptionButton id="2" />
      <CoreOptionButton id="3" />
      <CoreOptionButton id="4" />
      <CoreOptionButton id="5" />
      <CoreOptionButton id="6" />
      <CoreOptionButton id="7" />
      <CoreOptionButton id="8" />
      <CoreOptionButton id="9" />
    </ul>
  );
};
