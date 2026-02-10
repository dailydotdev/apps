import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import type { AgentStatus } from '../types';
import { AgentStatusType } from '../types';

const statusConfig: Record<
  AgentStatusType,
  {
    label: string;
    dotClass: string;
    labelClass: string;
    borderClass: string;
    badgeClass: string;
  }
> = {
  [AgentStatusType.Working]: {
    label: 'Running',
    dotClass: 'bg-status-success',
    labelClass: 'text-status-success',
    borderClass: 'border-l-status-success',
    badgeClass:
      'bg-status-success/16 text-status-success border border-status-success/24',
  },
  [AgentStatusType.Waiting]: {
    label: 'Needs input',
    dotClass: 'bg-status-warning',
    labelClass: 'text-status-warning',
    borderClass: 'border-l-status-warning',
    badgeClass:
      'bg-status-warning/16 text-status-warning border border-status-warning/24',
  },
  [AgentStatusType.Error]: {
    label: 'Needs attention',
    dotClass: 'bg-status-error',
    labelClass: 'text-status-error',
    borderClass: 'border-l-status-error',
    badgeClass:
      'bg-status-error/16 text-status-error border border-status-error/24',
  },
  [AgentStatusType.Completed]: {
    label: 'Done',
    dotClass: 'bg-status-success',
    labelClass: 'text-status-success',
    borderClass: 'border-l-brand-default',
    badgeClass:
      'bg-brand-default/16 text-brand-default border border-brand-default/24',
  },
  [AgentStatusType.Idle]: {
    label: 'Idle',
    dotClass: 'bg-text-disabled',
    labelClass: 'text-text-disabled',
    borderClass: 'border-l-text-disabled',
    badgeClass:
      'bg-text-disabled/16 text-text-disabled border border-text-disabled/24',
  },
};

function StatusDot({ status }: { status: AgentStatusType }): ReactElement {
  const config = statusConfig[status] ?? statusConfig[AgentStatusType.Idle];
  const isWaiting = status === AgentStatusType.Waiting;
  const isWorking = status === AgentStatusType.Working;

  if (isWaiting) {
    return (
      <span className="relative flex h-2 w-2">
        <span
          className={classNames(
            'opacity-60 absolute inline-flex h-full w-full rounded-full',
            config.dotClass,
            'animate-glow-ring',
          )}
        />
        <span
          className={classNames(
            'relative inline-flex h-2 w-2 rounded-full',
            config.dotClass,
          )}
        />
      </span>
    );
  }

  return (
    <span
      className={classNames(
        'block h-2 w-2 rounded-full',
        config.dotClass,
        isWorking && 'animate-breathe',
      )}
    />
  );
}

function AgentRow({ agent }: { agent: AgentStatus }): ReactElement {
  const config =
    statusConfig[agent.status] ?? statusConfig[AgentStatusType.Idle];
  const isWaiting = agent.status === AgentStatusType.Waiting;
  const details = agent.message || agent.task;

  let rowClass =
    'border-border-subtlest-tertiary bg-surface-float hover:bg-surface-hover';

  if (isWaiting) {
    rowClass = 'border-status-warning/24 bg-status-warning/8';
  }

  return (
    <div
      className={classNames(
        'flex items-start gap-3 rounded-10 border border-l-2 px-3 py-2.5 transition-all duration-200',
        'hover:shadow-sm hover:-translate-y-px',
        config.borderClass,
        rowClass,
      )}
    >
      <div className="mt-1 flex shrink-0 items-center">
        <StatusDot status={agent.status} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <Typography
            type={TypographyType.Footnote}
            bold
            className="min-w-0 flex-1 truncate"
          >
            {agent.name}
          </Typography>
          <span
            className={classNames(
              'shrink-0 truncate rounded-6 px-1.5 py-0.5 text-right font-bold typo-caption2',
              config.badgeClass,
            )}
          >
            {config.label}
          </span>
        </div>
        {agent.project && (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            className="truncate"
          >
            {agent.project}
          </Typography>
        )}
        {details && (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Secondary}
            className="mt-0.5 truncate"
          >
            {details}
          </Typography>
        )}
      </div>
    </div>
  );
}

interface AgentStatusPanelProps {
  agents: AgentStatus[];
}

const byNewest = (a: AgentStatus, b: AgentStatus): number => {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
};

export function AgentStatusPanel({
  agents,
}: AgentStatusPanelProps): ReactElement {
  const waitingAgents = agents
    .filter((agent) => agent.status === AgentStatusType.Waiting)
    .sort(byNewest);
  const runningAgents = agents
    .filter((agent) => agent.status === AgentStatusType.Working)
    .sort(byNewest);
  const errorAgents = agents
    .filter((agent) => agent.status === AgentStatusType.Error)
    .sort(byNewest);
  const completedAgents = agents
    .filter((agent) => agent.status === AgentStatusType.Completed)
    .sort(byNewest);

  if (agents.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          className="mb-1"
        >
          No active agents
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Disabled}
        >
          Status will appear when an agent starts working
        </Typography>
      </div>
    );
  }

  const sections: { title: string; agents: AgentStatus[] }[] = [
    { title: 'Needs your input', agents: waitingAgents },
    { title: 'Running', agents: runningAgents },
    { title: 'Issues', agents: errorAgents },
    { title: 'Done', agents: completedAgents },
  ];

  return (
    <div className="flex max-h-80 flex-col gap-2 overflow-y-auto p-2">
      {sections.map((section) => {
        if (section.agents.length === 0) {
          return null;
        }

        return (
          <div key={section.title} className="flex flex-col gap-0.5">
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="px-2 pb-1 pt-0.5"
            >
              {section.title} ({section.agents.length})
            </Typography>
            {section.agents.map((agent) => (
              <AgentRow
                key={`${agent.name}-${agent.project}-${agent.timestamp}`}
                agent={agent}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
