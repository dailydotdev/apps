import React, { ReactElement } from 'react';
import MagnifyingIcon from './icons/Search';
import { EmptyScreenIcon } from './EmptyScreen';

export default function SearchEmptyScreen(): ReactElement {
  return (
    <div
      className="flex w-full flex-col self-center px-6"
      style={{ maxWidth: '32.5rem' }}
    >
      <MagnifyingIcon
        className="self-center text-theme-label-disabled"
        style={EmptyScreenIcon.style}
      />
      <h2 className="my-4 text-center typo-title1">No results found</h2>
      <p className="m-0 p-0 text-center text-theme-label-secondary typo-callout">
        We cannot find the posts you are searching for. 🤷‍♀️
      </p>
    </div>
  );
}
