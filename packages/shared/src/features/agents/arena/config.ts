import type { ArenaEntity, ArenaGroupId, ArenaTab } from './types';

const CODING_AGENTS: ArenaEntity[] = [
  {
    entity: 'cursor',
    name: 'Cursor',
    slug: 'cursor',
    logo: 'https://media.daily.dev/image/upload/s--OaZ4Et3s--/f_auto,q_auto/v1772048234/public/cursor',
    brandColor: '#00D4AA',
  },
  {
    entity: 'copilot',
    name: 'Copilot',
    slug: 'copilot',
    logo: 'https://media.daily.dev/image/upload/s--giOMGduf--/f_auto,q_auto/v1772048234/public/copilot',
    brandColor: '#6E40C9',
  },
  {
    entity: 'windsurf',
    name: 'Windsurf',
    slug: 'windsurf',
    logo: 'https://media.daily.dev/image/upload/s--yFe4w8pJ--/f_auto,q_auto/v1772048234/public/windsurf',
    brandColor: '#06B6D4',
  },
  {
    entity: 'cline',
    name: 'Cline',
    slug: 'cline',
    logo: 'https://media.daily.dev/image/upload/s--36tiYseE--/f_auto,q_auto/v1772048234/public/cline',
    brandColor: '#F59E0B',
  },
  {
    entity: 'claude_code',
    name: 'Claude Code',
    slug: 'claude-code',
    logo: 'https://media.daily.dev/image/upload/s--wo3RJzUi--/f_auto,q_auto/v1772048234/public/claude',
    brandColor: '#D97757',
  },
  {
    entity: 'codex',
    name: 'Codex',
    slug: 'codex',
    logo: 'https://media.daily.dev/image/upload/s--KxCFSmLf--/f_auto,q_auto/v1772048234/public/openai',
    brandColor: '#10A37F',
  },
  {
    entity: 'aider',
    name: 'Aider',
    slug: 'aider',
    logo: 'https://media.daily.dev/image/upload/s--Kg40cdB4--/f_auto,q_auto/v1772048234/public/aider',
    brandColor: '#8B5CF6',
  },
  {
    entity: 'opencode',
    name: 'OpenCode',
    slug: 'opencode',
    logo: 'https://media.daily.dev/image/upload/s--szFvMrHs--/f_auto,q_auto/v1772048234/public/opencode',
    brandColor: '#EC4899',
  },
  {
    entity: 'antigravity',
    name: 'Antigravity',
    slug: 'antigravity',
    logo: 'https://media.daily.dev/image/upload/s--5VnOo2GM--/f_auto,q_auto/v1772048234/public/antigravity',
    brandColor: '#EF4444',
  },
  {
    entity: 'kilocode',
    name: 'Kilocode',
    slug: 'kilocode',
    logo: 'https://media.daily.dev/image/upload/s--8eBUg8m2--/f_auto,q_auto/v1772048234/public/kilocode',
    brandColor: '#14B8A6',
  },
];

const LLMS: ArenaEntity[] = [
  {
    entity: 'claude_sonnet',
    name: 'Claude Sonnet',
    slug: 'claude-sonnet',
    logo: 'https://media.daily.dev/image/upload/s--wo3RJzUi--/f_auto,q_auto/v1772048234/public/claude',
    brandColor: '#D97757',
  },
  {
    entity: 'claude_opus',
    name: 'Claude Opus',
    slug: 'claude-opus',
    logo: 'https://media.daily.dev/image/upload/s--wo3RJzUi--/f_auto,q_auto/v1772048234/public/claude',
    brandColor: '#D97757',
  },
  {
    entity: 'gpt_5',
    name: 'GPT-5',
    slug: 'gpt-5',
    logo: 'https://media.daily.dev/image/upload/s--KxCFSmLf--/f_auto,q_auto/v1772048234/public/openai',
    brandColor: '#10A37F',
  },
  {
    entity: 'gpt_codex',
    name: 'GPT Codex',
    slug: 'gpt-codex',
    logo: 'https://media.daily.dev/image/upload/s--KxCFSmLf--/f_auto,q_auto/v1772048234/public/openai',
    brandColor: '#10A37F',
  },
  {
    entity: 'deepseek',
    name: 'DeepSeek',
    slug: 'deepseek',
    logo: 'https://media.daily.dev/image/upload/s--qf0Ls70z--/f_auto,q_auto/v1772048234/public/deepseek',
    brandColor: '#3B82F6',
  },
  {
    entity: 'gemini',
    name: 'Gemini',
    slug: 'gemini',
    logo: 'https://media.daily.dev/image/upload/s--2shzqE5e--/f_auto,q_auto/v1772048234/public/gemini',
    brandColor: '#8E75B2',
  },
  {
    entity: 'llama',
    name: 'Llama',
    slug: 'llama',
    logo: 'https://media.daily.dev/image/upload/s--ApsuAYre--/f_auto,q_auto/v1772048234/public/llama',
    brandColor: '#0467DF',
  },
  {
    entity: 'qwen',
    name: 'Qwen',
    slug: 'qwen',
    logo: 'https://media.daily.dev/image/upload/s--FXxJSTLn--/f_auto,q_auto/v1772048234/public/qwen',
    brandColor: '#615EFF',
  },
  {
    entity: 'kimi',
    name: 'Kimi',
    slug: 'kimi',
    logo: 'https://media.daily.dev/image/upload/s--C_Z9JEzB--/f_auto,q_auto/v1772048234/public/kimi',
    brandColor: '#0EA5E9',
  },
];

const ENTITIES_BY_GROUP: Record<ArenaGroupId, ArenaEntity[]> = {
  'coding-agents': CODING_AGENTS,
  llms: LLMS,
};

export const getEntitiesByGroup = (groupId: ArenaGroupId): ArenaEntity[] =>
  ENTITIES_BY_GROUP[groupId];

export const getEntityByKey = (
  groupId: ArenaGroupId,
  entityKey: string,
): ArenaEntity | undefined =>
  ENTITIES_BY_GROUP[groupId].find((e) => e.entity === entityKey);

export const ARENA_TABS: { label: string; value: ArenaTab }[] = [
  { label: 'Coding Agents', value: 'coding-agents' },
  { label: 'LLMs', value: 'llms' },
];

export const ARENA_GROUP_IDS: Record<ArenaGroupId, string> = {
  'coding-agents': '385404b4-f0f4-4e81-a338-bdca851eca31',
  llms: '970ab2c9-f845-4822-82f0-02169713b814',
};

export const EMERGING_THRESHOLD = 50;
