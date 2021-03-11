import SearchField from './fields/SearchField';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import useAutoComplete from './fields/useAutoComplete';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { SEARCH_POST_SUGGESTIONS } from '../graphql/search';

const AutoCompleteMenu = dynamic(() => import('./fields/AutoCompleteMenu'), {
  ssr: false,
});

export default function PostsSearch(): ReactElement {
  const router = useRouter();
  const searchBoxRef = useRef<HTMLDivElement>();
  const [initialQuery, setInitialQuery] = useState<string>();
  const [query, setQuery] = useState<string>();
  const timeoutHandleRef = useRef<number>();
  const [menuPosition, setMenuPosition] = useState<{
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
      setInitialQuery(router.query.q?.toString());
    }
  }, [router.query]);

  const hideMenu = () => setMenuPosition(null);

  const showSuggestions = () => {
    if (menuPosition) {
      return;
    }
    const {
      left,
      bottom,
      width,
    } = searchBoxRef.current.getBoundingClientRect();
    setMenuPosition({ x: left, y: bottom, width });
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
    await router.replace({
      pathname: '/search',
      query: { q: itemQuery || query },
    });
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

    if (value && value !== router.query?.q) {
      if (timeoutHandleRef.current) {
        clearTimeout(timeoutHandleRef.current);
      }
      timeoutHandleRef.current = window.setTimeout(() => setQuery(value), 100);
    }
  };

  const isOpen = !!menuPosition && !!items.length;
  return (
    <>
      <SearchField
        className="compact absolute left-0 right-0 top-0 w-full"
        inputId="posts-search"
        ref={searchBoxRef}
        autoFocus
        value={initialQuery}
        valueChanged={onValueChanged}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (!query?.length) {
            router.push('/');
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
