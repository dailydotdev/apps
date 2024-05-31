import React, { ReactElement, useMemo } from 'react';
import { getTagPageLink } from '@dailydotdev/shared/src/lib/links';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import {
  Keyword,
  Tag,
  TAG_DIRECTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/keywords';
import { TagLink } from '@dailydotdev/shared/src/components/TagLinks';
import classed from '@dailydotdev/shared/src/lib/classed';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { GetStaticPropsResult } from 'next';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { useRouter } from 'next/router';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { BreadCrumbs, ListItem, TopList } from '../../components/common';

const PlaceholderList = classed(
  ElementPlaceholder,
  'h-[1.6875rem] my-1.5 rounded-12',
);

const TagTopList = ({
  items,
  isLoading,
  ...props
}: {
  title: string;
  items: Tag[] | Keyword[];
  isLoading: boolean;
  className?: string;
}): ReactElement => {
  return (
    <TopList {...props}>
      <>
        {/* eslint-disable-next-line react/no-array-index-key */}
        {isLoading && [...Array(10)].map((_, i) => <PlaceholderList key={i} />)}
        {items?.map((item, i) => (
          <ListItem
            key={item.value}
            index={i + 1}
            href={getTagPageLink(item.value)}
            className="py-1.5 pr-2"
          >
            <p className="pl-4">{item.value}</p>
          </ListItem>
        ))}
      </>
    </TopList>
  );
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
      const firstLetter = new RegExp(/^[a-zA-Z]+$/).test(rawLetter)
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
        acc[cur] = filteredTags[cur];
        return acc;
      }, []);
  }, [tags]);

  if (isLoading) {
    return <></>;
  }

  return (
    <main className="flex flex-col gap-4 p-0 tablet:px-10 tablet:py-6">
      <BreadCrumbs>
        <>
          <HashtagIcon size={IconSize.XSmall} secondary /> Tags
        </>
      </BreadCrumbs>
      <div className="grid grid-cols-1 gap-0 tablet:grid-cols-2 tablet:gap-6 laptopL:grid-cols-3">
        <TagTopList
          title="Trending tags"
          items={trendingTags}
          isLoading={isLoading}
        />
        <TagTopList
          title="Popular tags"
          items={popularTags}
          isLoading={isLoading}
        />
        <TagTopList
          title="Recently added tags"
          items={recentlyAddedTags}
          isLoading={isLoading}
          className="col-span-1 tablet:col-span-2 laptopL:col-span-1"
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
    </main>
  );
};

const getTagsPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

TagsPage.getLayout = getTagsPageLayout;
TagsPage.layoutProps = {
  screenCentered: false,
};
export default TagsPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<TagsPageProps>
> {
  try {
    const res = await request<TagsPageProps>(graphqlUrl, TAG_DIRECTORY_QUERY);
    return {
      props: {
        tags: res.tags,
        trendingTags: res.trendingTags,
        popularTags: res.popularTags,
      },
      revalidate: 60,
    };
  } catch (err) {
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        err?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return {
        props: {
          tags: null,
          trendingTags: null,
          popularTags: null,
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
