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
  user: UserShortProfile;
  feedId?: string;
}) => {
  const router = useRouter();
  const { follow, unfollow } = useContentPreference();

  const onCreateNewFeed = () => {
    router.push(
      `${webappUrl}feeds/new?entityId=${user.id}&entityType=${ContentPreferenceType.User}`,
    );
  };

  const onUndo = () => {
    unfollow({
      id: user.id,
      entity: ContentPreferenceType.User,
      entityName: user.username,
      feedId,
    });
  };

  const onAdd = () => {
    follow({
      id: user.id,
      entity: ContentPreferenceType.User,
      entityName: user.username,
      feedId,
    });
  };

  const shareProps: UseShareOrCopyLinkProps = {
    text: `Check out ${user.username} on daily.dev`,
    link: user.permalink,
    cid: ReferralCampaignKey.ShareProfile,
    logObject: () => ({
      event_name: LogEvent.ShareProfile,
      target_id: user.id,
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
