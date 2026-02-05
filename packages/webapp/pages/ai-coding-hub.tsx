import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import { NextSeo } from 'next-seo';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  TerminalIcon,
  TwitterIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getLayout } from '../components/layouts/NoSidebarLayout';

type Category =
  | 'mindset_shift'
  | 'tips'
  | 'product_launch'
  | 'workflow'
  | 'announcement';

type FeedItem = {
  id: string;
  headline: string;
  summary: string;
  date: string;
  category: Category;
  tags: string[];
  why_it_matters: string;
  source_tweet_id: string;
};

const feedItems: FeedItem[] = [
  {
    id: 'news-agentic-engineering-era',
    headline: 'Vibe coding is dead. Agentic engineering is here.',
    summary:
      "Karpathy just dropped the new meta: stop 'vibing' and start orchestrating. The builders shipping fastest aren't writing code - they're designing agent memory, context windows, guardrails, and fallback logic. One dev: 'Went from vibing on weekends → agents that run overnight, review PRs, and ship while I sleep.' The engineering part is real. The leverage is insane.",
    date: '2026-02-05',
    category: 'mindset_shift',
    tags: ['agentic_engineering', 'vibe_coding', 'karpathy', 'workflow'],
    source_tweet_id: '2019399908110082254',
    why_it_matters:
      "If you're still 'vibing' with prompts, you're already behind. The game is orchestration now.",
  },
  {
    id: 'news-10-claude-code-tips',
    headline: '10 Claude Code tips from the team that builds it',
    summary:
      "Boris Cherny dropped 10 tips that changed how people work: (1) Multiple git worktrees for parallel tasks (2) Plan first, execute second (3) Update Claude's docs after corrections (4) Create reusable skills for common actions (5) Let Claude auto-fix via logs (6) Challenge Claude for elegant solutions (7) Optimize terminal setup (8) Use subagents for complex problems (9) Data analysis via BigQuery CLI (10) Use for learning with diagrams. Thread got 49K likes.",
    date: '2026-02-05',
    category: 'tips',
    tags: ['claude_code', 'tips', 'workflow', 'productivity'],
    source_tweet_id: '2019396346747187442',
    why_it_matters:
      '10 quick wins you can implement today. No fluff, straight from the source.',
  },
  {
    id: 'news-codex-macos-app',
    headline: "Codex app hit 1M users in 3 days. Here's why everyone switched.",
    summary:
      "OpenAI's Codex desktop app went from 0 to 1M users faster than any dev tool in history. The killer feature: run multiple agents in parallel on different worktrees while you sleep. Skills system lets you automate repetitive tasks. Sandboxed execution means agents can't brick your machine. Windows devs in shambles.",
    date: '2026-02-02',
    category: 'product_launch',
    tags: ['codex', 'openai', 'macos', 'desktop_app', 'parallel_agents'],
    source_tweet_id: '2019173348132188330',
    why_it_matters:
      'The people shipping fastest right now are running parallel agents overnight. This is the tool.',
  },
  {
    id: 'news-cursor-vs-claude-workflow',
    headline: 'Cursor vs Claude Code: devs share what they use each for',
    summary:
      "The consensus emerging: Cursor for UI iteration (fast visual feedback), Claude Code for complex reasoning and CLI workflows. Many devs running both: 'I architect with ChatGPT, generate with Cursor, review in Claude Code, deploy on Vercel.' One dev: 'Switched to Claude Code and my workflow diverged so much I can't go back.' No single tool wins - it's about the stack.",
    date: '2026-02-05',
    category: 'workflow',
    tags: ['cursor', 'claude_code', 'workflow', 'comparison'],
    source_tweet_id: '2019402893150023773',
    why_it_matters:
      "Stop asking 'which is best' - the answer is both. Here's how people are stacking them.",
  },
  {
    id: 'news-xcode-claude-codex',
    headline: 'Xcode 26.3 just shipped with Claude + Codex built in',
    summary:
      "Apple went all-in: native Claude Agent SDK and Codex integration in Xcode. Subagents, background tasks, MCP plugins - first-class features, not extensions. First major IDE vendor to ship multi-agent as default. iOS devs who've been watching from the sidelines just got full agentic capabilities without switching tools.",
    date: '2026-02-03',
    category: 'product_launch',
    tags: ['xcode', 'claude_code', 'codex', 'apple', 'ios'],
    source_tweet_id: '2018771170938724682',
    why_it_matters:
      'iOS devs: your workflow just changed. Everyone else: this is where the industry is heading.',
  },
  {
    id: 'news-cursor-commands-tip',
    headline: "Cursor tip: Commands you're probably not using",
    summary:
      "If you're using Cursor without commands, you're leaving speed on the table. Quick wins: /deslop removes AI code bloat, /create-pr opens PRs from editor, /weekly-review summarizes your week, /fix-merge-conflict resolves conflicts in current branch. Commands = reusable prompts. Stop typing the same context every day.",
    date: '2026-02-03',
    category: 'tips',
    tags: ['cursor', 'commands', 'tips', 'productivity'],
    source_tweet_id: '2018610560745746833',
    why_it_matters:
      '4 commands that instantly speed up your Cursor workflow. Add them now.',
  },
  {
    id: 'news-github-agents-hq',
    headline: 'GitHub Agents HQ: run Claude, Codex, and Copilot in one repo',
    summary:
      "GitHub just unified the agent wars. Agents HQ lets you run Claude, Codex, and Copilot as in-repo agents - parallel runs, session history, PR-style review, enterprise governance. 'The IDE war is over. The orchestration war just started.' Available for Copilot Pro+ and Enterprise.",
    date: '2026-02-04',
    category: 'product_launch',
    tags: ['github', 'copilot', 'claude_code', 'codex', 'agents_hq'],
    source_tweet_id: '2019109138173947995',
    why_it_matters:
      'No more picking sides. Run all agents, compare outputs, ship faster.',
  },
  {
    id: 'news-workflow-2026',
    headline: "The 2026 AI coding workflow that's actually working",
    summary:
      'Pattern emerging from top builders: (1) Architect with ChatGPT/Claude (2) Generate boilerplate with Cursor (3) Complex reasoning with Claude Code (4) Review + refactor manually (5) Deploy on Vercel/Amplify. Another stack: GitHub for planning, Lovable for initial UX, Cursor Agent for implementation, GPT-5.2 Agent for code review. The key: different tools for different phases.',
    date: '2026-02-05',
    category: 'workflow',
    tags: ['workflow', 'best_practices', 'cursor', 'claude_code', 'codex'],
    source_tweet_id: '2019367717539848624',
    why_it_matters:
      "Stop using one tool for everything. Here's the multi-tool workflow that's shipping fastest.",
  },
  {
    id: 'news-claude-no-ads',
    headline: "Anthropic: Claude will never have ads. Here's why it matters.",
    summary:
      "Anthropic committed to ad-free Claude and roasted ChatGPT in a Super Bowl ad. The reasoning: 'Users shouldn't second-guess whether an AI is genuinely helping them or subtly steering the conversation.' With ChatGPT ads incoming, Claude is betting trust beats monetization. Your AI assistant's incentives matter.",
    date: '2026-02-04',
    category: 'announcement',
    tags: ['claude', 'anthropic', 'advertising', 'openai', 'trust'],
    source_tweet_id: '2019024565398299074',
    why_it_matters:
      "When you ask Claude for a tool recommendation, it won't be because someone paid. That matters.",
  },
  {
    id: 'news-prompt-engineering-dead',
    headline: "Prompt engineering is a dead end. Here's what replaced it.",
    summary:
      'The hierarchy of value shifted: (1) System Architecture / Orchestration (2) Evaluation Pipelines / Testing (3) Context Management / Data ... (99) Tweaking prompts. In 2024 you wrote poems for ChatGPT. In 2026 you write Python for agentic workflows. Stop talking to the bot. Build the bot.',
    date: '2026-02-05',
    category: 'mindset_shift',
    tags: ['prompt_engineering', 'agentic_engineering', 'workflow', 'skills'],
    source_tweet_id: '2019401387465957677',
    why_it_matters:
      "If 'prompt engineer' is on your LinkedIn, update it. The skill that matters now is orchestration.",
  },
];

