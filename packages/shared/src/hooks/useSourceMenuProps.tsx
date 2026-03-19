import { useRouter } from 'next/router';
import { useContentPreference } from './contentPreference/useContentPreference';
import { webappUrl } from '../lib/constants';
import type { SourceTooltip } from '../graphql/sources';
import { ContentPreferenceType } from '../graphql/contentPreference';
import { LogEvent } from '../lib/log';
import { ReferralCampaignKey } from '../lib';
import type { UseShareOrCopyLinkProps } from './useShareOrCopyLink';

const useSourceMenuProps = ({
  source,
  feedId,
}: {
  source?: SourceTooltip | null;
  feedId?: string;
}) => {
  const router = useRouter();
  const { follow, unfollow } = useContentPreference();

  const onCreateNewFeed = () => {
    if (!source?.id) {
      return;
    }

    router.push(
      `${webappUrl}feeds/new?entityId=${source.id}&entityType=${ContentPreferenceType.Source}`,
    );
  };

  const onUndo = () => {
    if (!source?.id || !source.handle) {
      return;
    }

    unfollow({
      id: source.id,
      entity: ContentPreferenceType.Source,
      entityName: source.handle,
      feedId,
    });
  };

  const onAdd = () => {
    if (!source?.id || !source.handle) {
      return;
    }

    follow({
      id: source.id,
      entity: ContentPreferenceType.Source,
      entityName: source.handle,
      feedId,
    });
  };

  const shareProps: UseShareOrCopyLinkProps = {
    text: source?.handle
      ? `Check out ${source.handle} on daily.dev`
      : 'Check out this source on daily.dev',
    link: source?.permalink || webappUrl,
    cid: ReferralCampaignKey.ShareSource,
    logObject: () => ({
      event_name: LogEvent.ShareSource,
      ...(source?.id ? { target_id: source.id } : {}),
    }),
  };

  return {
    onUndo,
    onAdd,
    onCreateNewFeed,
    shareProps,
  };
};

export default useSourceMenuProps;
