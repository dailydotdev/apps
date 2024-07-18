import React, {
  HTMLAttributes,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { SearchField } from './fields/SearchField';
import { useAutoComplete } from '../hooks/useAutoComplete';
import useDebounce from '../hooks/useDebounce';
import {
  SEARCH_POST_SUGGESTIONS,
  sanitizeSearchTitleMatch,
} from '../graphql/search';
import { SEARCH_BOOKMARKS_SUGGESTIONS } from '../graphql/feed';
import { SEARCH_READING_HISTORY_SUGGESTIONS } from '../graphql/users';
import { gqlClient } from '../graphql/common';
import { useConditionalFeature } from '../hooks';
import { feature } from '../lib/featureManagement';

const AutoCompleteMenu = dynamic(
  () =>
    import(
      /* webpackChunkName: "autoCompleteMenu" */ './fields/AutoCompleteMenu'
    ),
  {
    ssr: false,
  },
);

export type PostsSearchProps = {
  initialQuery?: string;
  placeholder?: string;
  suggestionType?: string;
  autoFocus?: boolean;
  className?: string;
  onSubmitQuery: (query: string) => Promise<unknown>;
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
  const { value: searchVersion } = useConditionalFeature({
    feature: feature.searchVersion,
    shouldEvaluate: !!query && suggestionType === 'searchPostSuggestions',
  });
  const SEARCH_URL = SEARCH_TYPES[suggestionType];

  const { data: searchResults, isLoading } = useQuery<{
    [suggestionType: string]: { hits: { title: string }[] };
  }>(
    [suggestionType, query],
    () => gqlClient.request(SEARCH_URL, { query, version: searchVersion }),
    {
      enabled: !!query,
    },
  );

  useEffect(() => {
    if (!initialQuery) {
      setInitialQuery(initialQueryProp);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, isLoading]);

  const submitQuery = async (item?: string) => {
    const itemQuery = item?.replace?.(sanitizeSearchTitleMatch, '');
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
        className={classNames('compact flex-1', className)}
        inputId="posts-search"
        fieldSize="medium"
        placeholder={placeholder ?? 'Find posts'}
        ref={searchBoxRef}
        value={initialQuery}
        valueChanged={onValueChanged}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (query?.length) {
            hideMenu();
          }
        }}
        onFocus={(event) => {
          onFocus?.(event);

          if (items?.length) {
            showSuggestions();
          }
        }}
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
