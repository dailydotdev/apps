import type { ArenaEntity, ArenaGroupId, ArenaTab } from './types';

const CODING_AGENTS: ArenaEntity[] = [
  {
    entity: 'cursor',
    name: 'Cursor',
    slug: 'cursor',
    logo: 'https://www.cursor.com/apple-touch-icon.png',
    brandColor: '#00D4AA',
  },
  {
    entity: 'copilot',
    name: 'Copilot',
    slug: 'copilot',
    logo: 'https://github.githubassets.com/images/icons/copilot/cp-head-square.png',
    brandColor: '#000000',
  },
  {
    entity: 'windsurf',
    name: 'Windsurf',
    slug: 'windsurf',
    logo: 'https://windsurf.com/favicon_192.png',
    brandColor: '#06B6D4',
  },
  {
    entity: 'cline',
    name: 'Cline',
    slug: 'cline',
    logo: 'https://raw.githubusercontent.com/cline/cline/main/assets/icons/icon.png',
    brandColor: '#F59E0B',
  },
  {
    entity: 'claude_code',
    name: 'Claude Code',
    slug: 'claude-code',
    logo: 'https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/68c33859cc6cd903686c66a2_apple-touch-icon.png',
    brandColor: '#D97757',
  },
  {
    entity: 'codex',
    name: 'Codex',
    slug: 'codex',
    logo: 'https://cdn.oaistatic.com/assets/apple-touch-icon-mz9nytnj.webp',
    brandColor: '#10A37F',
  },
  {
    entity: 'aider',
    name: 'Aider',
    slug: 'aider',
    logo: 'https://aider.chat/assets/logo.svg',
    brandColor: '#8B5CF6',
  },
  {
    entity: 'opencode',
    name: 'OpenCode',
    slug: 'opencode',
    logo: 'https://opencode.ai/favicon.ico',
    brandColor: '#EC4899',
  },
  {
    entity: 'antigravity',
    name: 'Antigravity',
    slug: 'antigravity',
    logo: 'https://antigravity.google/favicon.ico',
    brandColor: '#EF4444',
  },
  {
    entity: 'kilocode',
    name: 'Kilocode',
    slug: 'kilocode',
    logo: 'https://kilocode.ai/favicon.ico',
    brandColor: '#14B8A6',
  },
];

const LLMS: ArenaEntity[] = [
  {
    entity: 'claude_sonnet',
    name: 'Claude Sonnet',
    slug: 'claude-sonnet',
    logo: 'https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/68c33859cc6cd903686c66a2_apple-touch-icon.png',
    brandColor: '#D97757',
  },
  {
    entity: 'claude_opus',
    name: 'Claude Opus',
    slug: 'claude-opus',
    logo: 'https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/68c33859cc6cd903686c66a2_apple-touch-icon.png',
    brandColor: '#D97757',
  },
  {
    entity: 'gpt_5',
    name: 'GPT-5',
    slug: 'gpt-5',
    logo: 'https://cdn.oaistatic.com/assets/apple-touch-icon-mz9nytnj.webp',
    brandColor: '#10A37F',
  },
  {
    entity: 'gpt_codex',
    name: 'GPT Codex',
    slug: 'gpt-codex',
    logo: 'https://cdn.oaistatic.com/assets/apple-touch-icon-mz9nytnj.webp',
    brandColor: '#10A37F',
  },
  {
    entity: 'deepseek',
    name: 'DeepSeek',
    slug: 'deepseek',
    logo: 'https://deepseek.com/favicon.ico',
    brandColor: '#3B82F6',
  },
  {
    entity: 'gemini',
    name: 'Gemini',
    slug: 'gemini',
    logo: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png',
    brandColor: '#8E75B2',
  },
  {
    entity: 'llama',
    name: 'Llama',
    slug: 'llama',
    logo: 'https://avatars.githubusercontent.com/u/153379578?s=200&v=4',
    brandColor: '#0467DF',
  },
  {
    entity: 'qwen',
    name: 'Qwen',
    slug: 'qwen',
    logo: 'https://avatars.githubusercontent.com/u/141221163?s=200&v=4',
    brandColor: '#615EFF',
  },
  {
    entity: 'kimi',
    name: 'Kimi',
    slug: 'kimi',
    logo: 'https://statics.moonshot.cn/kimi-chat/favicon.ico',
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
