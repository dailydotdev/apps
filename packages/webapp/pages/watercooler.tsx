import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { NextSeoProps } from 'next-seo';
import dynamic from 'next/dynamic';
import Feed from '@dailydotdev/shared/src/components/Feed';
import {
  SOURCE_FEED_QUERY,
  supportedTypesForPrivateSources,
} from '@dailydotdev/shared/src/graphql/feed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useSquad } from '@dailydotdev/shared/src/hooks/squads/useSquad';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { watercoolerSquadId } from '@dailydotdev/shared/src/lib/constants';
import { FeedPageLayoutList } from '@dailydotdev/shared/src/components/utilities';
import { WatercoolerPostButton } from '@dailydotdev/shared/src/features/watercooler/components/WatercoolerPostButton';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { mainFeedLayoutProps } from '../components/layouts/MainFeedPage';
import { getLayout } from '../components/layouts/FeedLayout';
import { defaultOpenGraph, noindexSeoProps } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';

const Custom404 = dynamic(() => import(/* webpackChunkName: "404" */ './404'));

const SquadEmptyScreen = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadEmptyScreen" */ '@dailydotdev/shared/src/components/squads/SquadEmptyScreen'
    ),
);

const seoTitles = getPageSeoTitles('Watercooler');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'The daily.dev watercooler: casual conversations, questions, and hot takes from the developer community.',
  // The same posts are already indexed on the squad page this feed reads from.
  ...noindexSeoProps,
};

const WatercoolerPage = (): ReactElement => {
  const { user } = useAuthContext();
  const { squad, isFetched } = useSquad({ handle: watercoolerSquadId });
  const squadId = squad?.id;

  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(
    () => ({
      source: squadId,
      ranking: 'TIME',
      supportedTypes: supportedTypesForPrivateSources,
    }),
    [squadId],
  );

  if (!isFetched) {
    return <></>;
  }

  if (!squad) {
    return <Custom404 />;
  }

  return (
    <FeedPageLayoutList>
      <div className="mb-4 flex w-full flex-row items-start justify-between gap-4 px-4 laptop:px-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <Typography bold tag={TypographyTag.H1} type={TypographyType.Title2}>
            {squad.name}
          </Typography>
          {squad.description && (
            <Typography
              className="mt-1"
              color={TypographyColor.Tertiary}
              tag={TypographyTag.P}
              type={TypographyType.Callout}
            >
              {squad.description}
            </Typography>
          )}
        </div>
        <WatercoolerPostButton className="shrink-0" squad={squad} />
      </div>
      <Feed
        className="px-0"
        feedName={OtherFeedPage.Watercooler}
        feedQueryKey={[
          'sourceFeed',
          user?.id ?? 'anonymous',
          Object.values(queryVariables),
        ]}
        query={SOURCE_FEED_QUERY}
        variables={queryVariables}
        emptyScreen={<SquadEmptyScreen />}
        options={{ refetchOnMount: true }}
        showSearch={false}
        excludePinnedPosts
        hideSource
      />
    </FeedPageLayoutList>
  );
};

WatercoolerPage.getLayout = getLayout;
WatercoolerPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default WatercoolerPage;
