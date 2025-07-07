import type { ReactElement } from 'react';
import React from 'react';
import type { PostsSearchProps } from '@dailydotdev/shared/src/components/PostsSearch';
import PostsSearch from '@dailydotdev/shared/src/components/PostsSearch';
import { useRouter } from 'next/router';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';
import { useSearchContextProvider } from '@dailydotdev/shared/src/contexts/search/SearchContext';

export default function RouterPostsSearch(
  props: Omit<PostsSearchProps, 'onSubmitQuery'>,
): ReactElement {
  const router = useRouter();
  const { time, contentCurationFilter } = useSearchContextProvider();
  const { logEvent } = useLogContext();

  const onSubmitQuery = (query: string): Promise<boolean> => {
    logEvent({
      event_name: LogEvent.SubmitSearch,
      extra: JSON.stringify({
        query,
        provider: SearchProviderEnum.Posts,
        filters: { time, contentCuration: contentCurationFilter },
      }),
    });

    return router.replace({
      pathname: router?.pathname ? router?.pathname : '/search',
      query: { q: query },
    });
  };

  const onClearQuery = () => {
    return router.replace({
      pathname: router?.pathname ? router?.pathname : '/search',
    });
  };

  return (
    <PostsSearch
      {...props}
      initialQuery={router.query.q?.toString()}
      onSubmitQuery={onSubmitQuery}
      onClearQuery={onClearQuery}
      onFocus={() => {
        logEvent({ event_name: LogEvent.FocusSearch });
      }}
    />
  );
}
