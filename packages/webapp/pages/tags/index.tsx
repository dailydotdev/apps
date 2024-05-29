import React, { ReactElement, useMemo } from 'react';
import { Card } from '@dailydotdev/shared/src/components/cards/Card';
import { getTagPageLink } from '@dailydotdev/shared/src/lib/links';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '@dailydotdev/shared/src/lib/query';
import request from 'graphql-request';
import { Source } from '@dailydotdev/shared/src/graphql/sources';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import {
  Keyword,
  POPULAR_TAGS_QUERY,
  Tag,
  TAGS_QUERY,
  TRENDING_TAGS_QUERY,
} from '@dailydotdev/shared/src/graphql/keywords';
import { TagLink } from '@dailydotdev/shared/src/components/TagLinks';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import classed from '@dailydotdev/shared/src/lib/classed';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  HashtagIcon,
  HomeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { ListItem, BreadCrumbsWrapper } from '../../components/common';

const TopList = ({
  title,
  items,
  className,
}: {
  title: string;
  items: Keyword[] | Source[] | Tag[];
  className?: string;
}): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const MobileDiv = classed(
    'div',
    'flex flex-col border-b border-b-border-subtlest-tertiary p-4',
    className,
  );
  const CardElement = classed(Card, '!p-4');
  const Wrapper = isMobile ? MobileDiv : CardElement;
  return (
    <Wrapper>
      <h3 className="mb-2 font-bold typo-title3">{title}</h3>
      <ol className="typo-body">
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
      </ol>
    </Wrapper>
  );
};

const TagsPage = (): ReactElement => {
  const { data } = useQuery(
    [RequestKey.Tags, null, 'all'],
    async () => await request<{ tags: Keyword[] }>(graphqlUrl, TAGS_QUERY),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  const { data: trendingTags } = useQuery(
    [RequestKey.Tags, null, 'trending'],
    async () => await request<{ tags: Tag[] }>(graphqlUrl, TRENDING_TAGS_QUERY),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  const { data: popularTags } = useQuery(
    [RequestKey.Tags, null, 'popular'],
    async () => await request<{ tags: Tag[] }>(graphqlUrl, POPULAR_TAGS_QUERY),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  const recentlyAddedTags = useMemo(() => {
    return data?.tags
      ?.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 10);
  }, [data]);

  const tagsByFirstLetter = useMemo(() => {
    const tags = data?.tags?.reduce((acc, cur) => {
      const rawLetter = cur.value[0].toLowerCase();
      const firstLetter = new RegExp(/^[a-zA-Z]+$/).test(rawLetter)
        ? rawLetter
        : '#';
      acc[firstLetter] = (acc[firstLetter] || []).concat([cur]);
      return acc;
    }, []);

    if (!tags) {
      return null;
    }

    return Object.keys(tags)
      .sort()
      .reduce((acc, cur) => {
        acc[cur] = tags[cur];
        return acc;
      }, []);
  }, [data]);

  return (
    <main className="flex flex-col gap-4 p-0 tablet:px-10 tablet:py-6">
      <BreadCrumbsWrapper>
        <Button
          variant={ButtonVariant.Tertiary}
          icon={<HomeIcon />}
          tag="a"
          href={process.env.NEXT_PUBLIC_WEBAPP_URL}
        />
        /
        <Button
          variant={ButtonVariant.Tertiary}
          icon={<HashtagIcon />}
          disabled
        >
          Tags
        </Button>
      </BreadCrumbsWrapper>
      <div className="grid grid-cols-1 gap-0 tablet:grid-cols-2 tablet:gap-6 laptopL:grid-cols-3">
        <TopList title="Trending tags" items={trendingTags?.tags} />
        <TopList title="Popular tags" items={popularTags?.tags} />
        <TopList
          className="col-span-1 tablet:col-span-2 laptopL:col-span-1"
          title="Recently added tags"
          items={recentlyAddedTags}
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
