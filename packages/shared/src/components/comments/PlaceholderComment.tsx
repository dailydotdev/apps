import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';

export default function PlaceholderComment(): ReactElement {
  return (
    <article aria-busy className="flex flex-col items-stretch mt-4">
      <div className="flex items-center mb-2">
        <ElementPlaceholder className="w-10 h-10 rounded-10" />
        <div className="flex flex-col justify-between flex-1 h-8 ml-2 ">
          <ElementPlaceholder className="w-2/5 h-3 rounded-xl" />
          <ElementPlaceholder className="w-1/5 h-3 rounded-xl" />
        </div>
      </div>
      <ElementPlaceholder className="w-full h-8 my-2 rounded-full" />
    </article>
  );
}
