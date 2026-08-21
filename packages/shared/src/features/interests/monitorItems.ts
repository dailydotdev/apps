import type { UserInterest } from '../../graphql/interests';
import {
  InterestRunStatus,
  UserInterestStatus,
  interestDisplayName,
} from '../../graphql/interests';

export type AgentMonitorState =
  | 'waiting'
  | 'running'
  | 'watching'
  | 'starting'
  | 'failed'
  | 'paused'
  | 'stopped';

export type AgentMonitorItem = {
  id: string;
  name: string;
  state: AgentMonitorState;
  line: string;
  found?: number;
  at?: string | null;
};

export type AgentMonitorSource = UserInterest;

const freshMs = 1000 * 60 * 60 * 6;

const fallbackLine: Record<AgentMonitorState, string> = {
  waiting: 'Came back with something.',
  running: 'Scanning now…',
  watching: 'Watching. Nothing new yet.',
  starting: 'First run has not happened yet.',
  failed: 'Last run did not finish.',
  paused: 'Paused. Nothing scheduled.',
  stopped: 'Stopped. It keeps what it found.',
};

// One word each. "Waiting for review" took the whole row on a phone, leaving
// three letters of the name it described.
export const stateLabel: Record<AgentMonitorState, string> = {
  waiting: 'Review',
  running: 'Running',
  watching: 'Watching',
  starting: 'Due',
  failed: 'Failed',
  paused: 'Paused',
  stopped: 'Stopped',
};

export const stateMeaning: Record<AgentMonitorState, string> = {
  waiting: 'Waiting for review',
  running: 'Running now',
  watching: 'Watching',
  starting: 'First run due',
  failed: 'Run failed',
  paused: 'Paused',
  stopped: 'Stopped',
};

export const inkClass: Record<AgentMonitorState, string> = {
  waiting: 'text-brand-default',
  running: 'text-status-success',
  watching: 'text-status-info',
  starting: 'text-status-warning',
  failed: 'text-status-error',
  paused: 'text-text-quaternary',
  stopped: 'text-text-quaternary',
};

export const dotClass: Record<AgentMonitorState, string> = {
  waiting: 'bg-brand-default',
  running: 'animate-pulse bg-status-success',
  watching: 'bg-status-info',
  starting: 'bg-status-warning',
  failed: 'bg-status-error',
  paused: 'bg-text-quaternary',
  stopped: 'border border-text-quaternary',
};

export const toMonitorItems = (
  agents: AgentMonitorSource[],
  now = Date.now(),
): AgentMonitorItem[] =>
  agents.map((agent) => {
    const ran = agent.lastRunAt ? Date.parse(agent.lastRunAt) : 0;
    const isFresh =
      !!agent.lastRunFindings && !!agent.lastRunAt && now - ran < freshMs;

    const resolve = (): AgentMonitorState => {
      if (
        agent.lastRunStatus === InterestRunStatus.Queued ||
        agent.lastRunStatus === InterestRunStatus.Running
      ) {
        return 'running';
      }

      if (agent.status === UserInterestStatus.Stopped) {
        return 'stopped';
      }

      if (agent.status !== UserInterestStatus.Active) {
        return 'paused';
      }

      if (agent.lastRunStatus === InterestRunStatus.Failed) {
        return 'failed';
      }

      if (!agent.lastRunAt) {
        return 'starting';
      }

      return isFresh ? 'waiting' : 'watching';
    };

    const state = resolve();

    return {
      id: agent.id,
      name: interestDisplayName(agent),
      state,
      found: agent.lastRunFindings || undefined,
      // A stopped or failed agent's last summary describes a state it has left.
      line:
        (state === 'failed' || state === 'stopped'
          ? undefined
          : agent.lastRunSummary) ?? fallbackLine[state],
      at: agent.lastRunAt,
    };
  });
