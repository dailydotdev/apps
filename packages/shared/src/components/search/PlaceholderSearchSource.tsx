import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';

export const PlaceholderSearchSource = (): ReactElement => {
  return (
    <article
      aria-busy
      className="flex w-60 flex-col items-stretch laptop:w-full"
    >
      <div className="mb-2 flex items-center">
        <ElementPlaceholder className="mr-2 h-6 w-6 rounded-6" />
        <ElementPlaceholder className="h-4 flex-1 rounded-12" />
      </div>
      <ElementPlaceholder className="my-2 h-4 w-4/5 rounded-full" />
      <ElementPlaceholder className="my-2 h-4 w-3/5 rounded-full" />
    </article>
  );
};
