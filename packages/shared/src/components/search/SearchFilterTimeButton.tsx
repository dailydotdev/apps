import React from 'react';
import { Item } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import ContextMenu from '../fields/ContextMenu';
import useContextMenu from '../../hooks/useContextMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { VIcon } from '../icons';
import { useSearchContextProvider } from '../../contexts/search/SearchContext';
import { SearchTime } from '../../graphql/search';

const SEARCH_FILTER_TIME_CONTEXT_ID = 'search-filter-time-context';

const SearchFilterTimeButton = () => {
  const { onMenuClick, isOpen, onHide } = useContextMenu({
    id: SEARCH_FILTER_TIME_CONTEXT_ID,
  });
  const { time, setTime } = useSearchContextProvider();

  const options = Object.entries(SearchTime).map(([value, label]) => ({
    label,
    Wrapper: () => (
      <Item
        onClick={() => setTime(value)}
        className={classNames(
          'flex cursor-pointer items-center justify-between px-3 py-2',
          time === label ? 'font-bold text-text-primary' : 'text-text-tertiary',
        )}
      >
        <span>{label}</span>
        {time === value && <VIcon className="ml-2" />}
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
        {SearchTime[time]}
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
