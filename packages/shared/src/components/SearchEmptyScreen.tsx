import React, { ReactElement } from 'react';
import MagnifyingIcon from '../../icons/magnifying.svg';
import EmptyScreen from './EmptyScreen';

export default function SearchEmptyScreen(): ReactElement {
  return (
    <EmptyScreen
      icon={MagnifyingIcon}
      title="No results found."
      description="We cannot find the articles you are searching for. 🤷‍♀️"
    />
  );
}
