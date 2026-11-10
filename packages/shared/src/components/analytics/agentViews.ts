import type { PostAnalytics } from '../../graphql/posts';

export enum AgentViewsSeries {
  Total = 'agentViews',
  Claude = 'agentViewsClaude',
  Chatgpt = 'agentViewsChatgpt',
  Gemini = 'agentViewsGemini',
  Perplexity = 'agentViewsPerplexity',
  Exa = 'agentViewsExa',
  Meta = 'agentViewsMeta',
}

type AgentViewsBotKey = Extract<keyof PostAnalytics, `agentViews${string}Bot`>;

export type AgentViewsSeriesConfig = {
  key: AgentViewsSeries;
  label: string;
  color: string;
  dotClassName: string;
  botKey?: AgentViewsBotKey;
};

export const agentViewsTotalSeries: AgentViewsSeriesConfig = {
  key: AgentViewsSeries.Total,
  label: 'AI agents',
  color: 'var(--theme-accent-avocado-default)',
  dotClassName: 'bg-accent-avocado-default',
  botKey: 'agentViewsBot',
};

export const agentViewsVendorSeries: AgentViewsSeriesConfig[] = [
  {
    key: AgentViewsSeries.Claude,
    label: 'Claude',
    color: 'var(--theme-accent-bacon-default)',
    dotClassName: 'bg-accent-bacon-default',
    botKey: 'agentViewsClaudeBot',
  },
  {
    key: AgentViewsSeries.Chatgpt,
    label: 'ChatGPT',
    color: 'var(--theme-accent-lettuce-default)',
    dotClassName: 'bg-accent-lettuce-default',
    botKey: 'agentViewsChatgptBot',
  },
  {
    key: AgentViewsSeries.Gemini,
    label: 'Gemini',
    color: 'var(--theme-accent-water-default)',
    dotClassName: 'bg-accent-water-default',
  },
  {
    key: AgentViewsSeries.Perplexity,
    label: 'Perplexity',
    color: 'var(--theme-accent-onion-default)',
    dotClassName: 'bg-accent-onion-default',
    botKey: 'agentViewsPerplexityBot',
  },
  {
    key: AgentViewsSeries.Exa,
    label: 'Exa',
    color: 'var(--theme-accent-cheese-default)',
    dotClassName: 'bg-accent-cheese-default',
    botKey: 'agentViewsExaBot',
  },
  {
    key: AgentViewsSeries.Meta,
    label: 'Meta AI',
    color: 'var(--theme-accent-bun-default)',
    dotClassName: 'bg-accent-bun-default',
    botKey: 'agentViewsMetaBot',
  },
];

export const agentViewsSeries: AgentViewsSeriesConfig[] = [
  agentViewsTotalSeries,
  ...agentViewsVendorSeries,
];
