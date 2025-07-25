import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';

import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { BriefListItem } from '@dailydotdev/shared/src/components/brief/BriefListItem';
import { BriefListHeading } from '@dailydotdev/shared/src/components/brief/BriefListHeading';
import { BriefListSection } from '@dailydotdev/shared/src/components/brief/BriefListSection';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  SettingsIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  plusUrl,
  settingsUrl,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import {
  useConditionalFeature,
  usePlusSubscription,
  useViewSizeClient,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { featurePlusCtaCopy } from '@dailydotdev/shared/src/lib/featureManagement';
import { LogEvent, Origin, TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  briefButtonBg,
  briefCardBg,
} from '@dailydotdev/shared/src/styles/custom';
import { usePostModalNavigation } from '@dailydotdev/shared/src/hooks/usePostModalNavigation';
import { PostModalMap } from '@dailydotdev/shared/src/components/Feed';
import useFeed from '@dailydotdev/shared/src/hooks/useFeed';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  BRIEFING_POSTS_PER_PAGE_DEFAULT,
  BRIEFING_POSTS_QUERY,
} from '@dailydotdev/shared/src/graphql/posts';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { BriefCardFeed } from '@dailydotdev/shared/src/components/cards/brief/BriefCard/BriefCardFeed';
import { FeedItemType } from '@dailydotdev/shared/src/components/cards/common/common';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getTemplatedTitle } from '../../components/layouts/utils';

