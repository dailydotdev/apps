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
import {
  actionCounterClassName,
  actionCounterLabelClassName,
  FEED_ACTION_BUTTON_SIZE,
  FEED_ACTION_ICON_SIZE,
} from '@dailydotdev/shared/src/components/cards/common/actionCounter';
import type { Plugin } from '@dailydotdev/shared/src/graphql/plugins';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { pluralize } from '@dailydotdev/shared/src/lib/strings';
import { useVotePlugin } from '@dailydotdev/shared/src/hooks/vote/useVotePlugin';

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
        labelClassName={actionCounterLabelClassName}
        className={classNames('btn-tertiary-avocado', className)}
        color={ButtonColor.Avocado}
        pressed={isUpvoted}
        onClick={() => toggleUpvote(plugin)}
        variant={ButtonVariant.Tertiary}
        size={large ? ButtonSize.Small : FEED_ACTION_BUTTON_SIZE}
        icon={
          <UpvoteButtonIcon
            secondary={isUpvoted}
            size={large ? IconSize.XSmall : FEED_ACTION_ICON_SIZE}
          />
        }
      >
        <span className="flex items-center gap-1">
          <InteractionCounter
            className={actionCounterClassName}
            value={plugin.upvotes}
          />
          <span className="typo-footnote">
            {pluralize('upvote', plugin.upvotes)}
          </span>
        </span>
      </QuaternaryButton>
    </Tooltip>
  );
};
