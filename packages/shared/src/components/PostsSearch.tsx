import { useAutoComplete } from '../hooks/useAutoComplete';
import { SearchField } from './fields/SearchField';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { SEARCH_POST_SUGGESTIONS } from '../graphql/search';

const AutoCompleteMenu = dynamic(() => import('./fields/AutoCompleteMenu'), {
  ssr: false,
});

export type PostsSearchProps = {
  initialQuery?: string;
  onSubmitQuery: (query: string) => Promise<unknown>;
  closeSearch: () => unknown;
};

export default function PostsSearch({
  initialQuery: initialQueryProp,
  onSubmitQuery,
  closeSearch,
}: PostsSearchProps): ReactElement {
  const searchBoxRef = useRef<HTMLDivElement>();
  const [initialQuery, setInitialQuery] = useState<string>();
  const [query, setQuery] = useState<string>();
  const timeoutHandleRef = useRef<number>();
  const [menuPosition, setMenuPosition] =
    useState<{
      x: number;
      y: number;
      width: number;
    }>(null);
  const [items, setItems] = useState<string[]>([]);

  const { data: searchResults, isLoading } = useQuery<{
    searchPostSuggestions: { hits: { title: string }[] };
  }>(
    ['searchPostSuggestions', query],
    () => request(`${apiUrl}/graphql`, SEARCH_POST_SUGGESTIONS, { query }),
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
      if (!items?.length && searchResults?.searchPostSuggestions?.hits.length) {
        showSuggestions();
      }
      setItems(
        searchResults?.searchPostSuggestions?.hits.map((hit) => hit.title) ??
          [],
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

  const onValueChanged = (value: string) => {
    if (!value.length) {
      hideMenu();
      setQuery('');
      return;
    }

    if (value && value !== initialQueryProp) {
      if (timeoutHandleRef.current) {
        clearTimeout(timeoutHandleRef.current);
      }
      timeoutHandleRef.current = window.setTimeout(() => setQuery(value), 100);
    }
  };

  useEffect(() => {
    searchBoxRef.current?.querySelector('input').focus();
  }, [searchBoxRef]);

  const isOpen = !!menuPosition && !!items.length;
  return (
    <>
      <SearchField
        className="compact absolute left-0 right-0 top-0 w-full"
        inputId="posts-search"
        ref={searchBoxRef}
        value={initialQuery}
        valueChanged={onValueChanged}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (!query?.length) {
            closeSearch();
          } else {
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
