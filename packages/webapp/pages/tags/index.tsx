import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import type { NextSeoProps } from 'next-seo/lib/types';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { TAG_DIRECTORY_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import { TagChip } from '@dailydotdev/shared/src/components/tags/TagChip';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useRouter } from 'next/router';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header/BreadCrumbs';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { TagTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { featureTagPageRedesign } from '@dailydotdev/shared/src/lib/featureManagement';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Explore trending tags for developers');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Discover trending, popular, and new tags on daily.dev. Browse topics that matter to developers and find relevant content quickly.',
};

interface TagsPageProps {
  tags: Keyword[];
  trendingTags: Keyword[];
  popularTags: Keyword[];
}

const getTagsSchemas = (tags: Keyword[]): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://app.daily.dev/tags#collection',
        url: 'https://app.daily.dev/tags',
        name: 'Explore trending tags for developers',
        description: 'Discover trending, popular, and new tags on daily.dev.',
      },
      {
        '@type': 'ItemList',
        '@id': 'https://app.daily.dev/tags#items',
        itemListElement: tags.map((tag, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Thing',
            name: tag.value,
            url: `https://app.daily.dev/tags/${encodeURIComponent(tag.value)}`,
          },
        })),
      },
    ],
  });

const TagsPage = ({
  tags,
  trendingTags,
  popularTags,
}: TagsPageProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();
  const isRedesign = useFeature(featureTagPageRedesign);
  const { user, showLogin } = useAuthContext();
  const [search, setSearch] = useState('');

  const { feedSettings } = useFeedSettings();
  const followedSet = useMemo(
    () => new Set(feedSettings?.includeTags || []),
    [feedSettings?.includeTags],
  );

  const recentlyAddedTags = useMemo(() => {
    return tags
      ?.slice()
      .sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0))
      .slice(0, 10);
  }, [tags]);

  const tagsByFirstLetter = useMemo<Record<string, Keyword[]> | null>(() => {
    const filteredTags = tags?.reduce<Record<string, Keyword[]>>((acc, cur) => {
      const rawLetter = cur.value[0].toLowerCase();
      const firstLetter: string = new RegExp(/^[a-zA-Z]+$/).test(rawLetter)
        ? rawLetter
        : '#';
      acc[firstLetter] = (acc[firstLetter] || []).concat([cur]);
      return acc;
    }, {});

    if (!filteredTags) {
      return null;
    }

    return Object.keys(filteredTags)
      .sort()
      .reduce<Record<string, Keyword[]>>((acc, cur) => {
        acc[cur] = filteredTags[cur].slice().sort((a: Keyword, b: Keyword) => {
          if (a.value < b.value) {
            return -1;
          }

          if (a.value > b.value) {
            return 1;
          }

          return 0;
        });
        return acc;
      }, {});
  }, [tags]);

  // Client-side filter for the A-Z wall. The full list is always in the SSG
  // HTML (empty query), so crawlers still see every tag link.
  const displayTagsByFirstLetter = useMemo(() => {
    if (!tagsByFirstLetter) {
      return null;
    }
    const query = search.trim().toLowerCase();
    if (!query) {
      return tagsByFirstLetter;
    }
    return Object.entries(tagsByFirstLetter).reduce<Record<string, Keyword[]>>(
      (acc, [letter, value]) => {
        const matches = value.filter((tag) =>
          tag.value.toLowerCase().includes(query),
        );
        if (matches.length) {
          acc[letter] = matches;
        }
        return acc;
      },
      {},
    );
  }, [tagsByFirstLetter, search]);

  if (isLoading) {
    return <></>;
  }

  const hasFilteredResults =
    !!displayTagsByFirstLetter &&
    Object.keys(displayTagsByFirstLetter).length > 0;

  const topTagsForSchema = tags.slice(0, 50);

  return (
    <PageWrapperLayout className="flex flex-col gap-4">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: getTagsSchemas(topTagsForSchema),
          }}
        />
      </Head>
      <BreadCrumbs className="mb-2">
        <HashtagIcon size={IconSize.XSmall} secondary /> Tags
      </BreadCrumbs>
      {isRedesign && (
        <section
          className={classNames(
            'flex flex-col gap-3 px-4 tablet:px-0',
            !user &&
              'rounded-16 border border-border-subtlest-tertiary bg-gradient-to-b from-surface-float to-transparent p-4 tablet:p-6',
          )}
        >
          <h1 className="typo-title2">Explore developer tags</h1>
          <p className="text-text-tertiary typo-body">
            Browse trending, popular, and new topics on daily.dev — and turn the
            ones you care about into a personalized feed, joined by millions of
            developers.
          </p>
          {!user && (
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className="mr-auto"
              onClick={() => showLogin({ trigger: AuthTriggers.Filter })}
            >
              Create your feed
            </Button>
          )}
        </section>
      )}
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
      <div className="flex min-h-10 flex-col gap-3 px-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:px-0">
        <p className="font-bold typo-body">All tags</p>
        {isRedesign && (
          <SearchField
            inputId="tags-directory-search"
            className="tablet:max-w-xs"
            fieldSize="medium"
            placeholder="Search tags"
            value={search}
            valueChanged={setSearch}
            aria-label="Search tags"
          />
        )}
      </div>
      <div className="columns-[17rem] px-4 tablet:px-0">
        {displayTagsByFirstLetter &&
          Object.entries(displayTagsByFirstLetter).map(([letter, value]) => {
            return (
              <div
                key={letter}
                className="mt-3 flex flex-col items-baseline gap-3 px-4 first:mt-0"
              >
                <p className="flex h-8 items-center font-bold text-text-tertiary typo-callout [break-after:avoid-column]">
                  {letter}
                </p>
                {value.map((tag) => (
                  <TagChip
                    key={tag.value}
                    tag={tag.value}
                    size="md"
                    isFollowed={followedSet.has(tag.value)}
                    className="break-inside-avoid"
                  />
                ))}
              </div>
            );
          })}
      </div>
      {isRedesign && search.trim() && !hasFilteredResults && (
        <p className="px-4 text-text-tertiary typo-body tablet:px-0">
          No tags match “{search.trim()}”.
        </p>
      )}
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