const Page = (): ReactElement => {
  const isMobile = useViewSizeClient(ViewSize.MobileL);
  const currentYear = new Date().getFullYear().toString();
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const isNotPlus = !isPlus && isAuthReady;
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: isNotPlus,
  });

  const selectedBriefId = router?.query?.pmid as string;

  const feedQueryKey = generateQueryKey(RequestKey.Feeds, user, 'briefing');
  const feedQuery = useFeed(
    feedQueryKey,
    BRIEFING_POSTS_PER_PAGE_DEFAULT,
    null,
    BRIEFING_POSTS_PER_PAGE_DEFAULT,
    {
      query: BRIEFING_POSTS_QUERY,
      settings: {},
      variables: {},
    },
  );
  const { items, updatePost, fetchPage, canFetchMore, emptyFeed } = feedQuery;

  const {
    onOpenModal,
    onCloseModal,
    onPrevious,
    onNext,
    postPosition,
    selectedPost,
  } = usePostModalNavigation({
    items,
    fetchPage,
    updatePost,
    canFetchMore,
    feedName: 'briefing',
  });

  const PostModal = PostModalMap[selectedPost?.type];

  const onBriefClick = (post: Post, event: MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) {
      return;
    }

    const briefIndex = items.findIndex(
      (item) => item.type === 'post' && item.post.slug === post.slug,
    );

    if (briefIndex === -1) {
      return;
    }

    event.preventDefault();

    onOpenModal(briefIndex);
  };

  return (
    <ProtectedPage>
      <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-4">
        <main className="relative flex flex-1 flex-col gap-6">
          <header className="flex items-center gap-2 border-b border-border-subtlest-tertiary p-4 laptop:border-none laptop:pb-0 laptop:pt-6">
            <Link href={`${webappUrl}bookmarks`}>
              <Button
                className="laptop:hidden"
                tag="a"
                icon={<ArrowIcon className="-rotate-90" />}
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
              />
            </Link>
            <Typography type={TypographyType.Title3} bold>
              Presidential briefings
            </Typography>
            <Button
              className="ml-auto"
              icon={<SettingsIcon className="text-text-secondary" />}
              onClick={() => {
                router?.push(`${settingsUrl}/notifications`);
              }}
            />
          </header>
          <div className="flex flex-col px-4">
            {isNotPlus &&
              !!items.length &&
              items[0]?.type !== FeedItemType.Placeholder && (
                <div
                  style={{
                    background: briefCardBg,
                  }}
                  className="mb-4 flex w-full flex-wrap items-center justify-between gap-2 rounded-12 border border-white px-4 py-3"
                >
                  <Typography
                    type={TypographyType.Callout}
                    className="w-full tablet:w-auto"
                  >
                    Get unlimited access to every past and future presidential
                    briefing with daily.dev Plus.
                  </Typography>
                  <Link href={plusUrl} passHref>
                    <Button
                      style={{
                        background: briefButtonBg,
                      }}
                      className="ml-auto w-fit text-black"
                      tag="a"
                      type="button"
                      variant={ButtonVariant.Primary}
                      size={ButtonSize.Small}
                      onClick={() => {
                        logSubscriptionEvent({
                          event_name: LogEvent.UpgradeSubscription,
                          target_id: TargetId.Brief,
                        });
                      }}
                    >
                      {plusCta}
                    </Button>
                  </Link>
                </div>
              )}
            <InfiniteScrolling
              isFetchingNextPage={feedQuery.isFetching}
              canFetchMore={feedQuery.canFetchMore}
              fetchNextPage={feedQuery.fetchPage}
            >
              <ActiveFeedContext.Provider
                value={{ queryKey: feedQueryKey, items }}
              >
                {emptyFeed && !feedQuery.isPending && (
                  <div className="tablet:max-w-80">
                    <BriefCardFeed
                      targetId={TargetId.List}
                      className={{
                        container: '!p-0',
                      }}
                    />
                  </div>
                )}
                {emptyFeed &&
                  items.map((item, index) => {
                    if (item.type !== FeedItemType.Placeholder) {
                      return null;
                    }

                    return (
                      <ElementPlaceholder
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        className="h-10 w-full rounded-10"
                      />
                    );
                  })}
                {items
                  .reduce(
                    (acc, item, index) => {
                      const previousItem = acc[acc.length - 1];

                      if (item.type === 'post') {
                        const year = format(
                          new Date(item.post.createdAt),
                          'yyyy',
                        );

                        if (!previousItem || previousItem.title !== year) {
                          acc.push({
                            title: year,
                            items: [],
                          });
                        }

                        const section = acc[acc.length - 1];

                        const { post } = item;

                        section.items.push(
                          <BriefListItem
                            key={post.id}
                            post={post}
                            title={post.title}
                            pill={
                              index === 0 && !post.read
                                ? { label: 'Just in' }
                                : undefined
                            }
                            readTime={post.readTime}
                            isRead={post.read}
                            postsCount={post.flags?.posts || 0}
                            sourcesCount={post.flags?.sources || 0}
                            onClick={onBriefClick}
                            origin={Origin.BriefPage}
                            targetId={TargetId.List}
                          />,
                        );
                      }

                      if (item.type === 'placeholder') {
                        if (!previousItem) {
                          acc.push({
                            title: new Date().getFullYear().toString(),
                            items: [],
                          });
                        }

                        const section = acc[acc.length - 1];

                        section.items.push(
                          <ElementPlaceholder
                            // eslint-disable-next-line react/no-array-index-key
                            key={`placeholder-${index}`}
                            className="h-16 w-full rounded-16 border border-border-subtlest-tertiary bg-transparent p-2"
                          />,
                        );
                      }

                      return acc;
                    },
                    [] as {
                      title: string;
                      items: ReactElement[];
                    }[],
                  )
                  .map((section) => {
                    return (
                      <BriefListSection key={section.title}>
                        {section.title !== currentYear && (
                          <BriefListHeading title={section.title} />
                        )}
                        {section.items}
                      </BriefListSection>
                    );
                  })}
              </ActiveFeedContext.Provider>
            </InfiniteScrolling>
          </div>
        </main>
      </div>
      {!!selectedBriefId && !!selectedPost && (
        <PostModal
          isOpen
          id={selectedPost.id}
          onRequestClose={() => {
            onCloseModal();
          }}
          onPreviousPost={onPrevious}
          onNextPost={onNext}
          postPosition={postPosition}
          post={selectedPost}
        />
      )}
    </ProtectedPage>
  );
};

const getBriefingLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  title: getTemplatedTitle('Presidential briefings'),
  description:
    'Fast, high-signal briefings delivered straight to you by your personal AI agent.',
  nofollow: true,
  noindex: true,
};

Page.getLayout = getBriefingLayout;
Page.layoutProps = { seo, screenCentered: false };

export default Page;
