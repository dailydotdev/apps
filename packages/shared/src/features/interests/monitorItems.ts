import type { UserInterest } from '../../graphql/interests';
import { UserInterestStatus } from '../../graphql/interests';

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

// The API returns no field for a run in flight or a failed run, so until it
// does only mock data sets `runState`.
export type AgentMonitorSource = UserInterest & {
  runState?: 'running' | 'failed' | null;
};

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

// `waiting` stands in for an unseen-findings count the API does not return yet.
export const toMonitorItems = (
  agents: AgentMonitorSource[],
  now = Date.now(),
): AgentMonitorItem[] =>
  agents.map((agent) => {
    const ran = agent.lastRunAt ? Date.parse(agent.lastRunAt) : 0;
    const keptNothing = /\bkept (nothing|none|no|0)\b/i.test(
      agent.lastRunSummary ?? '',
    );
    const isFresh =
      !!agent.lastRunSummary && !keptNothing && now - ran < freshMs;

    const resolve = (): AgentMonitorState => {
      if (agent.runState === 'running') {
        return 'running';
      }

      if (agent.status === UserInterestStatus.Stopped) {
        return 'stopped';
      }

      if (agent.status !== UserInterestStatus.Active) {
        return 'paused';
      }

      if (agent.runState === 'failed') {
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
      name: agent.query,
      state,
      // Parsed out of the summary because the API returns no findings count yet.
      found:
        Number(/kept (\d+)/.exec(agent.lastRunSummary ?? '')?.[1]) || undefined,
      // A stopped or failed agent's last summary describes a state it has left.
      line:
        (state === 'failed' || state === 'stopped'
          ? undefined
          : agent.lastRunSummary) ?? fallbackLine[state],
      at: agent.lastRunAt,
    };
  });
