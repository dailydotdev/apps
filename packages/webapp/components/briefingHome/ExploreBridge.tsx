import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  DiscussIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import useFeed from '@dailydotdev/shared/src/hooks/useFeed';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_V2_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { FeedItemType } from '@dailydotdev/shared/src/components/cards/common/common';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { briefCopy } from './copy';

const PAGE_SIZE = 8;

const TeaserCard = ({ post }: { post: Post }): ReactElement => (
  <Link href={post.commentsPermalink} passHref>
    <a className="group flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-3 transition-colors hover:border-border-subtlest-secondary">
      {post.image ? (
        <div className="aspect-video overflow-hidden rounded-8 bg-surface-float">
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video rounded-8 bg-surface-float" />
      )}
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
        bold
        className="uppercase tracking-[0.12em]"
      >
        {post.source?.name ?? 'post'}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Primary}
        className="line-clamp-3 !leading-snug transition-colors group-hover:text-brand-default"
      >
        {post.title}
      </Typography>
      <div className="flex items-center gap-3 text-text-quaternary">
        <span className="inline-flex items-center gap-1">
          <UpvoteIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {post.numUpvotes ?? 0}
          </Typography>
        </span>
        <span className="inline-flex items-center gap-1">
          <DiscussIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {post.numComments ?? 0}
          </Typography>
        </span>
      </div>
    </a>
  </Link>
);

const TeaserSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-3">
    <div className="aspect-video animate-pulse rounded-8 bg-surface-float" />
    <div className="h-3 w-16 animate-pulse rounded-4 bg-surface-float" />
    <div className="h-4 w-full animate-pulse rounded-4 bg-surface-float" />
    <div className="h-4 w-3/4 animate-pulse rounded-4 bg-surface-float" />
  </div>
);

export const ExploreBridge = (): ReactElement => {
  const { user } = useAuthContext();
  const feedQueryKey = useMemo(
    () => generateQueryKey(RequestKey.Feeds, user, 'briefing-home-bridge'),
    [user],
  );

  const { items, isLoading, isFetching } = useFeed(
    feedQueryKey,
    PAGE_SIZE,
    { adStart: Number.POSITIVE_INFINITY },
    PAGE_SIZE,
    {
      query: user ? FEED_V2_QUERY : ANONYMOUS_FEED_QUERY,
      settings: {},
      variables: {},
    },
  );

  const posts = useMemo(
    () =>
      items
        .filter((it) => it.type === FeedItemType.Post)
        .slice(0, PAGE_SIZE)
        .map((it) => (it.type === FeedItemType.Post ? it.post : null))
        .filter((p): p is Post => p !== null),
    [items],
  );

  const showSkeleton = (isLoading || isFetching) && posts.length === 0;

  return (
    <section id="explore-bridge" className="mt-16">
      <div className="mb-6 flex flex-col items-center text-center">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          bold
          className="uppercase tracking-[0.18em]"
        >
          {briefCopy.bridgeEyebrow}
        </Typography>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          bold
          className="mt-2 !leading-tight tracking-[-0.02em]"
        >
          {briefCopy.bridgeTitle}
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          className="mt-1 max-w-md"
        >
          {briefCopy.bridgeSub}
        </Typography>
      </div>

      <div
        className={classNames(
          'grid gap-4',
          'grid-cols-1 mobileL:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4',
        )}
      >
        {showSkeleton
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <TeaserSkeleton key={i} />
            ))
          : posts.map((post) => <TeaserCard key={post.id} post={post} />)}
      </div>

      <div className="mt-8 flex justify-center">
        <Link href="/my-feed" passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Medium}
            icon={<ArrowIcon className="rotate-90" />}
            iconSecondaryOnHover
          >
            {briefCopy.bridgeCta}
          </Button>
        </Link>
      </div>
    </section>
  );
};
