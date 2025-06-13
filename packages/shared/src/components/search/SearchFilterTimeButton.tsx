import React from 'react';
import { Item } from '@dailydotdev/react-contexify';
import ContextMenu from '../fields/ContextMenu';
import useContextMenu from '../../hooks/useContextMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { VIcon } from '../icons';
import { TIME_OPTIONS } from './common';
import { useSearchContextProvider } from '../../contexts/search/SearchContext';

const SEARCH_FILTER_TIME_CONTEXT_ID = 'search-filter-time-context';

const SearchFilterTimeButton = () => {
  const { onMenuClick, isOpen, onHide } = useContextMenu({
    id: SEARCH_FILTER_TIME_CONTEXT_ID,
  });
  const { time, setTime } = useSearchContextProvider();

  const options = TIME_OPTIONS.map((label) => ({
    label,
    Wrapper: () => (
      <Item
        onClick={() => setTime(label)}
        className={`flex cursor-pointer items-center justify-between px-3 py-2 ${
          time === label ? 'font-bold text-text-primary' : 'text-text-tertiary'
        }`}
      >
        <span>{label}</span>
        {time === label && <VIcon className="ml-2" />}
      </Item>
    ),
  }));

  return (
    <>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        aria-label="Open time filter menu"
        onClick={onMenuClick}
      >
        {time}
      </Button>
      <ContextMenu
        id={SEARCH_FILTER_TIME_CONTEXT_ID}
        options={options}
        isOpen={isOpen}
        onHidden={onHide}
      />
    </>
  );
};

export default SearchFilterTimeButton;
