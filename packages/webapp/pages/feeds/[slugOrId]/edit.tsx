import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import classNames from 'classnames';
import {
  Feed as FeedType,
  FeedList,
  PREVIEW_FEED_QUERY,
  FEED_LIST_QUERY,
  UPDATE_FEED_MUTATION,
  DELETE_FEED_MUTATION,
} from '@dailydotdev/shared/src/graphql/feed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  OtherFeedPage,
  RequestKey,
  StaleTime,
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
import { ArrowIcon, TrashIcon } from '@dailydotdev/shared/src/components/icons';
import useFeedSettings, {
  getFeedSettingsQueryKey,
} from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useExitConfirmation } from '@dailydotdev/shared/src/hooks/useExitConfirmation';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { labels } from '@dailydotdev/shared/src/lib';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { ADD_FILTERS_TO_FEED_MUTATION } from '@dailydotdev/shared/src/graphql/feedSettings';
import {
  PromptOptions,
  usePrompt,
} from '@dailydotdev/shared/src/hooks/usePrompt';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import FeedLayout from '../../../components/layouts/FeedLayout';

type EditFeedFormProps = {
  name: string;
};

const discardPrompt: PromptOptions = {
  title: labels.feed.prompt.discard.title,
  description: labels.feed.prompt.discard.description,
  okButton: {
    title: labels.feed.prompt.discard.okButton,
    color: ButtonColor.Ketchup,
  },
};

const EditFeedPage = (): ReactElement => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuthContext();
  const { showPrompt } = usePrompt();
  const feedSlugOrId = router.query.slugOrId as string;

  const { data: userFeeds } = useQuery(
    generateQueryKey(RequestKey.Feeds, user),
    async () => {
      const result = await request<FeedList>(graphqlUrl, FEED_LIST_QUERY);

      return result.feedList;
    },
    {
      enabled: !!user,
      staleTime: StaleTime.OneHour,
    },
  );
  const feed = useMemo(() => {
    return userFeeds?.edges.find(
      (edge) =>
        edge.node.slug === feedSlugOrId || edge.node.id === feedSlugOrId,
    )?.node;
  }, [userFeeds, feedSlugOrId]);

  const feedId = feed?.id;

  const { feedSettings } = useFeedSettings({
    feedId,
    enabled: !!feedId,
  });
  const seo: NextSeoProps = {
    title: 'Edit custom feed',
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };
  const [isPreviewFeedVisible, setPreviewFeedVisible] = useState(true);
  const isPreviewFeedEnabled = feedSettings?.includeTags?.length >= 1;
  const [isDirty, setDirty] = useState(false);

  const { shouldUseMobileFeedLayout, FeedPageLayoutComponent } =
    useFeedLayout();

  const { advancedSettings, ...previewFilters } = feedSettings || {};

  const feedProps = {
    feedName: OtherFeedPage.Preview,
    feedQueryKey: [
      RequestKey.FeedPreview,
      user?.id,
      RequestKey.FeedPreviewCustom,
      previewFilters,
    ],
    query: PREVIEW_FEED_QUERY,
    forceCardMode: true,
    showSearch: false,
    options: { refetchOnMount: true, cacheTime: 10, keepPreviousData: true },
    variables: {
      filters: previewFilters,
    },
  };

  const { displayToast } = useToastNotification();

  const onValidateAction = () => {
    return !isDirty;
  };

  const { onAskConfirmation } = useExitConfirmation({
    message: discardPrompt.description as string,
    onValidateAction,
  });

  const { mutateAsync: onSubmit } = useMutation(
    async ({ name }: EditFeedFormProps): Promise<FeedType> => {
      const result = await request<{ updateFeed: FeedType }>(
        graphqlUrl,
        UPDATE_FEED_MUTATION,
        {
          feedId,
          name,
        },
      );

      await request(graphqlUrl, ADD_FILTERS_TO_FEED_MUTATION, {
        feedId: result.updateFeed.id,
        filters: {
          includeTags: feedSettings?.includeTags || [],
        },
      });

      return result.updateFeed;
    },
    {
      onSuccess: (data) => {
        queryClient.removeQueries(getFeedSettingsQueryKey(user, feedId));

        queryClient.setQueryData<FeedList['feedList']>(
          generateQueryKey(RequestKey.Feeds, user),
          (current) => {
            return {
              ...current,
              edges: (current?.edges || []).map((edge) => {
                if (edge.node.id === feedId) {
                  return { node: data };
                }

                return edge;
              }),
            };
          },
        );

        onAskConfirmation(false);
        router.replace(`${webappUrl}feeds/${data.id}`);
      },
      onError: () => {
        displayToast(labels.error.generic);
      },
    },
  );

  const { mutateAsync: onDelete, status: deleteStatus } = useMutation(
    async (): Promise<Pick<FeedType, 'id'>> => {
      const shouldDelete = await showPrompt({
        title: `Delete ${feed?.flags?.name || 'custom feed'}?`,
        description: labels.feed.prompt.delete.description,
        okButton: {
          title: labels.feed.prompt.delete.okButton,
          color: ButtonColor.Ketchup,
        },
      });

      if (!shouldDelete) {
        throw new Error('User cancelled deletion');
      }

      await request(graphqlUrl, DELETE_FEED_MUTATION, {
        feedId,
      });

      return { id: feedId };
    },
    {
      onSuccess: () => {
        queryClient.removeQueries(getFeedSettingsQueryKey(user, feedId));

        queryClient.setQueryData<FeedList['feedList']>(
          generateQueryKey(RequestKey.Feeds, user),
          (current) => {
            return {
              ...current,
              edges: (current?.edges || []).filter(
                (edge) => edge.node.id !== feedId,
              ),
            };
          },
        );

        onAskConfirmation(false);
        router.replace('/');
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

  const shouldRedirectToNewFeed =
    userFeeds && feedSlugOrId && deleteStatus === 'idle';

  useEffect(() => {
    if (!shouldRedirectToNewFeed) {
      return;
    }

    if (!feed) {
      router.push('/feeds/new');
    }
  }, [shouldRedirectToNewFeed, feed, router]);

  if (!feed) {
    return null;
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

              const { name } = formToJson<EditFeedFormProps>(e.currentTarget);

              onSubmit({ name });
            }}
          >
            <div className="tablet:rounded-162 flex h-auto w-full flex-col items-center justify-between gap-4 border-b-2 border-accent-cabbage-default bg-background-subtle p-6 tablet:flex-row tablet:gap-0">
              <div className="text-center tablet:text-left">
                <p className="font-bold typo-title3">Feed settings</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<TrashIcon />}
                  onClick={() => {
                    onDelete();
                  }}
                />
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
              defaultValue={feed.flags?.name}
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
              feedId={feedId}
              onClickTag={() => {
                setDirty(true);
              }}
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

EditFeedPage.getLayout = getLayout;
EditFeedPage.layoutProps = {
  ...mainFeedLayoutProps,
};

export default EditFeedPage;
