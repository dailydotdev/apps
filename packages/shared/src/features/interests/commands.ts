import type { ComponentType } from 'react';
import type { IconProps } from '../../components/Icon';
import { SettingsIcon, TerminalIcon, TimerIcon } from '../../components/icons';

export type AgentCommand = {
  name: string;
  label: string;
  description: string;
  icon: ComponentType<IconProps>;
  hint?: string;
  ask?: string;
  // `args` is whatever followed the name, already trimmed.
  prompt?: (args: string) => string;
  // A command with no `prompt` is local: it opens the workspace, no run spent.
  opens?: 'settings' | 'activity' | 'debug';
};

export const agentCommands: AgentCommand[] = [
  {
    name: 'settings',
    label: 'Open settings',
    description: 'Its name, cadence and standing guidance.',
    icon: SettingsIcon,
    opens: 'settings',
  },
  {
    name: 'activity',
    label: 'Open activity',
    description: 'Every run, command and finding in order.',
    icon: TimerIcon,
    opens: 'activity',
  },
  {
    name: 'debug',
    label: 'Open debug',
    description: 'The raw scoring behind the last run.',
    icon: TerminalIcon,
    opens: 'debug',
  },
];

export const findCommand = (name: string): AgentCommand | undefined =>
  agentCommands.find((command) => command.name === name);

export const isCommandAvailable = (
  command: AgentCommand,
  canDebug: boolean,
): boolean => command.opens !== 'debug' || canDebug;

export const matchCommands = (query: string): AgentCommand[] => {
  const term = query.toLowerCase();

  return agentCommands.filter(({ name, label }) =>
    `${name} ${label.toLowerCase()}`.includes(term),
  );
};

// A bare `/` returns an empty string, so callers must check for `undefined`
// rather than for falsiness.
export const commandQuery = (value: string): string | undefined => {
  const match = /^\/([a-z-]*)$/.exec(value);

  return match ? match[1] : undefined;
};

export const parseCommand = (
  value: string,
): { command: AgentCommand; args: string } | undefined => {
  const match = /^\/([a-z-]+)(?:\s+([\s\S]*))?$/.exec(value.trim());
  const command = match ? findCommand(match[1]) : undefined;

  return command ? { command, args: (match?.[2] ?? '').trim() } : undefined;
};
