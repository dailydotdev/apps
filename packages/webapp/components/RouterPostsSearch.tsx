import React, { ReactElement } from 'react';
import PostsSearch from '@dailydotdev/shared/src/components/PostsSearch';
import { useRouter } from 'next/router';

export type RouterPostsSearchProps = {
  suggestionType?: string;
};

export default function RouterPostsSearch({
  suggestionType,
}: RouterPostsSearchProps): ReactElement {
  const router = useRouter();

  const onSubmitQuery = (query: string): Promise<boolean> =>
    router.replace({
      pathname: router?.pathname ? router?.pathname : '/search',
      query: { q: query },
    });

  const closeSearch = () => {
    const redirectUrl = router?.pathname.replace('/search', '');
    router.push(redirectUrl);
  };

  return (
    <PostsSearch
      suggestionType={suggestionType}
      initialQuery={router.query.q?.toString()}
      onSubmitQuery={onSubmitQuery}
      closeSearch={closeSearch}
    />
  );
}
