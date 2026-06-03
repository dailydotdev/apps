import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ExploreTopicPage } from '@dailydotdev/shared/src/components/explore/ExploreTopicPage';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { featureExploreTopics } from '@dailydotdev/shared/src/lib/featureManagement';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import type { TopicPageProps } from '../../lib/topicPage';
import {
  getTopicPageJsonLd,
  getTopicPageStaticProps,
} from '../../lib/topicPage';

interface ExploreTagPageParams extends ParsedUrlQuery {
  tag: string;
}

const ExploreTagPage = ({
  tag,
  initialData,
  topPosts,
  recommendedTags,
  topContributors,
}: TopicPageProps): ReactElement => {
  const router = useRouter();
  const isExplore = useFeature(featureExploreTopics);

  // When the experiment is off, the topic page lives at /tags/[tag].
  useEffect(() => {
    if (!isExplore && tag) {
      router.replace(`${webappUrl}tags/${encodeURIComponent(tag)}`);
    }
  }, [isExplore, router, tag]);

  if (!isExplore) {
    return <></>;
  }

  const jsonLd = initialData
    ? getTopicPageJsonLd({ tag, initialData, topPosts, basePath: 'explore' })
    : null;

  return (
    <ExploreTopicPage
      tag={tag}
      initialData={initialData}
      topPosts={topPosts}
      recommendedTags={recommendedTags}
      topContributors={topContributors}
      jsonLd={jsonLd}
    />
  );
};

ExploreTagPage.getLayout = getLayout;
ExploreTagPage.layoutProps = mainFeedLayoutProps;

export default ExploreTagPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<ExploreTagPageParams>): Promise<
  GetStaticPropsResult<TopicPageProps>
> {
  return getTopicPageStaticProps(params?.tag);
}
