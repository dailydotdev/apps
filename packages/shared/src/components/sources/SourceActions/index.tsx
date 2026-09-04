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
import { CopyLinkButton } from '../../share/CopyLinkButton';
import { LogEvent } from '../../../lib/log';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import type { ContentPreferenceMutation } from '../../../hooks/contentPreference/types';

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
  showCopyLink?: boolean;
}

export const SourceActions = ({
  blockProps,
  followProps,
  hideBlock = false,
  hideFollow = false,
  hideNotify = false,
  source,
  notifyProps,
  showCopyLink = false,
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

  const updateCustomFeed = (
    mutate: ContentPreferenceMutation,
    feedId: string,
  ) => {
    if (!source.id) {
      throw new Error('Cannot update a custom feed for a source without an id');
    }

    return mutate({
      id: source.id,
      entity: ContentPreferenceType.Source,
      entityName: source.handle,
      feedId,
    });
  };

  const shareProps = {
    text: `Check out ${source.handle} on daily.dev`,
    link: source.permalink,
    cid: ReferralCampaignKey.ShareSource,
    logObject: () => ({
      event_name: LogEvent.ShareSource,
      target_id: source.id,
    }),
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
      {showCopyLink && <CopyLinkButton shareProps={shareProps} />}
      <CustomFeedOptionsMenu
        onCreateNewFeed={() =>
          router.push(
            `/feeds/new?entityId=${source.id}&entityType=${ContentPreferenceType.Source}`,
          )
        }
        onAdd={(feedId) => updateCustomFeed(follow, feedId)}
        onUndo={(feedId) => updateCustomFeed(unfollow, feedId)}
        shareProps={shareProps}
      />
    </div>
  );
};

export default SourceActions;
