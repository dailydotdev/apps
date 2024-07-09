import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import classNames from 'classnames';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { ButtonColor } from '@dailydotdev/shared/src/components/buttons/Button';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { FilterOnboardingV4 } from '@dailydotdev/shared/src/components/onboarding/FilterOnboardingV4';
import useFeedSettings, {
  getFeedSettingsQueryKey,
} from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useExitConfirmation } from '@dailydotdev/shared/src/hooks/useExitConfirmation';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import {
  useActions,
  useFeeds,
  useProgressAnimation,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { labels } from '@dailydotdev/shared/src/lib';
import { ADD_FILTERS_TO_FEED_MUTATION } from '@dailydotdev/shared/src/graphql/feedSettings';
import {
  FeedCustomActions,
  FeedCustomPreview,
  FeedPreviewControls,
  PreparingYourFeed,
} from '@dailydotdev/shared/src/components';
import {
  PromptOptions,
  usePrompt,
} from '@dailydotdev/shared/src/hooks/usePrompt';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

type NewFeedFormProps = {
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

const NewFeedPage = (): ReactElement => {
  const [newFeedId] = useState(() => Date.now().toString());
  const queryClient = useQueryClient();
  const router = useRouter();
  const { completeAction } = useActions();
  const { createFeed } = useFeeds();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const { logEvent } = useLogContext();

  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings({ feedId: newFeedId });
  const [isPreviewFeedVisible, setPreviewFeedVisible] = useState(false);
  const isPreviewFeedEnabled = feedSettings?.includeTags?.length >= 1;

  const { finished, onFinished, delayedRedirect, isAnimating } =
    useProgressAnimation();

  const onValidateAction = () => {
    return !isPreviewFeedEnabled;
  };

  const { onAskConfirmation } = useExitConfirmation({
    message: discardPrompt.description as string,
    onValidateAction,
  });

  const {
    mutateAsync: onSubmit,
    data: newFeed,
    isLoading,
  } = useMutation(
    async ({ name }: NewFeedFormProps) => {
      const result = await createFeed({ name });

      await gqlClient.request(ADD_FILTERS_TO_FEED_MUTATION, {
        feedId: result.id,
        filters: {
          includeTags: feedSettings?.includeTags || [],
        },
      });

      return result;
    },
    {
      onSuccess: (data) => {
        logEvent({
          event_name: LogEvent.CreateCustomFeed,
          target_id: data.id,
        });

        queryClient.removeQueries(getFeedSettingsQueryKey(user, newFeedId));

        onAskConfirmation(false);
        onFinished();
        delayedRedirect(`${webappUrl}feeds/${data.id}`);
      },
      onError: (error) => {
        const clientErrors = (error as ClientError)?.response?.errors || [];

        if (
          clientErrors.some(
            (item) => item.message === labels.feed.error.feedLimit.api,
          )
        ) {
          displayToast(labels.feed.error.feedLimit.client);

          return;
        }

        if (
          clientErrors.some(
            (item) => item.message === labels.feed.error.feedNameInvalid.api,
          )
        ) {
          displayToast(labels.feed.error.feedNameInvalid.api);

          return;
        }

        displayToast(labels.error.generic);
      },
    },
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    completeAction(ActionType.CustomFeed);
  }, [completeAction, user]);

  const logStartEventRef = useRef(false);

  useEffect(() => {
    if (logStartEventRef.current) {
      return;
    }

    logStartEventRef.current = true;

    logEvent({
      event_name: LogEvent.StartCustomFeed,
    });
  }, [logEvent]);

  if (finished) {
    return (
      <PreparingYourFeed
        text={`Preparing ${newFeed?.flags?.name || 'your feed'}...`}
        isAnimating={isAnimating}
      />
    );
  }

  const seo: NextSeoProps = {
    title: getTemplatedTitle('Create feed'),
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };

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
            <FeedCustomActions
              isDisabled={!isPreviewFeedEnabled}
              isLoading={isLoading}
              onDiscard={async () => {
                const shouldDiscard =
                  onValidateAction() || (await showPrompt(discardPrompt));

                if (shouldDiscard) {
                  onAskConfirmation(false);

                  router.push('/');
                }
              }}
            >
              <p className="font-bold typo-title3">
                Pick the tags you want to include
              </p>
            </FeedCustomActions>
            <TextField
              className={{
                container: 'mx-auto mt-10 w-full px-4 tablet:max-w-96',
              }}
              name="name"
              type="text"
              inputId="feedName"
              label="Enter feed name"
              required
              maxLength={50}
            />
          </form>

          <div className="flex w-full max-w-full flex-col">
            <FilterOnboardingV4
              className="mt-10 px-4 pt-0 tablet:px-10"
              shouldUpdateAlerts={false}
              shouldFilterLocally
              feedId={newFeedId}
              origin={Origin.CustomFeed}
              searchOrigin={Origin.CustomFeed}
            />
            <FeedPreviewControls
              isOpen={isPreviewFeedVisible}
              isDisabled={!isPreviewFeedEnabled}
              textDisabled="Select tags to show feed preview"
              origin={Origin.CustomFeed}
              onClick={setPreviewFeedVisible}
            />
          </div>
        </LayoutHeader>
        {isPreviewFeedEnabled && isPreviewFeedVisible && (
          <FeedCustomPreview feedId={newFeedId} />
        )}
      </FeedPageLayoutComponent>
    </>
  );
};

NewFeedPage.getLayout = getLayout;
NewFeedPage.layoutProps = mainFeedLayoutProps;

export default NewFeedPage;