const categoryLabels: Record<Category, string> = {
  mindset_shift: 'MINDSET',
  tips: 'QUICK WIN',
  product_launch: 'LAUNCH',
  workflow: 'WORKFLOW',
  announcement: 'NEWS',
};

const getRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  }
  if (diffDays === 1) {
    return 'yesterday';
  }
  return `${diffDays}d ago`;
};

const SignalCard = ({ item }: { item: FeedItem }): ReactElement => {
  const tweetUrl = `https://twitter.com/i/web/status/${item.source_tweet_id}`;

  return (
    <article className="group flex flex-col gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4 py-4 transition-all hover:bg-surface-hover">
      <div className="flex items-center gap-2 text-xs">
        <span
          className={classNames(
            'rounded-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            item.category === 'mindset_shift' &&
              'bg-accent-onion-subtle text-accent-onion-default',
            item.category === 'tips' &&
              'bg-accent-cabbage-subtle text-accent-cabbage-default',
            item.category === 'product_launch' &&
              'bg-accent-water-subtle text-accent-water-default',
            item.category === 'workflow' &&
              'bg-accent-bun-subtle text-accent-bun-default',
            item.category === 'announcement' &&
              'bg-accent-cheese-subtle text-accent-cheese-default',
          )}
        >
          {categoryLabels[item.category]}
        </span>
        <span className="ml-auto text-text-quaternary">
          {getRelativeDate(item.date)}
        </span>
      </div>

      <Link href={tweetUrl} target="_blank" rel="noopener noreferrer">
        <Typography
          type={TypographyType.Body}
          bold
          className="line-clamp-2 leading-snug transition-colors group-hover:text-accent-cabbage-default"
        >
          {item.headline}
        </Typography>
      </Link>

      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="line-clamp-3 leading-relaxed"
      >
        {item.summary}
      </Typography>

      {/* WHY IT MATTERS - The FOMO hook */}
      <div className="border-accent-cabbage-default/30 bg-accent-cabbage-subtle/50 mt-1 rounded-8 border px-3 py-2">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-cabbage-default">
            Why it matters
          </span>
        </div>
        <Typography
          type={TypographyType.Caption1}
          className="mt-1 font-medium text-text-primary"
        >
          {item.why_it_matters}
        </Typography>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-4 bg-surface-float px-2 py-0.5 text-[10px] text-text-tertiary"
            >
              #{tag.replace(/_/g, '')}
            </span>
          ))}
        </div>
        <Link
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-text-quaternary transition-colors hover:text-text-secondary"
        >
          <TwitterIcon size={IconSize.Size12} />
          <span>source</span>
        </Link>
      </div>
    </article>
  );
};

