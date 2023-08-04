import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';

export const PlaceholderSearchSource = (): ReactElement => {
  return (
    <article
      aria-busy
      className="flex flex-col items-stretch w-60 laptop:w-full"
    >
      <div className="flex items-center mb-2">
        <ElementPlaceholder className="mr-2 w-6 h-6 rounded-6" />
        <ElementPlaceholder className="flex-1 h-4 rounded-xl" />
      </div>
      <ElementPlaceholder className="my-2 w-4/5 h-4 rounded-full" />
      <ElementPlaceholder className="my-2 w-3/5 h-4 rounded-full" />
    </article>
  );
};
