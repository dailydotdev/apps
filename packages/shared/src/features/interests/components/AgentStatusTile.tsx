import type { ReactElement } from 'react';
import React from 'react';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { useAgent } from '../AgentContext';
import { AgentMark, agentStateLabel } from './AgentMark';

export const AgentStatusTile = (): ReactElement => {
  const { status, isWorking } = useAgent();

  return (
    <Tooltip content={agentStateLabel({ status, isWorking })}>
      {/* A plain element, not the component: the Radix trigger needs a ref. */}
      <span className="flex">
        <AgentMark status={status} isWorking={isWorking} />
      </span>
    </Tooltip>
  );
};
