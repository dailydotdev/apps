import type { ComponentType } from 'react';
import type { IconProps } from '../../components/Icon';
import {
  AiIcon,
  BulletListIcon,
  FeatherIcon,
  FilterIcon,
  HotIcon,
  MagicIcon,
  SettingsIcon,
  SourceIcon,
  TerminalIcon,
  TimerIcon,
} from '../../components/icons';

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
    name: 'explore',
    label: 'Explore more',
    description: 'Widen the hunt past what it has already found.',
    icon: MagicIcon,
    hint: '[angle]',
    ask: 'What angle? Or send it as it is…',
    prompt: (args) =>
      args
        ? `Explore more around ${args}`
        : 'Explore more. Widen the hunt past what you have already found',
  },
  {
    name: 'write',
    label: 'Write a post',
    description: "Draft something publishable out of this run's findings.",
    icon: FeatherIcon,
    hint: '[format]',
    ask: 'What format? Or send it as it is…',
    prompt: (args) =>
      args
        ? `Write me ${args} from what you found`
        : 'Write me a post summarising what you found',
  },
  {
    name: 'raise-bar',
    label: 'Raise the bar',
    description: 'Tighten what counts as worth sending from now on.',
    icon: AiIcon,
    hint: '[what counts]',
    ask: 'What should count from now on? Or send it as it is…',
    prompt: (args) =>
      args
        ? `Raise the bar. From now on only surface ${args}`
        : 'Raise the bar. Only surface top-tier content from now on',
  },
  {
    name: 'sources',
    label: 'Tune sources',
    description: 'Add or drop the places it looks.',
    icon: SourceIcon,
    hint: '[add or drop]',
    ask: 'What to add or drop? Or send it as it is…',
    prompt: (args) =>
      args
        ? `Change where you look: ${args}`
        : 'Show me where you are looking and what you would add or drop',
  },
  {
    name: 'schedule',
    label: 'Change cadence',
    description: 'How often it runs on its own.',
    icon: TimerIcon,
    hint: '[how often]',
    ask: 'How often? Or send it as it is…',
    prompt: (args) =>
      args ? `Run ${args} from now on` : 'How often are you running right now?',
  },
  {
    name: 'why',
    label: 'Explain a pick',
    description: 'What made something clear the bar, in its own words.',
    icon: FilterIcon,
    hint: '[which pick]',
    ask: 'Which pick? Or send it as it is…',
    prompt: (args) =>
      args
        ? `Explain why ${args} cleared the bar`
        : 'Explain why your latest pick cleared the bar',
  },
  {
    name: 'recap',
    label: 'Recap',
    description: 'A written summary of everything since the last one.',
    icon: BulletListIcon,
    prompt: () => 'Recap everything you have found since the last summary',
  },
  {
    name: 'trending',
    label: 'What is moving',
    description: 'What the rest of daily.dev is reading on this topic.',
    icon: HotIcon,
    prompt: () =>
      'What is moving on this topic across daily.dev right now, whether or not it cleared my bar?',
  },
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

export const quickCommandNames = ['explore', 'write', 'raise-bar'];

export const findCommand = (name: string): AgentCommand | undefined =>
  agentCommands.find((command) => command.name === name);

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
