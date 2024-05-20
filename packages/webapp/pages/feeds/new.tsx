import React, { ReactElement, useState } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import classNames from 'classnames';
import {
  CREATE_FEED_MUTATION,
  Feed as FeedType,
  FeedList,
  PREVIEW_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  OtherFeedPage,
  RequestKey,
  generateQueryKey,
} from '@dailydotdev/shared/src/lib/query';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { FilterOnboardingV4 } from '@dailydotdev/shared/src/components/onboarding/FilterOnboardingV4';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import useFeedSettings, {
  getFeedSettingsQueryKey,
} from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useExitConfirmation } from '@dailydotdev/shared/src/hooks/useExitConfirmation';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import {
  useOnboardingAnimation,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { labels } from '@dailydotdev/shared/src/lib';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { ADD_FILTERS_TO_FEED_MUTATION } from '@dailydotdev/shared/src/graphql/feedSettings';
import { PreparingYourFeed } from '@dailydotdev/shared/src/components';
import {
  PromptOptions,
  usePrompt,
} from '@dailydotdev/shared/src/hooks/usePrompt';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import FeedLayout from '../../components/layouts/FeedLayout';

type NewFeedFormProps = {
  name: string;
};

const newFeedId = 'new';

const discardPrompt: PromptOptions = {
  title: labels.feed.prompt.discard.title,
  description: labels.feed.prompt.discard.description,
  okButton: {
    title: labels.feed.prompt.discard.okButton,
    color: ButtonColor.Ketchup,
  },
};

const NewFeedPage = (): ReactElement => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuthContext();
  const { showPrompt } = usePrompt();
  const { feedSettings } = useFeedSettings({ feedId: newFeedId });
  const seo: NextSeoProps = {
    title: 'Create custom feed',
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };
  const [isPreviewFeedVisible, setPreviewFeedVisible] = useState(false);
  const isPreviewFeedEnabled = feedSettings?.includeTags?.length >= 1;

  const {
    finishedOnboarding,
    onFinishedOnboarding,
    postOnboardingRedirect,
    isAnimating,
  } = useOnboardingAnimation();

  const { shouldUseMobileFeedLayout, FeedPageLayoutComponent } =
    useFeedLayout();

  const { advancedSettings, ...previewFilters } = feedSettings || {};

  const feedProps = {
    feedName: OtherFeedPage.Preview,
    feedQueryKey: [RequestKey.FeedPreview, user?.id],
    query: PREVIEW_FEED_QUERY,
    forceCardMode: true,
    showSearch: false,
    options: { refetchOnMount: true },
    variables: {
      filters: previewFilters,
    },
  };

  const { displayToast } = useToastNotification();

  const onValidateAction = () => {
    return !isPreviewFeedEnabled;
  };

  const { onAskConfirmation } = useExitConfirmation({
    message: discardPrompt.description as string,
    onValidateAction,
  });

  const { mutateAsync: onSubmit, data: newFeed } = useMutation(
    async ({ name }: NewFeedFormProps): Promise<FeedType> => {
      const result = await request<{ createFeed: FeedType }>(
        graphqlUrl,
        CREATE_FEED_MUTATION,
        {
          name,
        },
      );

      await request(graphqlUrl, ADD_FILTERS_TO_FEED_MUTATION, {
        feedId: result.createFeed.id,
        filters: {
          includeTags: feedSettings?.includeTags || [],
        },
      });

      return result.createFeed;
    },
    {
      onSuccess: (data) => {
        queryClient.removeQueries(getFeedSettingsQueryKey(user, newFeedId));

        queryClient.setQueryData<FeedList['feedList']>(
          generateQueryKey(RequestKey.Feeds, user),
          (current) => {
            return {
              ...current,
              edges: [
                ...(current?.edges || []),
                {
                  node: data,
                },
              ],
            };
          },
        );

        onAskConfirmation(false);
        onFinishedOnboarding();
        postOnboardingRedirect(`/feeds/${data.slug}`);
      },
      onError: () => {
        displayToast(labels.error.generic);
      },
    },
  );

  const onDiscard = async () => {
    const shouldDiscard =
      onValidateAction() || (await showPrompt(discardPrompt));

    if (shouldDiscard) {
      onAskConfirmation(false);

      router.push('/');
    }
  };

  if (finishedOnboarding) {
    return (
      <PreparingYourFeed
        text={`Preparing ${newFeed?.flags?.name || 'your custom feed'}...`}
        isAnimating={isAnimating}
      />
    );
  }

  return (
    <>
      <NextSeo {...seo} />
      <FeedPageLayoutComponent className={classNames('!p-0')}>
        <LayoutHeader className="flex-col overflow-x-visible">
          <form
            className="flex w-full flex-col justify-center bg-gradient-to-b from-surface-invert via-surface-invert"
            onSubmit={(e) => {
              e.preventDefault();

              const { name } = formToJson<NewFeedFormProps>(e.currentTarget);

              onSubmit({ name });
            }}
          >
            <div className="tablet:rounded-162 flex h-auto w-full flex-col items-center justify-between gap-4 border-b-2 border-accent-cabbage-default bg-background-subtle p-6 tablet:flex-row tablet:gap-0">
              <div className="text-center tablet:text-left">
                <p className="font-bold typo-title3">
                  Pick the tags you want to include
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  size={ButtonSize.Large}
                  variant={ButtonVariant.Float}
                  onClick={() => {
                    onDiscard();
                  }}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  size={ButtonSize.Large}
                  variant={ButtonVariant.Primary}
                  disabled={!isPreviewFeedEnabled}
                >
                  Save
                </Button>
              </div>
            </div>
            <TextField
              className={{
                container: 'mx-auto mt-10 w-full px-4 tablet:max-w-96',
              }}
              name="name"
              type="text"
              inputId="feedName"
              label="Enter feed name"
              required
            />
          </form>

          <div className="flex w-full max-w-full flex-col">
            <FilterOnboardingV4
              className="mt-10 px-4 pt-0 tablet:px-10"
              shouldUpdateAlerts={false}
              shouldFilterLocally
              feedId={newFeedId}
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
          <FeedLayout>
            <Feed
              {...feedProps}
              className={classNames(
                shouldUseMobileFeedLayout && 'laptop:px-6',
                'px-6 laptop:px-16',
              )}
            />
          </FeedLayout>
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
