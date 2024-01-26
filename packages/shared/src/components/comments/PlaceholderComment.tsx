import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';

export default function PlaceholderComment(): ReactElement {
  return (
    <article aria-busy className="mt-4 flex flex-col items-stretch">
      <div className="mb-2 flex items-center">
        <ElementPlaceholder className="h-10 w-10 rounded-10" />
        <div className="ml-2 flex h-8 flex-1 flex-col justify-between">
          <ElementPlaceholder className="h-3 w-2/5 rounded-xl" />
          <ElementPlaceholder className="h-3 w-1/5 rounded-xl" />
        </div>
      </div>
      <ElementPlaceholder className="my-2 h-8 w-full rounded-full" />
    </article>
  );
}
