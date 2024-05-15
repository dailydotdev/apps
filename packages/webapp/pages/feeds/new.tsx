import React, { ReactElement, useState } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import classNames from 'classnames';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { PREVIEW_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { OtherFeedPage, RequestKey } from '@dailydotdev/shared/src/lib/query';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { FilterOnboardingV4 } from '@dailydotdev/shared/src/components/onboarding/FilterOnboardingV4';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const NewFeedPage = (): ReactElement => {
  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings({ feedId: 'new' });
  const seo: NextSeoProps = {
    title: 'Create custom feed',
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };
  const [isPreviewFeedVisible, setPreviewFeedVisible] = useState(false);
  const isPreviewFeedEnabled = feedSettings?.includeTags?.length >= 1;

  const { shouldUseMobileFeedLayout, FeedPageLayoutComponent } =
    useFeedLayout();

  const feedProps = {
    feedName: OtherFeedPage.Preview,
    feedQueryKey: [RequestKey.FeedPreview, user?.id],
    query: PREVIEW_FEED_QUERY,
    forceCardMode: true,
    showSearch: false,
    options: { refetchOnMount: true },
  };

  return (
    <>
      <NextSeo {...seo} />
      <FeedPageLayoutComponent className={classNames('!p-0')}>
        <LayoutHeader className="flex-col overflow-x-visible">
          <div className="flex w-full justify-center bg-gradient-to-b from-surface-invert via-surface-invert">
            <div className="tablet:rounded-162 flex h-44 w-full flex-col items-center justify-between border-b-2 border-accent-cabbage-default bg-background-subtle p-6 tablet:h-auto tablet:flex-row">
              <div className="text-center tablet:text-left">
                <p className="font-bold typo-title3">
                  Pick the tags you want to include
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  size={ButtonSize.Large}
                  variant={ButtonVariant.Float}
                  onClick={() => {
                    // TODO
                  }}
                >
                  Discard
                </Button>
                <Button
                  size={ButtonSize.Large}
                  variant={ButtonVariant.Primary}
                  disabled={!isPreviewFeedEnabled}
                  onClick={() => {
                    // TODO
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
          {/* TODO input name field */}
          <div className="flex w-full max-w-full flex-col">
            <FilterOnboardingV4
              className="mt-10 px-4 pt-6 tablet:px-10 tablet:pt-0"
              shouldUpdateAlerts={false}
            />
            <div className="mt-10 flex items-center justify-center gap-10 text-text-quaternary typo-callout">
              <div className="h-px flex-1 bg-border-subtlest-tertiary" />
              <Button
                variant={ButtonVariant.Float}
                disabled={!isPreviewFeedEnabled}
                icon={
                  <ArrowIcon
                    className={classNames(
                      !isPreviewFeedVisible && 'rotate-180',
                    )}
                  />
                }
                iconPosition={ButtonIconPosition.Right}
                onClick={() => {
                  setPreviewFeedVisible((current) => !current);
                }}
              >
                {isPreviewFeedEnabled
                  ? `${isPreviewFeedVisible ? 'Hide' : 'Show'} feed preview`
                  : `Select tags to show feed preview`}
              </Button>
              <div className="h-px flex-1 bg-border-subtlest-tertiary" />
            </div>
          </div>
        </LayoutHeader>
        {isPreviewFeedEnabled && isPreviewFeedVisible && (
          <Feed
            {...feedProps}
            className={classNames(
              shouldUseMobileFeedLayout && 'laptop:px-6',
              'px-6 laptop:px-16',
            )}
          />
        )}
      </FeedPageLayoutComponent>
    </>
  );
};

NewFeedPage.getLayout = getLayout;
NewFeedPage.layoutProps = {
  ...mainFeedLayoutProps,
};

export default NewFeedPage;
