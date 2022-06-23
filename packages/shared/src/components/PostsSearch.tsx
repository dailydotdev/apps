import React, { ReactElement, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { SearchField } from './fields/SearchField';
import { useAutoComplete } from '../hooks/useAutoComplete';
import { apiUrl } from '../lib/config';
import useDebounce from '../hooks/useDebounce';
import { SEARCH_POST_SUGGESTIONS } from '../graphql/search';
import { SEARCH_BOOKMARKS_SUGGESTIONS } from '../graphql/feed';
import { SEARCH_READING_HISTORY_SUGGESTIONS } from '../graphql/users';

const AutoCompleteMenu = dynamic(() => import('./fields/AutoCompleteMenu'), {
  ssr: false,
});

export type PostsSearchProps = {
  initialQuery?: string;
  placeholder?: string;
  suggestionType?: string;
  autoFocus?: boolean;
  onSubmitQuery: (query: string) => Promise<unknown>;
};

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
  suggestionType = 'searchPostSuggestions',
}: PostsSearchProps): ReactElement {
  const searchBoxRef = useRef<HTMLDivElement>();
  const [initialQuery, setInitialQuery] = useState<string>();
  const [query, setQuery] = useState<string>();
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
    width: number;
  }>(null);
  const [items, setItems] = useState<string[]>([]);
  const SEARCH_URL = SEARCH_TYPES[suggestionType];

  const { data: searchResults, isLoading } = useQuery<{
    [suggestionType: string]: { hits: { title: string }[] };
  }>(
    [suggestionType, query],
    () => request(`${apiUrl}/graphql`, SEARCH_URL, { query }),
    {
      enabled: !!query,
    },
  );

  useEffect(() => {
    if (!initialQuery) {
      setInitialQuery(initialQueryProp);
    }
  }, [initialQueryProp]);

  const hideMenu = () => setMenuPosition(null);

  const showSuggestions = () => {
    if (menuPosition) {
      return;
    }
    const { left, bottom, width } =
      searchBoxRef.current.getBoundingClientRect();
    setMenuPosition({ x: left, y: bottom + window.scrollY, width });
  };

  useEffect(() => {
    if (!isLoading) {
      if (!items?.length && searchResults?.[suggestionType]?.hits.length) {
        showSuggestions();
      }
      setItems(
        searchResults?.[suggestionType]?.hits.map((hit) => hit.title) ?? [],
      );
    }
  }, [searchResults, isLoading]);

  const submitQuery = async (item?: string) => {
    const itemQuery = item?.replace?.(/<(\/?)strong>/g, '');
    await onSubmitQuery(itemQuery || query);
    if (itemQuery) {
      setInitialQuery(itemQuery);
    }
    hideMenu();
  };

  const { selectedItemIndex, onKeyDown } = useAutoComplete(items, submitQuery);
  const [debounceQuery] = useDebounce<string>((value) => setQuery(value), 100);
  const onValueChanged = (value: string) => {
    if (!value.length) {
      hideMenu();
      setQuery('');
      return;
    }

    if (value && value !== initialQueryProp) {
      debounceQuery(value);
    }

    if (menuPosition === null) {
      showSuggestions();
    }
  };

  useEffect(() => {
    if (autoFocus) {
      searchBoxRef.current?.querySelector('input').focus();
    }
  }, [searchBoxRef, autoFocus]);

  const isOpen = !!menuPosition && !!items.length;
  return (
    <>
      <SearchField
        className="flex-1 compact"
        inputId="posts-search"
        fieldSize="medium"
        placeholder={placeholder}
        ref={searchBoxRef}
        value={initialQuery}
        valueChanged={onValueChanged}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (query?.length) {
            hideMenu();
          }
        }}
        onFocus={() => items?.length && showSuggestions()}
        aria-haspopup="true"
        aria-expanded={isOpen}
      />
      <AutoCompleteMenu
        placement={menuPosition}
        items={items}
        focusedItemIndex={selectedItemIndex}
        onItemClick={submitQuery}
        isOpen={isOpen}
      />
    </>
  );
}
