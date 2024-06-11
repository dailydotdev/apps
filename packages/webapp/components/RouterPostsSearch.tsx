import React, { ReactElement } from 'react';
import PostsSearch, {
  PostsSearchProps,
} from '@dailydotdev/shared/src/components/PostsSearch';
import { useRouter } from 'next/router';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogsEvent } from '@dailydotdev/shared/src/lib/logs';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';

export default function RouterPostsSearch(
  props: Omit<PostsSearchProps, 'onSubmitQuery'>,
): ReactElement {
  const router = useRouter();
  const { trackEvent } = useLogContext();

  const onSubmitQuery = (query: string): Promise<boolean> => {
    trackEvent({
      event_name: LogsEvent.SubmitSearch,
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
        trackEvent({ event_name: LogsEvent.FocusSearch });
      }}
    />
  );
}
