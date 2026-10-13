import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { BodyTextPlaceholder, TextPlaceholder } from './common';

const imageClassName = 'size-8 rounded-12 mt-1';
const textContainerClassName = 'flex flex-col gap-1 ml-3 mr-2 flex-1';

export const UserItemPlaceholder = (): ReactElement => (
  <article aria-busy className="relative flex items-start py-2 pl-4 pr-2">
    <ElementPlaceholder className={imageClassName} />
    <div className={textContainerClassName}>
      <BodyTextPlaceholder className="w-3/5" />
      <TextPlaceholder className="w-2/5" />
    </div>
  </article>
);
