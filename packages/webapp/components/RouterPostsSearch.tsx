import React, { ReactElement } from 'react';
import PostsSearch from '@dailydotdev/shared/src/components/PostsSearch';
import { useRouter } from 'next/router';

export default function RouterPostsSearch(): ReactElement {
  const router = useRouter();

  const onSubmitQuery = (query: string): Promise<boolean> =>
    router.replace({
      pathname: '/search',
      query: { q: query },
    });

  const closeSearch = () => router.push('/');

  return (
    <PostsSearch
      initialQuery={router.query.q?.toString()}
      onSubmitQuery={onSubmitQuery}
      closeSearch={closeSearch}
    />
  );
}
