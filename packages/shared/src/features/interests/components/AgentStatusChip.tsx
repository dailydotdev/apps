import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexRow } from '../../../components/utilities';
import { UserInterestStatus } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';

/** The run state as a glance, next to the name it belongs to. */
export const AgentStatusChip = (): ReactElement => {
  const { status, isWorking } = useAgent();
  const isRunning = status === UserInterestStatus.Active;

  return (
    <FlexRow className="hidden shrink-0 items-center gap-1.5 rounded-8 bg-surface-float px-2 py-0.5 tablet:flex">
      <span
        className={classNames(
          'size-1.5 rounded-6',
          // eslint-disable-next-line no-nested-ternary
          isWorking
            ? 'animate-pulse bg-brand-default'
            : isRunning
            ? 'bg-action-upvote-default'
            : 'bg-text-quaternary',
        )}
      />
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
      >
        {/* eslint-disable-next-line no-nested-ternary */}
        {isWorking ? 'Working' : isRunning ? 'Hunting' : 'Paused'}
      </Typography>
    </FlexRow>
  );
};
