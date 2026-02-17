import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { NextSeo } from 'next-seo';
import { getLayout } from '../components/layouts/NoSidebarLayout';
import { feedItems } from '../data/aiCodingHubData';

type MonitoredModel = {
  id: string;
  label: string;
  keywords: string[];
};

const monitoredModels: MonitoredModel[] = [
  {
    id: 'codex',
    label: 'Codex',
    keywords: ['codex', 'gpt-5', 'chatgpt', 'openai'],
  },
  {
    id: 'opus',
    label: 'Opus',
    keywords: ['opus', 'anthropic', 'claude 4.6'],
  },
  {
    id: 'claude_code',
    label: 'Claude Code',
    keywords: ['claude code', 'claude', 'anthropic'],
  },
  {
    id: 'cursor',
    label: 'Cursor',
    keywords: ['cursor'],
  },
  {
    id: 'kimi',
    label: 'Kimi',
    keywords: ['kimi', 'moonshot'],
  },
  {
    id: 'copilot',
    label: 'Copilot',
    keywords: ['copilot', 'github copilot'],
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    keywords: ['opencode', 'open code'],
  },
];

const AiCodingHubMonitorPage = (): ReactElement => {
  const monitoredTags = useMemo(() => {
    const counts = new Map<string, number>();

    feedItems.forEach((item) => {
      item.tags.forEach((tag) => {
        const normalizedTag = tag.trim();
        if (!normalizedTag) {
          return;
        }
        counts.set(normalizedTag, (counts.get(normalizedTag) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div className="min-h-screen bg-background-default text-text-primary">
      <NextSeo
        title="AI Coding Hub // Monitored Models & Tags"
        description="Overview of all models and tags monitored by AI Coding Hub."
      />
      <div className="mx-auto max-w-lg border-x border-border-subtlest-tertiary bg-background-default">
        <header className="border-b border-border-subtlest-tertiary px-3 py-3">
          <h1 className="text-[15px] font-semibold text-text-primary">
            Monitored Models & Tags
          </h1>
          <p className="mt-0.5 text-[12px] text-text-tertiary">
            Complete overview of all entities we track in this feed.
          </p>
          <Link
            href="/ai-coding-hub"
            className="mt-2 inline-flex rounded-8 border border-border-subtlest-tertiary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          >
            Back to feed
          </Link>
        </header>

        <section className="border-b border-border-subtlest-tertiary px-3 py-3">
          <h2 className="text-[15px] font-semibold text-text-primary">
            Models we monitor
          </h2>
          <div className="mt-2 space-y-2">
            {monitoredModels.map((model) => (
              <article
                key={model.id}
                className="rounded-10 border border-border-subtlest-tertiary bg-surface-float p-2"
              >
                <p className="text-[12px] font-semibold text-text-primary">
                  {model.label}
                </p>
                <p className="mt-0.5 text-[10px] text-text-tertiary">
                  {model.keywords.join(', ')}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-3 py-3">
          <h2 className="text-[15px] font-semibold text-text-primary">
            Tags we monitor
          </h2>
          <div className="mt-2 space-y-1.5">
            {monitoredTags.map(({ tag, count }) => (
              <div
                key={tag}
                className="flex items-center justify-between rounded-8 border border-border-subtlest-tertiary bg-surface-float px-2 py-1.5"
              >
                <span className="text-[12px] text-text-primary">#{tag}</span>
                <span className="text-[10px] text-text-secondary">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

AiCodingHubMonitorPage.getLayout = getLayout;
AiCodingHubMonitorPage.layoutProps = {
  screenCentered: false,
  hideBackButton: true,
};

export default AiCodingHubMonitorPage;
