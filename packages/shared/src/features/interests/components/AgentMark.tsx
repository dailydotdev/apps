import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { MagicIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { UserInterestStatus } from '../../../graphql/interests';

export const agentStateLabel = ({
  status,
  isWorking,
}: {
  status: UserInterestStatus;
  isWorking?: boolean;
}): string => {
  if (isWorking) {
    return 'Working';
  }

  return status === UserInterestStatus.Active ? 'Hunting' : 'Paused';
};

/**
 * An agent as one object: its mark, with its run state as a dot.
 *
 * The same thing on the workspace header and on every card of the home
 * screen, so an agent is recognisable before its name is read.
 */
export const AgentMark = ({
  status,
  isWorking,
}: {
  status: UserInterestStatus;
  isWorking?: boolean;
}): ReactElement => (
  <span className="relative flex size-8 shrink-0 items-center justify-center rounded-10 bg-brand-float">
    <MagicIcon size={IconSize.XSmall} className="text-brand-default" />
    <span
      className={classNames(
        // The 2px cut-out ring eats most of a small dot, so the box has to be
        // generous for the colour inside it to register at all.
        'absolute -bottom-0.5 -right-0.5 size-3 rounded-6 border-2 border-background-default',
        // eslint-disable-next-line no-nested-ternary
        isWorking
          ? 'animate-pulse bg-brand-default'
          : status === UserInterestStatus.Active
          ? 'bg-action-upvote-default'
          : 'bg-text-quaternary',
      )}
    />
  </span>
);
