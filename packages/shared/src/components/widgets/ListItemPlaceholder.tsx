import React, { ReactElement } from 'react';
import { TextPlaceholder } from './common';

export const ListItemPlaceholder = (): ReactElement => (
  <article aria-busy className="flex relative flex-col items-start py-3 px-4">
    <TextPlaceholder className="w-4/5" />
    <TextPlaceholder className="w-4/5" />
    <TextPlaceholder className="w-2/5" />
  </article>
);