const AiCodingHubPage = (): ReactElement => {
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');

  const filteredFeedItems = useMemo(() => {
    if (activeCategory === 'ALL') {
      return feedItems;
    }
    return feedItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const todayCount = useMemo(
    () =>
      feedItems.filter((item) => getRelativeDate(item.date) === 'today').length,
    [],
  );

  return (
    <div className="relative min-h-page w-full max-w-full overflow-x-hidden bg-background-default">
      <NextSeo
        title="AI Pulse // daily.dev"
        description="Don't fall behind. The AI coding signals that matter."
      />

      {/* Header */}
      <header className="z-20 bg-background-default/95 sticky top-0 border-b border-border-subtlest-tertiary backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <TerminalIcon
              size={IconSize.Medium}
              className="text-accent-cabbage-default"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Typography type={TypographyType.Title3} bold>
                  AI Pulse
                </Typography>
                <span className="bg-status-success/20 flex items-center gap-1 rounded-4 px-1.5 py-0.5 text-[10px] font-bold text-status-success">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-success" />
                  {todayCount} new
                </span>
              </div>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                Don&apos;t fall behind
              </Typography>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="border-b border-border-subtlest-tertiary bg-surface-float">
        <div className="no-scrollbar mx-auto flex max-w-4xl items-center gap-4 overflow-x-auto px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-quaternary">SIGNALS</span>
            <span className="font-bold text-text-primary">
              {feedItems.length}
            </span>
          </div>
          <span className="text-border-subtlest-tertiary">│</span>
          <div className="flex items-center gap-2">
            <span className="text-text-quaternary">TODAY</span>
            <span className="font-bold text-status-success">{todayCount}</span>
          </div>
          <span className="text-border-subtlest-tertiary">│</span>
          <div className="flex items-center gap-2">
            <span className="text-text-quaternary">FOCUS</span>
            <span className="font-bold text-accent-cheese-default">
              Agentic workflows
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Category Filters */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-border-subtlest-tertiary px-4 py-2">
          <Button
            variant={
              activeCategory === 'ALL'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('ALL')}
            className="flex-shrink-0"
          >
            All
          </Button>
          <Button
            variant={
              activeCategory === 'tips'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('tips')}
            className="flex-shrink-0"
          >
            Quick Wins
          </Button>
          <Button
            variant={
              activeCategory === 'workflow'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('workflow')}
            className="flex-shrink-0"
          >
            Workflows
          </Button>
          <Button
            variant={
              activeCategory === 'product_launch'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('product_launch')}
            className="flex-shrink-0"
          >
            Launches
          </Button>
          <Button
            variant={
              activeCategory === 'mindset_shift'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('mindset_shift')}
            className="flex-shrink-0"
          >
            Mindset
          </Button>
          <Button
            variant={
              activeCategory === 'announcement'
                ? ButtonVariant.Subtle
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.XSmall}
            onClick={() => setActiveCategory('announcement')}
            className="flex-shrink-0"
          >
            News
          </Button>
        </div>

        {/* Feed */}
        <div className="flex flex-col">
          {filteredFeedItems.length > 0 ? (
            filteredFeedItems.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <Typography color={TypographyColor.Quaternary}>
                No signals in this category yet
              </Typography>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-subtlest-tertiary px-4 py-4">
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            Curated from Twitter, GitHub, and the dev community. Updated daily.
          </Typography>
        </div>
      </div>
    </div>
  );
};

AiCodingHubPage.getLayout = getLayout;
AiCodingHubPage.layoutProps = { screenCentered: false, hideBackButton: true };

export default AiCodingHubPage;
