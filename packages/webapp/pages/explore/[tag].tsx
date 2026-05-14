import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import type { NextSeoProps } from 'next-seo';
import { NextSeo } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { FEED_BY_TAGS_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import type { DynamicSeoProps } from '../../components/common';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

interface ExploreTagPageProps extends DynamicSeoProps {
  tag: string;
}

interface ExploreTagPageParams extends ParsedUrlQuery {
  tag: string;
}

const ExploreTagPage = ({ tag, seo }: ExploreTagPageProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const { FeedPageLayoutComponent } = useFeedLayout();

  const queryVariables = useMemo(
    () => ({
      tags: [tag],
      ranking: 'POPULARITY',
      version: 20,
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
        PostType.Share,
        PostType.Freeform,
      ],
    }),
    [tag],
  );

  return (
    <FeedPageLayoutComponent>
      <NextSeo {...seo} />
      <ActiveFeedNameContext.Provider value={{ feedName: OtherFeedPage.Tag }}>
        <Feed
          feedName={OtherFeedPage.Tag}
          feedQueryKey={[
            'exploreFeedByTags',
            user?.id ?? 'anonymous',
            tag,
          ]}
          query={FEED_BY_TAGS_QUERY}
          variables={queryVariables}
          className="!mx-4 !w-auto"
        />
      </ActiveFeedNameContext.Provider>
    </FeedPageLayoutComponent>
  );
};

ExploreTagPage.getLayout = getLayout;
ExploreTagPage.layoutProps = mainFeedLayoutProps;

export default ExploreTagPage;

const getSeoData = (tag: string): NextSeoProps => {
  const seoTitles = getPageSeoTitles(`${tag} posts`);
  return {
    ...defaultSeo,
    ...seoTitles,
    openGraph: {
      ...defaultOpenGraph,
      ...seoTitles.openGraph,
    },
    description: `Posts about ${tag} on daily.dev`,
  };
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<ExploreTagPageParams>): Promise<
  GetStaticPropsResult<ExploreTagPageProps>
> {
  const tag = params?.tag;
  if (!tag) {
    return { notFound: true, revalidate: 3600 };
  }
  return {
    props: {
      tag,
      seo: getSeoData(tag),
    },
    revalidate: 3600,
  };
}
