import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ContentLanguage } from '../lib/user';
import { useAuthContext } from '../contexts/AuthContext';
import { UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import { useLogContext } from '../contexts/LogContext';
import user from '../../__tests__/fixture/loggedUser';
import { SharedFeedPage } from '../components/utilities';
import { gqlClient } from '../graphql/common';
import { labels } from '../lib';
import { LogEvent, TargetType } from '../lib/log';
import { OtherFeedPage, RequestKey } from '../lib/query';
import { useToastNotification } from './useToastNotification';

export type UseLanguage = {
  onLanguageChange: (value?: ContentLanguage) => void;
};

export const useLanguage = (): UseLanguage => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();

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

  return {
    onLanguageChange,
  };
};
