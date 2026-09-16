import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { FilterIcon } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { SearchFilterPostTypeList } from './SearchFilterOptions';

const SearchFilterPostTypeButton = (): ReactElement => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Float}
          icon={<FilterIcon />}
          size={ButtonSize.Small}
          aria-label="Open content type filter menu"
        >
          Type
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="!h-auto !bg-background-subtle">
          <div
            tabIndex={-1}
            role="menuitem"
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <SearchFilterPostTypeList />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SearchFilterPostTypeButton;
