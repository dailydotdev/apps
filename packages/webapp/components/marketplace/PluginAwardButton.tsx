import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { iconSizeToClassName } from '@dailydotdev/shared/src/components/Icon';
import { MedalBadgeIcon } from '@dailydotdev/shared/src/components/icons/MedalBadge';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import InteractionCounter from '@dailydotdev/shared/src/components/InteractionCounter';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { FEED_ACTION_BUTTON_SIZE } from '@dailydotdev/shared/src/components/cards/common/actionCounter';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { Plugin } from '@dailydotdev/shared/src/graphql/plugins';
import { useCanAwardUser } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { usePluginAwardSubscription } from '@dailydotdev/shared/src/hooks/usePluginAwardSubscription';
import { pluralize } from '@dailydotdev/shared/src/lib/strings';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { getPluginActionIconSize } from './PluginUpvoteButton';

interface PluginAwardButtonProps {
  plugin: Plugin;
  className?: string;
  large?: boolean;
}

export const PluginAwardButton = ({
  plugin,
  className,
  large = false,
}: PluginAwardButtonProps): ReactElement | null => {
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const isAuthor = !!user?.id && user.id === plugin.author.id;
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: plugin.author as LoggedUser,
  });
  usePluginAwardSubscription(plugin.id);

  if (!canAward && !isAuthor) {
    return null;
  }

  const iconSize = getPluginActionIconSize(large);
  const featuredAward = plugin.featuredAward?.award;

  const openAwardModal = () => {
    if (isAuthor || plugin.awarded) {
      openModal({
        type: LazyModal.ListAwards,
        props: {
          queryProps: { id: plugin.id, type: 'PLUGIN' },
        },
      });
      return;
    }

    openModal({
      type: LazyModal.GiveAward,
      props: {
        type: 'PLUGIN',
        entity: {
          id: plugin.id,
          receiver: plugin.author,
          numAwards: plugin.numAwards,
        },
      },
    });
  };

  return (
    <Tooltip
      content={
        plugin.awarded
          ? 'You already awarded this plugin!'
          : 'Award this plugin'
      }
      side="bottom"
    >
      <QuaternaryButton
        id={`plugin-${plugin.id}-award-btn`}
        labelClassName="!pl-1 pr-1"
        className={classNames('btn-tertiary-cabbage', className)}
        color={ButtonColor.Cabbage}
        pressed={!!plugin.awarded}
        onClick={openAwardModal}
        variant={ButtonVariant.Tertiary}
        size={large ? ButtonSize.Small : FEED_ACTION_BUTTON_SIZE}
        icon={
          plugin.numAwards > 0 && featuredAward?.image ? (
            <Image
              src={featuredAward.image}
              alt={featuredAward.name}
              className={iconSizeToClassName[iconSize]}
            />
          ) : (
            <MedalBadgeIcon secondary size={iconSize} />
          )
        }
      >
        <span className="flex items-center gap-1">
          {plugin.numAwards > 0 && (
            <InteractionCounter
              className="tabular-nums typo-callout"
              value={plugin.numAwards}
            />
          )}
          <span className="typo-callout">
            {pluralize('Award', Math.max(plugin.numAwards, 1))}
          </span>
        </span>
      </QuaternaryButton>
    </Tooltip>
  );
};
