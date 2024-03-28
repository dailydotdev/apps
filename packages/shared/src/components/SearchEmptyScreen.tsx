import React, { ReactElement } from 'react';
import { SearchIcon as MagnifyingIcon } from './icons';
import { IconSize } from './Icon';

export default function SearchEmptyScreen(): ReactElement {
  return (
    <div className="flex w-full max-w-[32rem] flex-col items-center gap-4 self-center px-6">
      <MagnifyingIcon className="text-text-disabled" size={IconSize.XXXLarge} />
      <h2 className="text-center typo-title2">No results found</h2>
      <p className="text-center text-text-secondary typo-callout">
        We cannot find the posts you are searching for. 🤷‍♀️
      </p>
    </div>
  );
}
