import React, { ReactElement } from 'react';
import PostsSearch, {
  PostsSearchProps,
} from '@dailydotdev/shared/src/components/PostsSearch';
import { useRouter } from 'next/router';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';

export default function RouterPostsSearch(
  props: Omit<PostsSearchProps, 'onSubmitQuery'>,
): ReactElement {
  const router = useRouter();
  const { trackEvent } = useAnalyticsContext();

  const onSubmitQuery = (query: string): Promise<boolean> => {
    trackEvent({
      event_name: AnalyticsEvent.SubmitSearch,
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
        trackEvent({ event_name: AnalyticsEvent.FocusSearch });
      }}
    />
  );
}
