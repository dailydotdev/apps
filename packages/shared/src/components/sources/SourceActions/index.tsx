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
import { EntityShareAction } from '../../share/EntityShareAction';
import { MenuIcon } from '../../MenuIcon';
import { BlockIcon } from '../../icons';

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
   * Opt in to the header treatment: the visible share control, Block moved into
   * the "…" menu and the bell restyled to match. Off by default so embedded
   * consumers, e.g. the post page highlights widget, keep their existing row.
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

  // `Source['id']` is optional on the model; the handle is the stable fallback
  // every consumer of this row can rely on.
  const sourceId = source.id ?? source.handle;

  const shareProps = {
    text: `Check out ${source.handle} on daily.dev`,
    link: source.permalink,
    cid: ReferralCampaignKey.ShareSource,
  };

  const canBlock = !hideBlock && !isFollowing;
  // With the share control in the row, Block moves into the "…" menu so the row
  // is one Follow button plus identical secondary controls. Blocked is the
  // exception: Unblock is the only way back, so it stays visible — in the
  // Follow slot, which is empty while blocked.
  const showBlockInRow = showShare ? canBlock && isBlocked : canBlock;
  const blockOptions =
    showShare && canBlock && !isBlocked
      ? [
          {
            icon: <MenuIcon Icon={BlockIcon} />,
            label: 'Block',
            action: toggleBlock,
          },
        ]
      : [];

  // Sits before the block button in the original row and after the share
  // control in the header row, so it is defined once and placed twice.
  const notifyButton = !hideNotify && isFollowing && (
    <SourceActionsNotify
      haveNotificationsOn={haveNotificationsOn}
      onClick={toggleNotify}
      // Float so the bell, the share control and the "…" button read as one
      // treatment; the state still comes through in the icon.
      {...(showShare && { variant: ButtonVariant.Float })}
      {...notifyProps}
    />
  );

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
      {!showShare && notifyButton}
      {showBlockInRow && (
        <SourceActionsBlock
          isBlocked={isBlocked}
          onClick={toggleBlock}
          {...blockProps}
        />
      )}
      {showShare && (
        <EntityShareAction
          {...shareProps}
          event={LogEvent.ShareSource}
          targetId={sourceId}
          origin={Origin.SourcePage}
        />
      )}
      {showShare && notifyButton}
      <CustomFeedOptionsMenu
        hideShare={showShare}
        additionalOptions={blockOptions}
        onCreateNewFeed={() =>
          router.push(
            `/feeds/new?entityId=${source.id}&entityType=${ContentPreferenceType.Source}`,
          )
        }
        onAdd={(feedId) =>
          follow({
            id: sourceId,
            entity: ContentPreferenceType.Source,
            entityName: source.handle,
            feedId,
          })
        }
        onUndo={(feedId) =>
          unfollow({
            id: sourceId,
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
