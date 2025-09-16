import React, { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { PopoverContentProps } from '@radix-ui/react-popover';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { TextField } from '../../../components/fields/TextField';
import { SearchIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { TagElement } from '../../../components/feeds/FeedSettings/TagElement';
import { PopoverContent } from '../../../components/popover/Popover';
import { gqlClient } from '../../../graphql/common';
import { StaleTime } from '../../../lib/query';
import useDebounceFn from '../../../hooks/useDebounceFn';
import { GenericLoaderSpinner } from '../../../components/utilities/loaders';

type Keyword = {
  keyword: string;
};

export const AUTOCOMPLETE_KEYWORDS_QUERY = gql`
  query AutocompleteKeywords($query: String!, $limit: Int) {
    autocompleteKeywords(query: $query, limit: $limit) {
      keyword
      title
    }
  }
`;

export const KeywordSelection = ({
  keywords,
}: {
  keywords: Array<Keyword>;
}): ReactElement => {
  const [query, setQuery] = useState<string>('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data: autocompleteKeywords, isFetching } = useQuery({
    queryKey: ['opportunity-keywords-autocomplete', query],
    queryFn: async () => {
      const res = await gqlClient.request<{
        autocompleteKeywords: Array<{
          keyword: string;
          title?: string;
        }>;
      }>(AUTOCOMPLETE_KEYWORDS_QUERY, {
        query,
        limit: 10,
      });
      return res.autocompleteKeywords as Array<Keyword>;
    },
    staleTime: StaleTime.Default,
    enabled: query.length === 0 || query.length >= 2,
    placeholderData: keepPreviousData,
  });

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
          side="bottom"
          align="start"
          avoidCollisions
          onOpenAutoFocus={(e) => e.preventDefault()} // keep focus in input
          onCloseAutoFocus={(e) => e.preventDefault()} // avoid refocus jumps
          onPointerDownOutside={handlePopoverClose}
          onInteractOutside={handlePopoverClose}
          className="w-full rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
        >
          <div className="flex flex-wrap gap-2">
            {autocompleteKeywords?.map(({ keyword }) => (
              <TagElement
                key={keyword}
                tag={{ name: keyword }}
                isSelected={keywords?.some((k) => k.keyword === keyword)}
                onClick={(data) => {
                  console.log('Clicked', data);
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {keywords?.map(({ keyword }) => (
          <TagElement
            key={keyword}
            tag={{ name: keyword }}
            isSelected
            onClick={(data) => {
              console.log('Clicked', data);
            }}
          />
        ))}
      </div>
    </div>
  );
};
