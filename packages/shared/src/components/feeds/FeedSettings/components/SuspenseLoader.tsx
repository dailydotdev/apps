import React, { ReactElement } from 'react';
import { Loader } from '../../../Loader';

export const SuspenseLoader = (): ReactElement => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Loader />
    </div>
  );
};
