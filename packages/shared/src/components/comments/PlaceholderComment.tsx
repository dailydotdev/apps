import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';

export default function PlaceholderComment(): ReactElement {
  const Text = classed(ElementPlaceholder, 'h-3 rounded-xl');

  return (
    <article aria-busy className="flex flex-col items-stretch mt-4">
      <div className="flex items-center mb-2">
        <ElementPlaceholder className="w-10 h-10 rounded-10" />
        <div className="flex flex-col justify-between flex-1 h-8 ml-2 ">
          <Text style={{ width: '40%' }} />
          <Text style={{ width: '20%' }} />
        </div>
      </div>
      <Text className="w-full py-4 my-2 rounded-full" />
    </article>
  );
}
