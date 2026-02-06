import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import { TerminalIcon } from '../../../components/icons';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { SimpleTooltip } from '../../../components/tooltips/SimpleTooltip';
import { useInteractivePopup } from '../../../hooks/utils/useInteractivePopup';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useAgentStatus } from '../hooks/useAgentStatus';
import { AgentStatusType } from '../types';
import { AgentStatusPopup } from './AgentStatusPopup';

export function AgentStatusIndicator(): ReactElement {
  const { agents, isLoading } = useAgentStatus();
  const { displayToast } = useToastNotification();
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup();
  const previousStatusesRef = useRef<Map<string, AgentStatusType>>(new Map());
  const initializedRef = useRef(false);

  const activeAgents = agents.filter(
    (agent) => agent.status !== AgentStatusType.Idle,
  );
  const waitingAgents = activeAgents.filter(
    (agent) => agent.status === AgentStatusType.Waiting,
  );
  const completedAgents = activeAgents.filter(
    (agent) => agent.status === AgentStatusType.Completed,
  );
  const errorAgents = activeAgents.filter(
    (agent) => agent.status === AgentStatusType.Error,
  );
  const runningAgents = activeAgents.filter(
    (agent) => agent.status === AgentStatusType.Working,
  );

  const hasAgents = activeAgents.length > 0;
  const waitingCount = waitingAgents.length;
  const errorCount = errorAgents.length;
  const completedCount = completedAgents.length;
  const runningCount = runningAgents.length;
  const hasWaiting = waitingCount > 0;
  const hasError = errorCount > 0;
  const hasWorking = runningCount > 0;
  const hasCompleted = completedCount > 0;

  const formatCount = (count: number, copy: string): string => {
    return `${count} agent${count > 1 ? 's' : ''} ${copy}`;
  };

  useEffect(() => {
    if (!initializedRef.current) {
      if (isLoading) {
        return;
      }

      previousStatusesRef.current = new Map(
        agents.map((agent) => [`${agent.name}:${agent.project}`, agent.status]),
      );
      initializedRef.current = true;
      return;
    }

    const previousStatuses = previousStatusesRef.current;
    const nextStatuses = new Map<string, AgentStatusType>();
    const newWaitingAgents: string[] = [];
    const newCompletedAgents: string[] = [];

    agents.forEach((agent) => {
      const agentId = `${agent.name}:${agent.project}`;
      const previousStatus = previousStatuses.get(agentId);

      nextStatuses.set(agentId, agent.status);

      if (!previousStatus || previousStatus === agent.status) {
        return;
      }

      if (agent.status === AgentStatusType.Waiting) {
        newWaitingAgents.push(agent.name);
        return;
      }

      if (agent.status === AgentStatusType.Completed) {
        newCompletedAgents.push(agent.name);
      }
    });

    previousStatusesRef.current = nextStatuses;

    if (newWaitingAgents.length > 0) {
      const firstAgent = newWaitingAgents[0];
      const message =
        newWaitingAgents.length === 1
          ? `${firstAgent} needs your input`
          : `${newWaitingAgents.length} agents need your input`;

      displayToast(message);
      return;
    }

    if (newCompletedAgents.length > 0) {
      const firstAgent = newCompletedAgents[0];
      const message =
        newCompletedAgents.length === 1
          ? `${firstAgent} is done`
          : `${newCompletedAgents.length} agents are done`;

      displayToast(message);
    }
  }, [agents, displayToast, isLoading]);

  let dotColor = 'bg-text-disabled';
  if (hasWaiting) {
    dotColor = 'bg-status-warning';
  } else if (hasError) {
    dotColor = 'bg-status-error';
  } else if (hasWorking) {
    dotColor = 'bg-status-success';
  } else if (hasCompleted) {
    dotColor = 'bg-brand-default';
  }

  let tooltipContent = 'No active agents';
  if (hasWaiting) {
    tooltipContent = formatCount(waitingCount, 'need input');
  } else if (hasError) {
    tooltipContent = formatCount(errorCount, 'need attention');
  } else if (hasWorking) {
    tooltipContent = formatCount(runningCount, 'running');
  } else if (hasAgents) {
    tooltipContent = formatCount(completedCount, 'done');
  }

  return (
    <SimpleTooltip
      interactive
      placement="bottom-end"
      visible={isOpen}
      onClickOutside={() => onUpdate(false)}
      showArrow={false}
      container={{
        className:
          'w-72 !rounded-14 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest',
        bgClassName: 'bg-accent-pepper-subtlest',
        textClassName: 'text-text-primary',
        paddingClassName: 'p-0',
      }}
      content={<AgentStatusPopup agents={activeAgents} />}
    >
      <div className="relative">
        <Tooltip side="bottom" content={tooltipContent} visible={!isOpen}>
          <Button
            variant={ButtonVariant.Float}
            className="w-10 justify-center"
            icon={<TerminalIcon />}
            onClick={wrapHandler(() => onUpdate(!isOpen))}
          />
        </Tooltip>
        {hasAgents && (
          <span className="absolute -right-0.5 -top-0.5">
            {hasWaiting && (
              <span
                className={classNames(
                  'absolute inset-0 h-2.5 w-2.5 rounded-full',
                  dotColor,
                  'animate-glow-ring',
                )}
              />
            )}
            <span
              className={classNames(
                'relative block h-2.5 w-2.5 rounded-full border-2 border-background-default transition-colors duration-300',
                dotColor,
                hasWorking && !hasWaiting && !hasError && 'animate-breathe',
              )}
            />
          </span>
        )}
        {waitingCount > 0 && (
          <span className="absolute -bottom-1 -right-1 min-w-4 rounded-6 bg-status-warning px-1 text-center font-bold text-text-primary typo-caption2">
            <span className="relative flex items-center justify-center">
              {waitingCount > 9 ? '9+' : waitingCount}
            </span>
          </span>
        )}
      </div>
    </SimpleTooltip>
  );
}
