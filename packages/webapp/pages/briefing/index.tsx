import type { MouseEvent, ReactElement } from 'react';
import React, { useContext } from 'react';
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
import Link from 'next/link';
import {
  briefingUrl,
  plusUrl,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import {
  useConditionalFeature,
  usePlusSubscription,
} from '@dailydotdev/shared/src/hooks';
import { featurePlusCtaCopy } from '@dailydotdev/shared/src/lib/featureManagement';
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  briefButtonBg,
  briefCardBg,
} from '@dailydotdev/shared/src/styles/custom';
import { useNewPostModalNavigation } from '@dailydotdev/shared/src/hooks/usePostModalNavigation';
import { PostModalMap } from '@dailydotdev/shared/src/components/Feed';
import useFeed from '@dailydotdev/shared/src/hooks/useFeed';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import FeedContext from '@dailydotdev/shared/src/contexts/FeedContext';
import type { PostItem } from '@dailydotdev/shared/src/graphql/posts';
import { FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { noop } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getTemplatedTitle } from '../../components/layouts/utils';

const Page = (): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const currentSettings = useContext(FeedContext);
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });

  const selectedBriefId = router?.query?.pmid as string;

  // just simulate some briefs with existing posts
  const { items, updatePost, fetchPage, canFetchMore } = useFeed(
    generateQueryKey(RequestKey.Feeds, user, 'briefing'),
    10,
    currentSettings.adTemplate,
    10,
    {
      query: FEED_QUERY,
      settings: {},
      variables: {
        ranking: 'POPULARITY',
        version: 1,
      },
    },
  );

  const {
    onOpenModal,
    onCloseModal,
    onPrevious,
    onNext,
    postPosition,
    selectedPost,
  } = useNewPostModalNavigation(
    items,
    fetchPage,
    updatePost,
    canFetchMore,
    briefingUrl,
  );

  const PostModal = PostModalMap[selectedPost?.type];

  const briefs: PostItem[] = items?.filter((item) => item.type === 'post');

  const onBriefClick = (
    briefId: string,
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    const briefIndex = briefs.findIndex((item) => item.post.slug === briefId);

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
            <Link legacyBehavior passHref href={`${webappUrl}bookmarks`}>
              <Button
                className="laptop:hidden"
                tag="a"
                icon={<ArrowIcon className="-rotate-90" />}
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
              />
            </Link>
            <Typography type={TypographyType.Title3} bold>
              Presidential briefing
            </Typography>
            <Button
              className="ml-auto"
              icon={<SettingsIcon className="text-text-secondary" />}
              onClick={() => {
                // TODO feat-brief open/goto settings
              }}
            />
          </header>
          <div className="flex flex-col px-4">
            {!isPlus && (
              <div
                style={{
                  background: briefCardBg,
                }}
                className="mb-4 flex w-full flex-wrap items-center justify-between gap-2 rounded-12 border border-white bg-action-plus-float px-4 py-3"
              >
                <Typography
                  type={TypographyType.Callout}
                  className="w-full tablet:w-auto"
                >
                  Upgrade to daily.dev Plus now to access exclusive dev
                  insights!
                </Typography>
                <Link href={plusUrl} passHref legacyBehavior>
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
            <BriefListSection>
              <BriefListItem
                briefId={briefs?.[0]?.post.slug}
                title="May 14"
                pill={{ label: 'Just in' }}
                readTime="8m"
                postsCount={783}
                sourcesCount={147}
                onClick={onBriefClick}
              />
              <BriefListItem
                briefId={briefs?.[1]?.post.slug}
                title="May 2"
                readTime="8m"
                postsCount={783}
                sourcesCount={147}
                isRead
                onClick={onBriefClick}
              />
              <BriefListItem
                briefId={briefs?.[2]?.post.slug}
                title="April 7"
                readTime="8m"
                postsCount={783}
                sourcesCount={147}
                isRead
                onClick={onBriefClick}
              />
            </BriefListSection>
            <BriefListSection>
              <BriefListHeading title="2024" />
              <BriefListItem
                briefId={briefs?.[3]?.post.slug}
                title="December 22"
                readTime="8m"
                postsCount={783}
                sourcesCount={147}
                isLocked
                onClick={onBriefClick}
              />
              <BriefListItem
                briefId={briefs?.[4]?.post.slug}
                title="December 1"
                readTime="8m"
                postsCount={783}
                sourcesCount={147}
                isRead
                onClick={onBriefClick}
              />
              <BriefListItem
                briefId={briefs?.[5]?.post.slug}
                title="November 5"
                readTime="8m"
                postsCount={783}
                sourcesCount={147}
                onClick={onBriefClick}
              />
              <BriefListItem
                briefId={briefs?.[6]?.post.slug}
                title="October 22"
                readTime="8m"
                postsCount={783}
                sourcesCount={147}
                isRead
                onClick={onBriefClick}
              />
            </BriefListSection>
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
          onRemovePost={noop}
        />
      )}
    </ProtectedPage>
  );
};

const getBriefingLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  title: getTemplatedTitle('Presidential briefing'),
  description: 'TODO feat-brief SEO description',
  nofollow: true,
  noindex: true,
};

Page.getLayout = getBriefingLayout;
Page.layoutProps = { seo, screenCentered: false };

export default Page;
