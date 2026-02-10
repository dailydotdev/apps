import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { TerminalIcon } from '../../../components/icons';
import type { AgentStatus } from '../types';
import { AgentStatusType } from '../types';
import { AgentStatusPanel } from './AgentStatusPanel';

interface SummaryBadgeProps {
  count: number;
  label: string;
  className: string;
}

function SummaryBadge({
  count,
  label,
  className,
}: SummaryBadgeProps): ReactElement | null {
  if (count === 0) {
    return null;
  }

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 rounded-6 px-1.5 py-0.5 font-bold typo-caption2',
        className,
      )}
    >
      {count} {label}
    </span>
  );
}

interface AgentStatusPopupProps {
  agents: AgentStatus[];
}

export function AgentStatusPopup({
  agents,
}: AgentStatusPopupProps): ReactElement {
  const waitingCount = agents.filter(
    (agent) => agent.status === AgentStatusType.Waiting,
  ).length;
  const runningCount = agents.filter(
    (agent) => agent.status === AgentStatusType.Working,
  ).length;
  const doneCount = agents.filter(
    (agent) => agent.status === AgentStatusType.Completed,
  ).length;

  return (
    <div className="flex w-72 flex-col">
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-3">
        <TerminalIcon className="text-text-tertiary" />
        <Typography type={TypographyType.Footnote} bold>
          Agent Status
        </Typography>
        <div className="ml-auto flex items-center gap-1">
          <SummaryBadge
            count={waitingCount}
            label="input"
            className="bg-status-warning/16 text-status-warning"
          />
          <SummaryBadge
            count={runningCount}
            label="running"
            className="bg-status-success/16 text-status-success"
          />
          <SummaryBadge
            count={doneCount}
            label="done"
            className="bg-brand-default/16 text-brand-default"
          />
        </div>
      </div>
      <AgentStatusPanel agents={agents} />
    </div>
  );
}
