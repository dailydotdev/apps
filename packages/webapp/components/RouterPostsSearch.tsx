import React, { ReactElement } from 'react';
import PostsSearch from '@dailydotdev/shared/src/components/PostsSearch';
import { useRouter } from 'next/router';

export type RouterPostsSearchProps = {
  suggestionType?: string;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function RouterPostsSearch({
  suggestionType,
  placeholder,
  autoFocus,
}: RouterPostsSearchProps): ReactElement {
  const router = useRouter();

  const onSubmitQuery = (query: string): Promise<boolean> =>
    router.replace({
      pathname: router?.pathname ? router?.pathname : '/search',
      query: { q: query },
    });

  return (
    <PostsSearch
      suggestionType={suggestionType}
      placeholder={placeholder}
      initialQuery={router.query.q?.toString()}
      onSubmitQuery={onSubmitQuery}
      autoFocus={autoFocus}
    />
  );
}
