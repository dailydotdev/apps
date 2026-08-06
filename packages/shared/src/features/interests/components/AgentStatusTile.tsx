import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { MagicIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { UserInterestStatus } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';

/**
 * The agent's mark, carrying its run state as a dot.
 *
 * It used to open the run popover as well; that now hangs off the gear, so
 * this is the state at a glance and nothing else.
 */
export const AgentStatusTile = (): ReactElement => {
  const { status, isWorking } = useAgent();
  const isRunning = status === UserInterestStatus.Active;
  // eslint-disable-next-line no-nested-ternary
  const label = isWorking ? 'Working' : isRunning ? 'Hunting' : 'Paused';

  return (
    <Tooltip content={label}>
      <span className="relative flex size-8 shrink-0 items-center justify-center rounded-10 bg-brand-float">
        <MagicIcon size={IconSize.XSmall} className="text-brand-default" />
        <span
          className={classNames(
            // The 2px cut-out ring eats most of a small dot, so the box has to
            // be generous for the colour inside it to register at all.
            'absolute -bottom-0.5 -right-0.5 size-3 rounded-6 border-2 border-background-default',
            // eslint-disable-next-line no-nested-ternary
            isWorking
              ? 'animate-pulse bg-brand-default'
              : isRunning
              ? 'bg-action-upvote-default'
              : 'bg-text-quaternary',
          )}
        />
      </span>
    </Tooltip>
  );
};
