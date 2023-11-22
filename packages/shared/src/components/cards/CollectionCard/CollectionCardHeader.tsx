import React, { ReactElement } from 'react';
import Pill from '../../Pill';

export const CollectionCardHeader = (): ReactElement => {
  // TODO: replace this with the actual query to retrieve related sources

  return (
    <div className="flex relative flex-row gap-2 m-2 mb-3">
      <div className="relative">
        <Pill label="Collection" className="text-theme-color-cabbage" />
      </div>
    </div>
  );
};
