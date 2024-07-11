import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { useFeeds, useToastNotification } from '@dailydotdev/shared/src/hooks';
import { labels } from '@dailydotdev/shared/src/lib';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import {
  PromptOptions,
  usePrompt,
} from '@dailydotdev/shared/src/hooks/usePrompt';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  FeedCustomActions,
  FeedCustomPreview,
  FeedPreviewControls,
} from '@dailydotdev/shared/src/components';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { generateQueryKey } from '@dailydotdev/shared/src/lib/query';
import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';

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
  const { feeds, updateFeed, deleteFeed } = useFeeds();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const { logEvent } = useLogContext();

  const feedSlugOrId = router.query.slugOrId as string;
  const feed = useMemo(() => {
    return feeds?.edges.find(
      (edge) =>
        edge.node.slug === feedSlugOrId || edge.node.id === feedSlugOrId,
    )?.node;
  }, [feeds, feedSlugOrId]);
  const feedId = feed?.id;

  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings({ feedId, enabled: !!feedId });
  const [isPreviewFeedVisible, setPreviewFeedVisible] = useState(true);
  const isPreviewFeedEnabled = feedSettings?.includeTags?.length >= 1;
  const [isDirty, setDirty] = useState(false);
  const [tagsToRemove, setTagsToRemove] = useState<Record<string, true>>(
    () => ({}),
  );

  const onValidateAction = () => {
    return !isDirty;
  };

  const { onAskConfirmation } = useExitConfirmation({
    message: discardPrompt.description as string,
    onValidateAction,
  });

  const { mutateAsync: onSubmit, isLoading } = useMutation(
    async ({ name }: EditFeedFormProps) => {
      const result = await updateFeed({ feedId, name });
      const tagPromises = [
        gqlClient.request(ADD_FILTERS_TO_FEED_MUTATION, {
          feedId: result.id,
          filters: {
            includeTags: feedSettings?.includeTags || [],
          },
        }),
      ];

      const removedTags = Object.keys(tagsToRemove);

      if (removedTags.length > 0) {
        tagPromises.push(
          gqlClient.request(REMOVE_FILTERS_FROM_FEED_MUTATION, {
            feedId: result.id,
            filters: {
              includeTags: removedTags,
            },
          }),
        );
      }

      await Promise.all(tagPromises);

      return result;
    },
    {
      onSuccess: (data) => {
        logEvent({
          event_name: LogEvent.UpdateCustomFeed,
          target_id: data.id,
        });

        queryClient.removeQueries(getFeedSettingsQueryKey(user, feedId));
        queryClient.removeQueries(
          generateQueryKey(SharedFeedPage.Custom, user),
        );

        onAskConfirmation(false);
        router.replace(`${webappUrl}feeds/${data.id}`);
      },
      onError: (error) => {
        const clientErrors = (error as ClientError)?.response?.errors || [];

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

  const { mutateAsync: onDelete, status: deleteStatus } = useMutation(
    async () => {
      const shouldDelete = await showPrompt({
        title: `Delete ${feed?.flags?.name || 'feed'}?`,
        description: labels.feed.prompt.delete.description,
        okButton: {
          title: labels.feed.prompt.delete.okButton,
          color: ButtonColor.Ketchup,
        },
      });

      if (!shouldDelete) {
        throw new Error('User cancelled deletion');
      }

      const result = await deleteFeed({ feedId });

      return result;
    },
    {
      onSuccess: (data) => {
        logEvent({
          event_name: LogEvent.DeleteCustomFeed,
          target_id: data.id,
        });

        queryClient.removeQueries(getFeedSettingsQueryKey(user, feedId));

        onAskConfirmation(false);
        router.replace(webappUrl);
      },
    },
  );

  const shouldRedirectToNewFeed =
    feeds && feedSlugOrId && deleteStatus === 'idle';

  useEffect(() => {
    if (!shouldRedirectToNewFeed) {
      return;
    }

    if (!feed) {
      router.push(`${webappUrl}feeds/new`);
    }
  }, [shouldRedirectToNewFeed, feed, router]);

  const cleanupRef = useRef<() => void>();
  cleanupRef.current = () => {
    queryClient.removeQueries(getFeedSettingsQueryKey(user, feedId));
  };

  useEffect(() => {
    return () => {
      // cleanup on discard or navigation without save
      cleanupRef.current();
    };
  }, []);

  if (!feed) {
    return null;
  }

  const seo: NextSeoProps = {
    title: getTemplatedTitle('Edit feed'),
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

              const { name } = formToJson<EditFeedFormProps>(e.currentTarget);

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

                  router.push(`${webappUrl}feeds/${feedId}`);
                }
              }}
              onDelete={onDelete}
            >
              <p className="font-bold typo-title3">Edit tags</p>
            </FeedCustomActions>
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
              maxLength={50}
            />
          </form>

          <div className="flex w-full max-w-full flex-col">
            <FilterOnboardingV4
              className="mt-10 px-4 pt-0 tablet:px-10"
              shouldUpdateAlerts={false}
              shouldFilterLocally
              feedId={feedId}
              onClickTag={({ tag, action }) => {
                setDirty(true);

                if (action === 'follow') {
                  setTagsToRemove((current) => {
                    const newTags = { ...current };
                    delete newTags[tag.name];

                    return newTags;
                  });
                } else {
                  setTagsToRemove((current) => {
                    return { ...current, [tag.name]: true };
                  });
                }
              }}
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
          <FeedCustomPreview feedId={feedId} />
        )}
      </FeedPageLayoutComponent>
    </>
  );
};

EditFeedPage.getLayout = getLayout;
EditFeedPage.layoutProps = mainFeedLayoutProps;

export default EditFeedPage;
