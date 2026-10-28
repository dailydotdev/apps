import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import InteractionCounter from '@dailydotdev/shared/src/components/InteractionCounter';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { UpvoteButtonIcon } from '@dailydotdev/shared/src/components/cards/common/UpvoteButtonIcon';
import { FEED_ACTION_BUTTON_SIZE } from '@dailydotdev/shared/src/components/cards/common/actionCounter';
import type { Plugin } from '@dailydotdev/shared/src/graphql/plugins';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { pluralize } from '@dailydotdev/shared/src/lib/strings';
import { useVotePlugin } from '@dailydotdev/shared/src/hooks/vote/useVotePlugin';

export const getPluginActionIconSize = (large: boolean): IconSize =>
  large ? IconSize.Small : IconSize.XSmall;

interface PluginUpvoteButtonProps {
  plugin: Plugin;
  className?: string;
  large?: boolean;
}

export const PluginUpvoteButton = ({
  plugin,
  className,
  large = false,
}: PluginUpvoteButtonProps): ReactElement => {
  const { toggleUpvote } = useVotePlugin();
  const isUpvoted = plugin.userVote === UserVote.Up;

  return (
    <Tooltip content={isUpvoted ? 'Remove upvote' : 'Upvote'} side="bottom">
      <QuaternaryButton
        id={`plugin-${plugin.id}-upvote-btn`}
        labelClassName="!pl-1 pr-1"
        className={classNames('btn-tertiary-avocado', className)}
        color={ButtonColor.Avocado}
        pressed={isUpvoted}
        onClick={() => toggleUpvote(plugin)}
        variant={ButtonVariant.Tertiary}
        size={large ? ButtonSize.Small : FEED_ACTION_BUTTON_SIZE}
        icon={
          <UpvoteButtonIcon
            secondary={isUpvoted}
            size={getPluginActionIconSize(large)}
          />
        }
      >
        <span className="flex items-center gap-1">
          {plugin.upvotes > 0 && (
            <InteractionCounter
              className="tabular-nums typo-callout"
              value={plugin.upvotes}
            />
          )}
          <span className="typo-callout">
            {pluralize('Upvote', Math.max(plugin.upvotes, 1))}
          </span>
        </span>
      </QuaternaryButton>
    </Tooltip>
  );
};
