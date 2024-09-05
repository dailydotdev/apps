import PostsSearch, {
  PostsSearchProps,
} from '@dailydotdev/shared/src/components/PostsSearch';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';

export default function RouterPostsSearch(
  props: Omit<PostsSearchProps, 'onSubmitQuery'>,
): ReactElement {
  const router = useRouter();
  const { logEvent } = useLogContext();

  const onSubmitQuery = (query: string): Promise<boolean> => {
    logEvent({
      event_name: LogEvent.SubmitSearch,
      extra: JSON.stringify({
        query,
        provider: SearchProviderEnum.Posts,
      }),
    });

    return router.replace({
      pathname: router?.pathname ? router?.pathname : '/search',
      query: { q: query },
    });
  };

  return (
    <PostsSearch
      {...props}
      initialQuery={router.query.q?.toString()}
      onSubmitQuery={onSubmitQuery}
      onFocus={() => {
        logEvent({ event_name: LogEvent.FocusSearch });
      }}
    />
  );
}
