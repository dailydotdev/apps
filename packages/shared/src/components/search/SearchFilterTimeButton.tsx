import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { VIcon } from '../icons';
import { useSearchContextProvider } from '../../contexts/search/SearchContext';
import { SearchTime } from '../../graphql/search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';

const SearchFilterTimeButton = () => {
  const { time, setTime } = useSearchContextProvider();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            aria-label="Open time filter menu"
          >
            {SearchTime[time]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.entries(SearchTime).map(([value, label]) => (
            <DropdownMenuItem
              key={label}
              onClick={() => setTime(value)}
              className={classNames(
                'flex',
                time === value
                  ? 'font-bold text-text-primary'
                  : 'text-text-tertiary',
              )}
            >
              {label}
              <div className="flex-1" />
              {time === value && <VIcon className="ml-2" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default SearchFilterTimeButton;
