import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { PostsSearchProps } from '@dailydotdev/shared/src/components/PostsSearch';
import PostsSearch from '@dailydotdev/shared/src/components/PostsSearch';
import { useRouter } from 'next/router';
import { ShellField } from '@dailydotdev/shared/src/components/shell/ShellField';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import {
  getSearchContentCurationQueryParam,
  getSearchPostTypesQueryParam,
  getSearchTimeQueryParam,
  SearchProviderEnum,
} from '@dailydotdev/shared/src/graphql/search';
import { useSearchContextProvider } from '@dailydotdev/shared/src/contexts/search/SearchContext';
import { useFeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';

export default function RouterPostsSearch(
  props: Omit<PostsSearchProps, 'onSubmitQuery'>,
): ReactElement {
  const router = useRouter();
  const isPhone = useViewSize(ViewSize.MobileL);
  const [draft, setDraft] = useState(router.query.q?.toString() ?? '');
  const { time, contentCurationFilter, postTypesFilter } =
    useSearchContextProvider();
  const { logEvent } = useLogContext();
  const { getFeatureValue } = useFeaturesReadyContext();

  const onSubmitQuery = (query: string): Promise<boolean> => {
    logEvent({
      event_name: LogEvent.SubmitSearch,
      extra: JSON.stringify({
        query,
        provider: SearchProviderEnum.Posts,
        search_version: getFeatureValue(feature.searchVersion),
        filters: {
          time,
          contentCuration: contentCurationFilter,
          postTypes: postTypesFilter,
        },
      }),
    });

    return router.replace({
      pathname: router?.pathname ? router?.pathname : '/search',
      query: {
        q: query,
        ...getSearchTimeQueryParam(time),
        ...getSearchContentCurationQueryParam(contentCurationFilter),
        ...getSearchPostTypesQueryParam(postTypesFilter),
      },
    });
  };

  const onClearQuery = () => {
    return router.replace({
      pathname: router?.pathname ? router?.pathname : '/search',
    });
  };

  if (isPhone) {
    const { placeholder } = props;

    return (
      <ShellField
        placeholder={placeholder ?? 'Search'}
        value={draft}
        onChange={(value) => {
          setDraft(value);
          if (!value && router.query.q) {
            onClearQuery();
          }
        }}
        onSubmit={(value) =>
          value.trim() ? onSubmitQuery(value.trim()) : onClearQuery()
        }
        onFocus={() => logEvent({ event_name: LogEvent.FocusSearch })}
      />
    );
  }

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
