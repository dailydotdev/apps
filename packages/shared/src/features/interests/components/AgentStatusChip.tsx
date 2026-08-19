import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { UserInterestStatus } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';

const statusCopy: Record<UserInterestStatus, { label: string; dot: string }> = {
  [UserInterestStatus.Active]: {
    label: 'Hunting',
    dot: 'bg-action-upvote-default',
  },
  [UserInterestStatus.Paused]: { label: 'Paused', dot: 'bg-text-quaternary' },
  [UserInterestStatus.Stopped]: { label: 'Stopped', dot: 'bg-text-quaternary' },
};

export const AgentStatusChip = ({
  compact = false,
}: {
  compact?: boolean;
}): ReactElement => {
  const { interest, isWorking } = useAgent();
  const { label, dot } =
    statusCopy[interest?.status ?? UserInterestStatus.Active];

  return (
    <span
      className={classNames(
        'flex shrink-0 items-center gap-1.5 rounded-8 bg-surface-secondary',
        isWorking && 'bg-action-bookmark-float',
        compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5',
      )}
    >
      <span
        className={classNames(
          'size-1.5 rounded-6',
          isWorking ? 'animate-pulse bg-brand-default' : dot,
        )}
      />
      <Typography
        type={compact ? TypographyType.Caption2 : TypographyType.Caption1}
        bold
      >
        {isWorking ? 'Working' : label}
      </Typography>
    </span>
  );
};
