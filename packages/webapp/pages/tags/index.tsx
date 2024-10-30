import React, { ReactElement, useMemo } from 'react';
import { GetStaticPropsResult } from 'next';
import { NextSeoProps } from 'next-seo/lib/types';
import {
  Keyword,
  TAG_DIRECTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/keywords';
import { TagLink } from '@dailydotdev/shared/src/components/TagLinks';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useRouter } from 'next/router';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header/BreadCrumbs';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { TagTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Explore trending tags for developers'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Discover trending, popular, and new tags on daily.dev. Browse topics that matter to developers and find relevant content quickly.',
};

interface TagsPageProps {
  tags: Keyword[];
  trendingTags: Keyword[];
  popularTags: Keyword[];
}

const TagsPage = ({
  tags,
  trendingTags,
  popularTags,
}: TagsPageProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();

  const recentlyAddedTags = useMemo(() => {
    return tags
      ?.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 10);
  }, [tags]);

  const tagsByFirstLetter = useMemo(() => {
    const filteredTags = tags?.reduce((acc, cur) => {
      const rawLetter = cur.value[0].toLowerCase();
      const firstLetter: string = new RegExp(/^[a-zA-Z]+$/).test(rawLetter)
        ? rawLetter
        : '#';
      acc[firstLetter] = (acc[firstLetter] || []).concat([cur]);
      return acc;
    }, []);

    if (!filteredTags) {
      return null;
    }

    return Object.keys(filteredTags)
      .sort()
      .reduce((acc, cur) => {
        acc[cur] = filteredTags[cur].sort((a: Keyword, b: Keyword) => {
          if (a.value < b.value) {
            return -1;
          }

          if (a.value > b.value) {
            return 1;
          }

          return 0;
        });
        return acc;
      }, []);
  }, [tags]);

  if (isLoading) {
    return <></>;
  }

  return (
    <PageWrapperLayout className="flex flex-col gap-4">
      <BreadCrumbs>
        <HashtagIcon size={IconSize.XSmall} secondary /> Tags
      </BreadCrumbs>
      <div className="grid auto-rows-fr grid-cols-1 gap-0 tablet:grid-cols-2 tablet:gap-6 laptopL:grid-cols-3">
        <TagTopList
          containerProps={{ title: 'Trending tags' }}
          items={trendingTags}
          isLoading={isLoading}
        />
        <TagTopList
          containerProps={{ title: 'Popular tags' }}
          items={popularTags}
          isLoading={isLoading}
        />
        <TagTopList
          containerProps={{
            title: 'Recently added tags',
            className: 'col-span-1 tablet:col-span-2 laptopL:col-span-1',
          }}
          items={recentlyAddedTags}
          isLoading={isLoading}
        />
      </div>
      <div className="flex h-10 items-center justify-between px-4 tablet:px-0">
        <p className="font-bold typo-body">All tags</p>
      </div>
      <div className="columns-[17rem] px-4 tablet:px-0">
        {tagsByFirstLetter &&
          Object.entries(tagsByFirstLetter).map(([letter, value]) => {
            return (
              <div
                key={letter}
                className="mt-3 flex flex-col items-baseline gap-3 px-4 first:mt-0"
              >
                <p className="flex h-8 items-center font-bold text-text-tertiary typo-callout">
                  {letter}
                </p>
                {value.map((tag) => (
                  <TagLink
                    key={tag.value}
                    tag={tag.value}
                    className="!line-clamp-2 !h-auto"
                  />
                ))}
              </div>
            );
          })}
      </div>
    </PageWrapperLayout>
  );
};

const getTagsPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

TagsPage.getLayout = getTagsPageLayout;
TagsPage.layoutProps = {
  screenCentered: false,
  seo,
};
export default TagsPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<TagsPageProps>
> {
  try {
    const res = await gqlClient.request<TagsPageProps>(TAG_DIRECTORY_QUERY);
    return {
      props: {
        tags: res.tags,
        trendingTags: res.trendingTags,
        popularTags: res.popularTags,
      },
      revalidate: 60,
    };
  } catch (err) {
    const error = err as GraphQLError;
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        error?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return {
        props: {
          tags: [],
          trendingTags: [],
          popularTags: [],
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
