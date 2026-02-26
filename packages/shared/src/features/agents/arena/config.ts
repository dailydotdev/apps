import type { ArenaGroupId, ArenaTab } from './types';

export const ARENA_TABS: { label: string; value: ArenaTab }[] = [
  { label: 'Coding Agents', value: 'coding-agents' },
  { label: 'LLMs', value: 'llms' },
];

export const ARENA_GROUP_IDS: Record<ArenaGroupId, string> = {
  'coding-agents': '385404b4-f0f4-4e81-a338-bdca851eca31',
  llms: '970ab2c9-f845-4822-82f0-02169713b814',
};

export const EMERGING_THRESHOLD = 50;
