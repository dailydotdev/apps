import type { ReactElement } from 'react';
import React from 'react';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { useAgent } from '../AgentContext';
import { AgentMark, agentStateLabel } from './AgentMark';

/**
 * The agent's mark in the workspace header.
 *
 * It used to open the run popover as well; that now hangs off the gear, so
 * this is the state at a glance and nothing else.
 */
export const AgentStatusTile = (): ReactElement => {
  const { status, isWorking } = useAgent();

  return (
    <Tooltip content={agentStateLabel({ status, isWorking })}>
      {/* A plain element, not the component: a Radix trigger takes a ref, and
          the mark is a function component. */}
      <span className="flex">
        <AgentMark status={status} isWorking={isWorking} />
      </span>
    </Tooltip>
  );
};
