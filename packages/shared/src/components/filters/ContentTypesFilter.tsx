import React, { ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FilterCheckbox } from '../fields/FilterCheckbox';
import { useAdvancedSettings } from '../../hooks/feed';
import useFeedSettings from '../../hooks/useFeedSettings';
import { getVideoSetting } from './helpers';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Divider, SharedFeedPage } from '../utilities';
import { LanguageDropdown } from '../profile/LanguageDropdown';
import { useAuthContext } from '../../contexts/AuthContext';
import { ContentLanguage } from '../../lib/user';
import { UPDATE_USER_PROFILE_MUTATION } from '../../graphql/users';
import { gqlClient } from '../../graphql/common';
import { useToastNotification } from '../../hooks';
import { labels } from '../../lib';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { OtherFeedPage, RequestKey } from '../../lib/query';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';

export function ContentTypesFilter(): ReactElement {
  const postTitleLanguageFeature = useFeature(feature.postTitleLanguage);
  const queryClient = useQueryClient();
  const { advancedSettings, isLoading } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();
  const { user, updateUser } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

  const videoSetting = getVideoSetting(advancedSettings);

  const { mutate: onLanguageChange } = useMutation(
    async (value?: ContentLanguage) => {
      await updateUser({
        ...user,
        language: value,
      });

      await gqlClient.request(UPDATE_USER_PROFILE_MUTATION, {
        data: {
          language: value,
        },
      });
    },
    {
      onMutate: (value) => {
        logEvent({
          event_name: LogEvent.ChangeSettings,
          target_type: TargetType.Language,
          target_id: value,
        });
      },
      onSuccess: async () => {
        const requestKeys = [
          ...Object.values(SharedFeedPage),
          OtherFeedPage.Preview,
          RequestKey.Squad,
          RequestKey.FeedPreview,
          RequestKey.FeedPreviewCustom,
          RequestKey.PostKey,
          RequestKey.Bookmarks,
          RequestKey.ReadingHistory,
          RequestKey.RelatedPosts,
          RequestKey.SourceFeed,
          RequestKey.SourceMostUpvoted,
          RequestKey.SourceBestDiscussed,
          RequestKey.TagFeed,
          RequestKey.TagsMostUpvoted,
          RequestKey.TagsBestDiscussed,
        ];

        await Promise.all(
          requestKeys.map((requestKey) => {
            const queryKey = [requestKey];

            return queryClient.invalidateQueries({
              queryKey,
              exact: false,
              type: 'all',
            });
          }),
        );
      },
      onError: () => {
        displayToast(labels.error.generic);
      },
    },
  );

  return (
    <div className="flex flex-col gap-4 px-6">
      {postTitleLanguageFeature && (
        <>
          <section className="flex flex-col gap-4" aria-busy={isLoading}>
            <div className="flex flex-col">
              <Typography
                tag={TypographyTag.H3}
                color={TypographyColor.Primary}
                type={TypographyType.Body}
                bold
                className="mb-1"
              >
                Preferred language
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Callout}
              >
                Choose your preferred language for the post titles on the feed
              </Typography>
            </div>
            <LanguageDropdown
              className={{ container: 'w-full max-w-60' }}
              name="language"
              defaultValue={user.language}
              onChange={(value) => onLanguageChange(value)}
              icon={null}
            />
          </section>
          <Divider className="bg-border-subtlest-tertiary" />
        </>
      )}
      <section className="flex flex-col gap-4" aria-busy={isLoading}>
        <div className="flex flex-col">
          <Typography
            tag={TypographyTag.H3}
            color={TypographyColor.Primary}
            type={TypographyType.Body}
            bold
            className="mb-1"
          >
            Content type
          </Typography>
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Callout}
          >
            Show or hide content from your feed
          </Typography>
        </div>
        <div className="flex flex-col">
          {videoSetting && (
            <FilterCheckbox
              name={videoSetting.title}
              checked={
                selectedSettings[videoSetting.id] ??
                videoSetting.defaultEnabledState
              }
              onToggle={() =>
                onToggleSettings(
                  videoSetting.id,
                  videoSetting.defaultEnabledState,
                )
              }
            >
              {videoSetting.title}
            </FilterCheckbox>
          )}
          <FilterCheckbox name="Articles" disabled checked>
            Articles
          </FilterCheckbox>
        </div>
      </section>
    </div>
  );
}
