import React, { ReactElement } from 'react';
import MagnifyingIcon from '@dailydotdev/shared/icons/magnifying.svg';

export default function SearchEmptyScreen(): ReactElement {
  return (
    <div
      className="flex flex-col w-full self-center px-6"
      style={{ maxWidth: '32.5rem' }}
    >
      <MagnifyingIcon
        className="self-center text-theme-label-disabled"
        style={{ fontSize: '5rem' }}
      />
      <h2 className="my-4 text-center typo-title1">No results found</h2>
      <p className="m-0 p-0 text-theme-label-secondary text-center typo-callout">
        We cannot find the articles you are searching for. 🤷‍♀️
      </p>
    </div>
  );
}
