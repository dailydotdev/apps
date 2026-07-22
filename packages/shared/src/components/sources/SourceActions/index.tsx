import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { ButtonVariant } from '../../buttons/common';
import type { Source } from '../../../graphql/sources';
import { ReferralCampaignKey, useSourceActions } from '../../../hooks';
import SourceActionsNotify from './SourceActionsNotify';
import SourceActionsBlock from './SourceActionsBlock';
import SourceActionsFollow from './SourceActionsFollow';
import CustomFeedOptionsMenu from '../../CustomFeedOptionsMenu';
import { LogEvent, Origin } from '../../../lib/log';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import { useShareTagsSources } from '../../../hooks/useShareTagsSources';
import { EntityShareAction } from '../../share/EntityShareAction';

interface SourceActionsButton {
  className?: string;
  variant?: ButtonVariant;
}

export interface SourceActionsProps {
  source: Source;
  blockProps?: SourceActionsButton;
  hideBlock?: boolean;
  followProps?: SourceActionsButton;
  hideFollow?: boolean;
  notifyProps?: SourceActionsButton;
  hideNotify?: boolean;
  /**
   * Opt in to the visible share control (source page header). Off by default so
   * embedded consumers, e.g. the post page highlights widget, keep their
   * existing DOM.
   */
  showShare?: boolean;
}

export const SourceActions = ({
  blockProps,
  followProps,
  hideBlock = false,
  hideFollow = false,
  hideNotify = false,
  source,
  notifyProps,
  showShare = false,
}: SourceActionsProps): ReactElement => {
  const {
    isBlocked,
    toggleBlock,
    isFollowing,
    toggleFollow,
    haveNotificationsOn,
    toggleNotify,
  } = useSourceActions({
    source,
  });
  const { follow, unfollow } = useContentPreference();
  const router = useRouter();
  const isShareVisible = useShareTagsSources(showShare);

  const shareProps = {
    text: `Check out ${source.handle} on daily.dev`,
    link: source.permalink,
    cid: ReferralCampaignKey.ShareSource,
  };

  return (
    <div className="inline-flex flex-row gap-2">
      {!hideFollow && !isBlocked && (
        <SourceActionsFollow
          isFetching={false}
          isSubscribed={isFollowing}
          onClick={toggleFollow}
          variant={ButtonVariant.Primary}
          {...followProps}
        />
      )}
      {!hideNotify && isFollowing && (
        <SourceActionsNotify
          haveNotificationsOn={haveNotificationsOn}
          onClick={toggleNotify}
          {...notifyProps}
        />
      )}
      {!hideBlock && !isFollowing && (
        <SourceActionsBlock
          isBlocked={isBlocked}
          onClick={toggleBlock}
          {...blockProps}
        />
      )}
      {isShareVisible && (
        <EntityShareAction
          {...shareProps}
          event={LogEvent.ShareSource}
          targetId={source.id ?? source.handle}
          origin={Origin.SourcePage}
        />
      )}
      <CustomFeedOptionsMenu
        hideShare={isShareVisible}
        onCreateNewFeed={() =>
          router.push(
            `/feeds/new?entityId=${source.id}&entityType=${ContentPreferenceType.Source}`,
          )
        }
        onAdd={(feedId) =>
          follow({
            id: source.id,
            entity: ContentPreferenceType.Source,
            entityName: source.handle,
            feedId,
          })
        }
        onUndo={(feedId) =>
          unfollow({
            id: source.id,
            entity: ContentPreferenceType.Source,
            entityName: source.handle,
            feedId,
          })
        }
        shareProps={{
          ...shareProps,
          logObject: () => ({
            event_name: LogEvent.ShareSource,
            target_id: source.id,
          }),
        }}
      />
    </div>
  );
};

export default SourceActions;
