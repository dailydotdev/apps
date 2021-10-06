import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';

export default function PlaceholderComment(): ReactElement {
  return (
    <article aria-busy className="flex flex-col items-stretch mt-4">
      <div className="flex items-center mb-2">
        <ElementPlaceholder className="w-10 h-10 rounded-10" />
        <div className="flex flex-col flex-1 justify-between ml-2 h-8">
          <ElementPlaceholder className="w-2/5 h-3 rounded-xl" />
          <ElementPlaceholder className="w-1/5 h-3 rounded-xl" />
        </div>
      </div>
      <ElementPlaceholder className="my-2 w-full h-8 rounded-full" />
    </article>
  );
}
