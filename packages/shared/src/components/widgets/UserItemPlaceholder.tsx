import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { TextPlaceholder } from './common';

const imageClassName = 'w-7 h-7 rounded-full mt-1';
const textContainerClassName = 'flex flex-col ml-3 mr-2 flex-1';

export const UserItemPlaceholder = (): ReactElement => (
  <article aria-busy className="relative flex items-start py-2 pl-4 pr-2">
    <ElementPlaceholder className={imageClassName} />
    <div className={textContainerClassName}>
      <TextPlaceholder className="w-4/5" />
      <TextPlaceholder className="w-4/5" />
      <TextPlaceholder className="w-2/5" />
    </div>
  </article>
);
