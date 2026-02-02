import type { AITool, TrendingInsight, SocialMention } from './types';

export const mockTools: AITool[] = [
  {
    id: 'claude-opus-4-5',
    name: 'Claude Opus 4.5',
    version: '4.5',
    company: 'Anthropic',
    description:
      'Most capable Claude model for complex coding tasks, deep technical analysis, and architectural decisions',
    tldr: 'Best for complex coding tasks and technical architecture',
    category: 'api',
    pricing: {
      freeTier: false,
      startingPrice: '$15/million tokens',
      details: 'Pay-as-you-go pricing, volume discounts available',
    },
    links: {
      docs: 'https://docs.anthropic.com/claude/docs',
      website: 'https://www.anthropic.com/claude',
      changelog: 'https://docs.anthropic.com/claude/changelog',
    },
    sentiment: {
      score: 96,
      totalReviews: 3420,
    },
    trending: {
      mentions: 892,
      timeframe: 'last 24h',
      change: 23,
    },
    topUsers: [
      {
        id: 'user1',
        username: 'alice_dev',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        contributions: 145,
      },
      {
        id: 'user2',
        username: 'bob_codes',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        contributions: 98,
      },
      {
        id: 'user3',
        username: 'charlie_tech',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
        contributions: 87,
      },
    ],
    pros: [
      'Exceptional reasoning',
      'Large context window',
      'Strong code understanding',
      'Detailed explanations',
    ],
    cons: ['Higher cost', 'No free tier', 'Rate limits on new accounts'],
    alternatives: ['gpt-4-turbo', 'gemini-pro-1-5'],
    metadata: {
      lastUpdate: '2025-01-15',
      latestVersion: '4.5',
    },
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    version: '1.0',
    company: 'Anthropic',
    description:
      'Official CLI tool from Anthropic for AI-powered coding in your terminal with file editing, bash execution, and agentic workflows',
    tldr: 'AI coding assistant right in your terminal',
    category: 'coding-assistant',
    pricing: {
      freeTier: true,
      details: 'Free tier available, usage based on Claude API pricing',
    },
    install: {
      command: 'npm install -g @anthropics/claude-code',
      type: 'npm',
    },
    links: {
      docs: 'https://docs.anthropic.com/claude-code',
      website: 'https://claude.com/claude-code',
    },
    sentiment: {
      score: 94,
      totalReviews: 2341,
    },
    trending: {
      mentions: 1456,
      timeframe: 'last 24h',
      change: 67,
    },
    topUsers: [
      {
        id: 'user4',
        username: 'dev_master',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
        contributions: 234,
      },
      {
        id: 'user5',
        username: 'code_ninja',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ninja',
        contributions: 189,
      },
      {
        id: 'user6',
        username: 'tech_wizard',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wizard',
        contributions: 156,
      },
    ],
    pros: [
      'Native terminal integration',
      'Agentic workflows',
      'File editing capabilities',
      'Free tier',
    ],
    cons: [
      'Still in beta',
      'Limited IDE integrations',
      'Learning curve for CLI',
    ],
    alternatives: ['cursor', 'aider', 'github-copilot'],
    metadata: {
      lastUpdate: '2026-01-28',
      latestVersion: '1.0.0',
    },
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    version: '4-turbo',
    company: 'OpenAI',
    description:
      'Fast and capable model optimized for code generation, with vision capabilities and JSON mode',
    tldr: 'Fast, capable, with vision and structured outputs',
    category: 'api',
    pricing: {
      freeTier: false,
      startingPrice: '$10/million tokens',
      details: 'Pay-as-you-go, cheaper than GPT-4',
    },
    links: {
      docs: 'https://platform.openai.com/docs',
      website: 'https://openai.com/gpt-4',
    },
    sentiment: {
      score: 88,
      totalReviews: 5621,
    },
    trending: {
      mentions: 678,
      timeframe: 'last 24h',
      change: -12,
    },
    topUsers: [
      {
        id: 'user7',
        username: 'ai_builder',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=builder',
        contributions: 201,
      },
      {
        id: 'user8',
        username: 'prompt_pro',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pro',
        contributions: 167,
      },
    ],
    pros: [
      'Fast response times',
      'Vision capabilities',
      'JSON mode',
      'Lower cost than GPT-4',
    ],
    cons: [
      'Occasional hallucinations',
      'Less reasoning than Opus',
      'Rate limits',
    ],
    alternatives: ['claude-opus-4-5', 'gemini-pro-1-5'],
    metadata: {
      lastUpdate: '2025-12-10',
      latestVersion: 'gpt-4-turbo-2024-04-09',
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    version: '0.43',
    company: 'Anysphere',
    description:
      'AI-first code editor built on VS Code with native AI integration, chat, and inline editing',
    tldr: 'VS Code fork with built-in AI superpowers',
    category: 'coding-assistant',
    pricing: {
      freeTier: true,
      startingPrice: '$20/month',
      details: 'Free tier with limited requests, Pro at $20/mo',
    },
    install: {
      command: 'Download from cursor.sh',
      type: 'download',
    },
    links: {
      website: 'https://cursor.sh',
      docs: 'https://docs.cursor.sh',
    },
    sentiment: {
      score: 92,
      totalReviews: 4123,
    },
    trending: {
      mentions: 2103,
      timeframe: 'last 24h',
      change: 156,
    },
    topUsers: [
      {
        id: 'user9',
        username: 'cursor_fan',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fan',
        contributions: 312,
      },
      {
        id: 'user10',
        username: 'vscode_migrant',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=migrant',
        contributions: 245,
      },
    ],
    pros: [
      'Seamless VS Code experience',
      'Natural chat interface',
      'Cmd+K inline editing',
      'Free tier available',
    ],
    cons: [
      'Mac-first design',
      'Some VS Code extensions incompatible',
      'Pricing for teams',
    ],
    alternatives: ['claude-code', 'github-copilot', 'windsurf'],
    metadata: {
      lastUpdate: '2026-01-20',
      latestVersion: '0.43.2',
    },
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    version: '1.156',
    company: 'GitHub',
    description:
      'AI pair programmer powered by OpenAI Codex, integrated into VS Code, JetBrains, and more',
    tldr: 'AI autocomplete for code in your favorite editor',
    category: 'coding-assistant',
    pricing: {
      freeTier: true,
      startingPrice: '$10/month',
      details: 'Free for students and open source maintainers',
    },
    links: {
      website: 'https://github.com/features/copilot',
      docs: 'https://docs.github.com/copilot',
    },
    sentiment: {
      score: 85,
      totalReviews: 8934,
    },
    trending: {
      mentions: 534,
      timeframe: 'last 24h',
      change: -5,
    },
    topUsers: [
      {
        id: 'user11',
        username: 'gh_user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gh',
        contributions: 456,
      },
      {
        id: 'user12',
        username: 'copilot_daily',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daily',
        contributions: 389,
      },
    ],
    pros: [
      'Wide IDE support',
      'Great autocomplete',
      'Free for students',
      'GitHub integration',
    ],
    cons: [
      'Can suggest outdated code',
      'Subscription required',
      'Privacy concerns',
    ],
    alternatives: ['cursor', 'tabnine', 'codeium'],
    metadata: {
      lastUpdate: '2026-01-30',
      latestVersion: '1.156.0',
    },
  },
  {
    id: 'aider',
    name: 'Aider',
    version: '0.61',
    company: 'Open Source',
    description:
      'AI pair programming in your terminal with git integration and support for multiple LLMs',
    tldr: 'Terminal-based AI coding with git awareness',
    category: 'coding-assistant',
    pricing: {
      freeTier: true,
      details: 'Open source, BYO API key',
    },
    install: {
      command: 'pip install aider-chat',
      type: 'pip',
    },
    links: {
      website: 'https://aider.chat',
      docs: 'https://aider.chat/docs',
    },
    sentiment: {
      score: 91,
      totalReviews: 1876,
    },
    trending: {
      mentions: 423,
      timeframe: 'last 24h',
      change: 34,
    },
    topUsers: [
      {
        id: 'user13',
        username: 'terminal_lover',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=terminal',
        contributions: 178,
      },
      {
        id: 'user14',
        username: 'git_guru',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=git',
        contributions: 134,
      },
    ],
    pros: [
      'Open source',
      'Git integration',
      'Multi-LLM support',
      'Terminal native',
    ],
    cons: [
      'CLI learning curve',
      'BYO API key',
      'Less polished than commercial tools',
    ],
    alternatives: ['claude-code', 'cursor', 'continue'],
    metadata: {
      lastUpdate: '2026-01-25',
      latestVersion: '0.61.0',
    },
  },
];

export const trendingInsights: TrendingInsight[] = [
  {
    type: 'favorite',
    toolId: 'claude-code',
    toolName: 'Claude Code',
    message: 'Community favorite: Claude Code',
    icon: '⭐',
  },
  {
    type: 'trending',
    toolId: 'cursor',
    toolName: 'Cursor',
    message: 'Trending: Cursor - 2,103 mentions (last 24h)',
    icon: '🔥',
  },
  {
    type: 'rising',
    toolId: 'claude-code',
    toolName: 'Claude Code',
    message: 'Rising: Claude Code - +67% engagement',
    icon: '📈',
  },
];

export const mockMentions: SocialMention[] = [
  {
    id: '1',
    source: 'twitter',
    author: '@dev_influencer',
    content:
      'Just switched to Claude Code for my terminal workflow. The agentic features are game-changing! 🚀',
    sentiment: 'positive',
    timestamp: '2h ago',
    toolId: 'claude-code',
  },
  {
    id: '2',
    source: 'reddit',
    author: 'u/coder123',
    content:
      "Cursor's inline editing with Cmd+K is exactly what I needed. Worth every penny.",
    sentiment: 'positive',
    timestamp: '4h ago',
    toolId: 'cursor',
  },
  {
    id: '3',
    source: 'dailydev',
    author: 'tech_writer',
    content:
      'Compared Claude Opus 4.5 vs GPT-4 Turbo for complex refactoring. Opus won hands down.',
    sentiment: 'positive',
    timestamp: '6h ago',
    toolId: 'claude-opus-4-5',
  },
  {
    id: '4',
    source: 'twitter',
    author: '@open_source_fan',
    content: 'Aider + Claude = perfect terminal coding setup. Open source ftw! 🎉',
    sentiment: 'positive',
    timestamp: '8h ago',
    toolId: 'aider',
  },
];
