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

export const AgentMark = ({
  status,
  isWorking,
  isCompact,
}: {
  status: UserInterestStatus;
  isWorking?: boolean;
  isCompact?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'relative flex shrink-0 items-center justify-center',
      isCompact ? 'size-4' : 'size-8 rounded-10 bg-brand-float',
    )}
  >
    <MagicIcon
      size={isCompact ? IconSize.Size16 : IconSize.XSmall}
      className="text-brand-default"
    />
    <span
      className={classNames(
        // The 2px cut-out ring eats most of the dot, so the box is oversized
        // for the colour inside it to register.
        'absolute rounded-6 border-2 border-background-default',
        isCompact
          ? '-bottom-1 -right-1.5 size-2.5'
          : '-bottom-0.5 -right-0.5 size-3',
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
