export interface AgentStatus {
  name: string;
  project: string;
  status: AgentStatusType;
  task: string;
  message?: string;
  timestamp: string;
}

export enum AgentStatusType {
  Working = 'working',
  Waiting = 'waiting',
  Error = 'error',
  Completed = 'completed',
  Idle = 'idle',
}

export const AGENT_STATUS_QUERY = `
  query AgentStatus {
    agentStatus {
      name
      project
      status
      task
      message
      timestamp
    }
  }
`;

export const AGENT_STATUS_SUBSCRIPTION = `
  subscription AgentStatusUpdated {
    agentStatusUpdated {
      name
      project
      status
      task
      message
      timestamp
    }
  }
`;
