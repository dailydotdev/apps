import type { HTMLAttributes, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import { SearchField } from './fields/SearchField';
import { useAutoComplete } from '../hooks/useAutoComplete';
import useDebounceFn from '../hooks/useDebounceFn';
import {
  SEARCH_POST_SUGGESTIONS,
  sanitizeSearchTitleMatch,
} from '../graphql/search';
import { SEARCH_BOOKMARKS_SUGGESTIONS } from '../graphql/feed';
import { SEARCH_READING_HISTORY_SUGGESTIONS } from '../graphql/users';
import { gqlClient } from '../graphql/common';
import { useConditionalFeature } from '../hooks';
import { feature } from '../lib/featureManagement';
import { useSearchContextProvider } from '../contexts/search/SearchContext';
import { useDomPurify } from '../hooks/useDomPurify';
import type { PopoverContentProps } from './popover/Popover';
import { PopoverContent } from './popover/Popover';
import { SearchIcon } from './icons';
import { StaleTime } from '../lib/query';

export type PostsSearchProps = {
  initialQuery?: string;
  placeholder?: string;
  suggestionType?: string;
  autoFocus?: boolean;
  className?: string;
  onSubmitQuery: (
    query: string,
    extraFlags?: {
      filters?: { time?: string; contentCuration: string[] };
    },
  ) => Promise<unknown>;
  onClearQuery?: () => Promise<unknown>;
} & Pick<HTMLAttributes<HTMLInputElement>, 'onFocus'>;

const SEARCH_TYPES = {
  searchPostSuggestions: SEARCH_POST_SUGGESTIONS,
  searchBookmarksSuggestions: SEARCH_BOOKMARKS_SUGGESTIONS,
  searchReadingHistorySuggestions: SEARCH_READING_HISTORY_SUGGESTIONS,
};

export default function PostsSearch({
  initialQuery: initialQueryProp,
  autoFocus = true,
  placeholder,
  onSubmitQuery,
  className,
  suggestionType = 'searchPostSuggestions',
  onFocus,
  onClearQuery,
}: PostsSearchProps): ReactElement {
  const { time, contentCurationFilter } = useSearchContextProvider();
  const searchBoxRef = useRef<HTMLDivElement>();
  const [query, setQuery] = useState<string>();
  const [items, setItems] = useState<string[]>([]);
  const { value: searchVersion } = useConditionalFeature({
    feature: feature.searchVersion,
    shouldEvaluate: !!query && suggestionType === 'searchPostSuggestions',
  });
  const SEARCH_URL = SEARCH_TYPES[suggestionType];
  const purify = useDomPurify();
  const [isFocused, setIsFocused] = useState(false);
  const initialQuery = useRef<string>(initialQueryProp || '');

  const { data: searchResults, isPending } = useQuery<{
    [suggestionType: string]: { hits: { title: string }[] };
  }>({
    queryKey: [suggestionType, query],
    queryFn: () =>
      gqlClient.request(SEARCH_URL, { query, version: searchVersion }),
    enabled: !!query,
    staleTime: StaleTime.Default,
  });

  useEffect(() => {
    if (!isPending) {
      setItems(
        searchResults?.[suggestionType]?.hits.map((hit) =>
          purify?.sanitize?.(hit.title),
        ) ?? [],
      );
    }
  }, [searchResults, isPending, suggestionType, purify]);

  const submitQuery = async (item?: string) => {
    const itemQuery = item?.replace?.(sanitizeSearchTitleMatch, '');
    await onSubmitQuery(itemQuery || query, {
      filters: {
        time: time.toString(),
        contentCuration: contentCurationFilter,
      },
    });
    if (itemQuery) {
      initialQuery.current = itemQuery;
    }

    setIsFocused(false);
  };

  const { selectedItemIndex, onKeyDown } = useAutoComplete(items, submitQuery);
  const [debounceQuery] = useDebounceFn<string>(
    (value) => setQuery(value),
    100,
  );
  const onValueChanged = (value: string) => {
    if (!value.length) {
      setQuery('');
      initialQuery.current = '';
      onClearQuery?.();
      setIsFocused(false);
      return;
    }

    if (value && value !== initialQueryProp) {
      debounceQuery(value);
    }

    if (value !== initialQuery.current) {
      setIsFocused(true);
    }
  };

  useEffect(() => {
    if (autoFocus) {
      searchBoxRef.current?.querySelector('input').focus();
    }
  }, [searchBoxRef, autoFocus]);

  const handlePopoverClose: PopoverContentProps['onInteractOutside'] = (e) => {
    if (searchBoxRef.current.contains(e.target as Node)) {
      e.preventDefault();
      return;
    }

    // Click or focus is outside the popover, close it
    setIsFocused(false);
  };

  const isOpen = isFocused && items?.length > 0;
  return (
    <>
      <Popover open={isOpen}>
        <PopoverAnchor asChild>
          <SearchField
            className={classNames('compact flex-1', className)}
            inputId="posts-search"
            fieldSize="medium"
            placeholder={placeholder ?? 'Find posts'}
            ref={searchBoxRef}
            value={initialQuery.current}
            valueChanged={onValueChanged}
            onKeyDown={(e) => {
              if (
                !isFocused &&
                (e.key === 'ArrowDown' || e.key === 'ArrowUp')
              ) {
                setIsFocused(true);
              }
              onKeyDown(e);
            }}
            onFocus={(event) => {
              onFocus?.(event);
              setIsFocused(true);
            }}
            aria-haspopup="true"
            aria-expanded={isOpen}
          />
        </PopoverAnchor>
        <PopoverContent
          className="rounded-12 border border-border-subtlest-tertiary bg-background-popover py-1 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
          side="bottom"
          align="start"
          avoidCollisions
          sameWidthAsAnchor
          onOpenAutoFocus={(e) => e.preventDefault()} // keep focus in input
          onCloseAutoFocus={(e) => e.preventDefault()} // avoid refocus jumps
          onPointerDownOutside={handlePopoverClose}
          onInteractOutside={handlePopoverClose}
        >
          {items.map((item, index) => {
            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div
                className={classNames(
                  'flex h-8 items-center gap-1 truncate px-3 typo-footnote hover:cursor-pointer hover:bg-surface-hover',
                  { 'bg-surface-hover': index === selectedItemIndex },
                )}
                key={item}
                onClick={() => {
                  setIsFocused(false);
                  submitQuery(item);
                }}
              >
                <SearchIcon />
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </div>
            );
          })}
        </PopoverContent>
      </Popover>
    </>
  );
}
