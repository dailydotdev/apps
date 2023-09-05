import React, { ReactElement } from 'react';
import PostsSearch, {
  PostsSearchProps,
} from '@dailydotdev/shared/src/components/PostsSearch';
import { useRouter } from 'next/router';

export default function RouterPostsSearch(
  props: Omit<PostsSearchProps, 'onSubmitQuery'>,
): ReactElement {
  const router = useRouter();

  const onSubmitQuery = (query: string): Promise<boolean> =>
    router.replace({
      pathname: router?.pathname ? router?.pathname : '/search',
      query: { q: query },
    });

  return (
    <PostsSearch
      {...props}
      initialQuery={router.query.q?.toString()}
      onSubmitQuery={onSubmitQuery}
    />
  );
}
