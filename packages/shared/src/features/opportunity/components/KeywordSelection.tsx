import React, { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { PopoverContentProps } from '@radix-ui/react-popover';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import type { DefaultError, UseMutateFunction } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { TextField } from '../../../components/fields/TextField';
import { SearchIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { TagElement } from '../../../components/feeds/FeedSettings/TagElement';
import { PopoverContent } from '../../../components/popover/Popover';
import useDebounceFn from '../../../hooks/useDebounceFn';
import { GenericLoaderSpinner } from '../../../components/utilities/loaders';
import type { Keyword } from '../types';
import { getKeywordAutocompleteOptions } from '../queries';

import type { EmptyResponse } from '../../../graphql/emptyResponse';

export type KeywordSelectionProps = {
  keywords?: Array<Keyword>;
  addKeyword: UseMutateFunction<EmptyResponse, DefaultError, Keyword>;
  removeKeyword: UseMutateFunction<EmptyResponse, DefaultError, Keyword>;
};

export const KeywordSelection = ({
  keywords,
  addKeyword,
  removeKeyword,
}: KeywordSelectionProps): ReactElement => {
  const [query, setQuery] = useState<string>('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data: autocompleteKeywords, isFetching } = useQuery(
    getKeywordAutocompleteOptions(query),
  );

  const [debouncedQuery] = useDebounceFn<string>((data) => setQuery(data), 300);

  const handlePopoverClose: PopoverContentProps['onInteractOutside'] = (e) => {
    if (e.target === inputRef.current) {
      e.preventDefault();
      return;
    }

    // Click or focus is outside the popover, close it
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Popover open={open && autocompleteKeywords?.length > 0}>
        <PopoverAnchor asChild>
          <TextField
            inputRef={(ref) => {
              inputRef.current = ref;
            }}
            inputId="keywords"
            label="Search tags"
            leftIcon={<SearchIcon size={IconSize.Small} />}
            rightIcon={
              isFetching && <GenericLoaderSpinner size={IconSize.Small} />
            }
            value={query}
            onChange={({ target }) => {
              if (target.value === '') {
                return setQuery('');
              }

              return debouncedQuery(target.value);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen((prev) => !prev);
                return;
              }

              if (!open) {
                setOpen(true);
              }
            }}
          />
        </PopoverAnchor>

        <PopoverContent
          side="top"
          align="start"
          avoidCollisions
          sameWidthAsAnchor
          onOpenAutoFocus={(e) => e.preventDefault()} // keep focus in input
          onCloseAutoFocus={(e) => e.preventDefault()} // avoid refocus jumps
          onPointerDownOutside={handlePopoverClose}
          onInteractOutside={handlePopoverClose}
          className="rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
        >
          <div className="flex flex-wrap gap-2">
            {autocompleteKeywords?.map(({ keyword }) => {
              const isSelected = keywords?.some((k) => k.keyword === keyword);
              return (
                <TagElement
                  key={keyword}
                  tag={{ name: keyword }}
                  isSelected={isSelected}
                  onClick={({ tag }) => {
                    if (isSelected) {
                      removeKeyword({ keyword: tag.name });
                    } else {
                      addKeyword({ keyword: tag.name });
                    }
                  }}
                />
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {Array.from(keywords).map(({ keyword }) => (
          <TagElement
            key={keyword}
            tag={{ name: keyword }}
            isSelected
            onClick={({ tag }) => {
              removeKeyword({ keyword: tag.name });
            }}
          />
        ))}
      </div>
    </div>
  );
};
