import React, { ReactElement } from 'react';
import { ButtonVariant } from '../../buttons/common';
import { Source } from '../../../graphql/sources';
import { ReferralCampaignKey, useSourceActions } from '../../../hooks';
import SourceActionsNotify from './SourceActionsNotify';
import SourceActionsBlock from './SourceActionsBlock';
import SourceActionsFollow from './SourceActionsFollow';
import CustomFeedOptionsMenu from '../../CustomFeedOptionsMenu';
import { LogEvent } from '../../../lib/log';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import { ContentPreferenceType } from '../../../graphql/contentPreference';

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
}

export const SourceActions = ({
  blockProps,
  followProps,
  hideBlock = false,
  hideFollow = false,
  hideNotify = false,
  source,
  notifyProps,
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
      <CustomFeedOptionsMenu
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
          text: `Check out ${source.handle} on daily.dev`,
          link: source.permalink,
          cid: ReferralCampaignKey.ShareSource,
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
