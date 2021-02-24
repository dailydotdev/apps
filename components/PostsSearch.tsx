import styled from '@emotion/styled';
import SearchField from './fields/SearchField';
import React, { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const StyledSearch = styled(SearchField)`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  width: 100%;
`;

export default function PostsSearch(): ReactElement {
  const router = useRouter();
  const [initialQuery, setInitialQuery] = useState<string>();
  const [query, setQuery] = useState<string>();
  const [timeoutHandle, setTimeoutHandle] = useState<number>(null);

  useEffect(() => {
    if (!initialQuery) {
      setInitialQuery(router.query.q?.toString());
    }
  }, [router.query]);

  useEffect(() => {
    if (query && query !== router.query?.q) {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      setTimeoutHandle(
        window.setTimeout(
          () => router.replace({ pathname: '/search', query: { q: query } }),
          500,
        ),
      );
    }
  }, [query]);

  return (
    <StyledSearch
      className="compact"
      inputId="posts-search"
      autoFocus
      value={initialQuery}
      valueChanged={setQuery}
      onBlur={() => {
        if (!query?.length) {
          router.push('/');
        }
      }}
    />
  );
}
