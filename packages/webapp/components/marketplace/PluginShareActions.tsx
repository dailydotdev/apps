import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { FEED_ACTION_BUTTON_SIZE } from '@dailydotdev/shared/src/components/cards/common/actionCounter';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { ProfileSnapshotButton } from '@dailydotdev/shared/src/features/snapshot/ProfileSnapshotButton';
import { PluginSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/PluginSnapshotCard';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import type { Plugin } from '@dailydotdev/shared/src/graphql/plugins';
import { getMarketplacePluginUrl } from '@dailydotdev/shared/src/graphql/plugins';
import type { Origin } from '@dailydotdev/shared/src/lib/log';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import type { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { getPluginActionIconSize } from './PluginUpvoteButton';

interface PluginShareActionsProps {
  plugin: Plugin;
  origin: Origin;
  className?: string;
  large?: boolean;
}

export const PluginShareActions = ({
  plugin,
  origin,
  className,
  large = false,
}: PluginShareActionsProps): ReactElement => {
  const { logEvent } = useLogContext();
  const buttonSize = large ? ButtonSize.Small : FEED_ACTION_BUTTON_SIZE;
  const iconSize = getPluginActionIconSize(large);

  const onShare = useCallback(
    (provider: ShareProvider) =>
      logEvent({
        event_name: LogEvent.SharePlugin,
        target_type: TargetType.Plugin,
        target_id: plugin.id,
        extra: JSON.stringify({ provider, origin }),
      }),
    [logEvent, origin, plugin.id],
  );

  return (
    <span className={classNames('flex items-center gap-1', className)}>
      <ShareActions
        link={getMarketplacePluginUrl(plugin.id)}
        text={`Check out ${plugin.name}`}
        cid={ReferralCampaignKey.SharePlugin}
        origin={origin}
        label="Share plugin"
        icon={<ShareIcon size={iconSize} />}
        buttonVariant={ButtonVariant.Tertiary}
        buttonSize={buttonSize}
        onShare={onShare}
      />
      <ProfileSnapshotButton
        key={plugin.id}
        event={LogEvent.SharePlugin}
        filename={`daily-plugin-${plugin.id}`}
        origin={origin}
        ownerId={plugin.author.id}
        targetId={plugin.id}
        targetType={TargetType.Plugin}
        showLabel={false}
        size={buttonSize}
        iconSize={iconSize}
        variant={ButtonVariant.Tertiary}
        renderCard={(ref) => (
          <PluginSnapshotCard
            added={format(new Date(plugin.createdAt), 'MMM yyyy')}
            author={{
              handle: `@${plugin.author.username}`,
              image: plugin.author.image,
              name: plugin.author.name,
            }}
            awards={plugin.numAwards}
            description={plugin.description}
            name={plugin.name}
            ref={ref}
            seed={plugin.id}
            upvotes={plugin.upvotes}
          />
        )}
      />
    </span>
  );
};
