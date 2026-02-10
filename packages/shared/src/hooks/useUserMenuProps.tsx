import { useRouter } from 'next/router';
import { useContentPreference } from './contentPreference/useContentPreference';
import { webappUrl } from '../lib/constants';
import type { UserShortProfile } from '../lib/user';
import { ContentPreferenceType } from '../graphql/contentPreference';
import { LogEvent } from '../lib/log';
import { ReferralCampaignKey } from '../lib';
import type { UseShareOrCopyLinkProps } from './useShareOrCopyLink';

const useUserMenuProps = ({
  user,
  feedId,
}: {
  user?: UserShortProfile | null;
  feedId?: string;
}) => {
  const router = useRouter();
  const { follow, unfollow } = useContentPreference();
  const userId = user?.id;
  const username = user?.username;
  const permalink = user?.permalink;

  const onCreateNewFeed = () => {
    if (!userId) {
      return;
    }

    router.push(
      `${webappUrl}feeds/new?entityId=${userId}&entityType=${ContentPreferenceType.User}`,
    );
  };

  const onUndo = () => {
    if (!userId || !username) {
      return;
    }

    unfollow({
      id: userId,
      entity: ContentPreferenceType.User,
      entityName: username,
      feedId,
    });
  };

  const onAdd = () => {
    if (!userId || !username) {
      return;
    }

    follow({
      id: userId,
      entity: ContentPreferenceType.User,
      entityName: username,
      feedId,
    });
  };

  const shareProps: UseShareOrCopyLinkProps = {
    text: username
      ? `Check out ${username} on daily.dev`
      : 'Check out this developer on daily.dev',
    link: permalink || webappUrl,
    cid: ReferralCampaignKey.ShareProfile,
    logObject: () => ({
      event_name: LogEvent.ShareProfile,
      ...(userId ? { target_id: userId } : {}),
    }),
  };

  return {
    onUndo,
    onAdd,
    onCreateNewFeed,
    shareProps,
  };
};

export default useUserMenuProps;
