import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import InteractionCounter from '@dailydotdev/shared/src/components/InteractionCounter';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import type { Plugin } from '@dailydotdev/shared/src/graphql/plugins';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { useVotePlugin } from '@dailydotdev/shared/src/hooks/vote/useVotePlugin';

interface PluginUpvoteButtonProps {
  plugin: Plugin;
  className?: string;
}

export const PluginUpvoteButton = ({
  plugin,
  className,
}: PluginUpvoteButtonProps): ReactElement => {
  const { toggleUpvote } = useVotePlugin();
  const isUpvoted = plugin.userVote === UserVote.Up;

  return (
    <Tooltip content={isUpvoted ? 'Remove upvote' : 'Upvote'} side="bottom">
      <QuaternaryButton
        id={`plugin-${plugin.id}-upvote-btn`}
        labelClassName="!pl-[1px]"
        className={classNames('btn-tertiary-avocado', className)}
        color={ButtonColor.Avocado}
        pressed={isUpvoted}
        onClick={() => toggleUpvote(plugin)}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<UpvoteIcon secondary={isUpvoted} size={IconSize.Small} />}
      >
        {plugin.upvotes > 0 && (
          <InteractionCounter
            className="tabular-nums typo-footnote"
            value={plugin.upvotes}
          />
        )}
      </QuaternaryButton>
    </Tooltip>
  );
};
