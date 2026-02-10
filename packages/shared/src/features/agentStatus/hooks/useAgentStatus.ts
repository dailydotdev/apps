import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import useSubscription from '../../../hooks/useSubscription';
import type { AgentStatus } from '../types';
import {
  AGENT_STATUS_QUERY,
  AGENT_STATUS_SUBSCRIPTION,
  AgentStatusType,
} from '../types';

interface AgentStatusData {
  agentStatus: AgentStatus[];
}

interface AgentStatusSubscriptionData {
  agentStatusUpdated: AgentStatus[] | AgentStatus;
}

interface UseAgentStatusReturn {
  agents: AgentStatus[];
  isLoading: boolean;
}

const IS_DEV = process.env.NODE_ENV === 'development';

const STATUS_ALIASES: Record<string, AgentStatusType> = {
  [AgentStatusType.Working]: AgentStatusType.Working,
  running: AgentStatusType.Working,
  in_progress: AgentStatusType.Working,
  processing: AgentStatusType.Working,
  [AgentStatusType.Waiting]: AgentStatusType.Waiting,
  needs_input: AgentStatusType.Waiting,
  waiting_for_input: AgentStatusType.Waiting,
  input_required: AgentStatusType.Waiting,
  [AgentStatusType.Error]: AgentStatusType.Error,
  failed: AgentStatusType.Error,
  failure: AgentStatusType.Error,
  [AgentStatusType.Completed]: AgentStatusType.Completed,
  done: AgentStatusType.Completed,
  finished: AgentStatusType.Completed,
  success: AgentStatusType.Completed,
  [AgentStatusType.Idle]: AgentStatusType.Idle,
  inactive: AgentStatusType.Idle,
  stopped: AgentStatusType.Idle,
};

const normalizeStatus = (status?: string): AgentStatusType => {
  if (!status) {
    return AgentStatusType.Idle;
  }

  return STATUS_ALIASES[status.toLowerCase()] ?? AgentStatusType.Idle;
};

const normalizeAgents = (agents: AgentStatus[]): AgentStatus[] => {
  return agents.map((agent) => ({
    ...agent,
    status: normalizeStatus(String(agent.status)),
  }));
};

const toArray = (agentStatus: AgentStatus[] | AgentStatus): AgentStatus[] => {
  return Array.isArray(agentStatus) ? agentStatus : [agentStatus];
};

export function useAgentStatus(): UseAgentStatusReturn {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(RequestKey.AgentStatus, user);

  const { data, isLoading } = useQuery<AgentStatusData>({
    queryKey,
    queryFn: async () => {
      if (IS_DEV) {
        // In dev, poll the local Next.js API route that hooks POST to
        const res = await fetch('/api/agent-status');
        const json = (await res.json()) as AgentStatusData;

        return {
          agentStatus: normalizeAgents(json.agentStatus ?? []),
        };
      }

      const response = await gqlClient.request<AgentStatusData>(
        AGENT_STATUS_QUERY,
      );

      return {
        agentStatus: normalizeAgents(response.agentStatus ?? []),
      };
    },
    enabled: IS_DEV || !!user,
    refetchInterval: IS_DEV ? 2_000 : 30_000,
  });

  const onSubscriptionData = useCallback(
    (subscriptionData: AgentStatusSubscriptionData) => {
      const agentStatus = subscriptionData.agentStatusUpdated;
      const normalizedAgents = agentStatus
        ? normalizeAgents(toArray(agentStatus))
        : [];

      queryClient.setQueryData<AgentStatusData>(queryKey, () => ({
        agentStatus: normalizedAgents,
      }));
    },
    [queryClient, queryKey],
  );

  // In production, use GraphQL subscription for real-time updates
  useSubscription<AgentStatusSubscriptionData>(
    () => ({ query: AGENT_STATUS_SUBSCRIPTION }),
    { next: onSubscriptionData },
    [onSubscriptionData],
  );

  return {
    agents: data?.agentStatus ?? [],
    isLoading,
  };
}
