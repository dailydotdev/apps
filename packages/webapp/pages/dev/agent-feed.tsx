import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentProvider } from '@dailydotdev/shared/src/features/interests/AgentContext';
import { AgentGlassComposer } from '@dailydotdev/shared/src/features/interests/components/AgentGlassComposer';
import { AgentFeedDock } from '@dailydotdev/shared/src/features/interests/components/AgentFeedDock';
import {
  AgentMonitor,
  toMonitorItems,
} from '@dailydotdev/shared/src/features/interests/components/AgentMonitor';
import { AgentPostCard } from '@dailydotdev/shared/src/features/interests/components/AgentPostCard';
import { mockFeedPosts } from '@dailydotdev/shared/src/features/interests/mockFeed';
import { recentMockAgents } from '@dailydotdev/shared/src/features/interests/mock';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/common';

/**
 * /dev/agent-feed — the glass prompt docked over a feed.
 *
 * The real mount is `MainFeedPage`, which needs boot and the `interest_agent`
 * flag, so it renders nothing on a dev server with no backend. This route
 * stands the same field over a mock feed, next to a stand-in sidebar that can
 * be widened, which is what the dock has to keep up with. Carries
 * `noindex`/`nofollow`.
 */
const Page = (): ReactElement => {
  const [query, setQuery] = useState('');
  const [agents] = useState(recentMockAgents);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <AgentDemoProviders>
      <NextSeo title="Agent feed prompt" noindex nofollow />
      {/* The cards carry an add-to-chat button, which reads the agent it
          belongs to. */}
      <AgentProvider id="demo" isDemo initialMessages={[]}>
        <div className="flex min-h-[100dvh] flex-row bg-background-default">
          <aside
            className="shrink-0 border-r border-border-subtlest-tertiary bg-background-subtle transition-[width] duration-300"
            style={{ width: isSidebarOpen ? 240 : 60 }}
          />
          <div className="min-w-0 flex-1 pb-40 pt-6">
            <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-3 px-4">
              <Button
                variant={ButtonVariant.Subtle}
                className="self-start"
                onClick={() => setIsSidebarOpen((open) => !open)}
              >
                {isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              </Button>
              {mockFeedPosts.map((post) => (
                <AgentPostCard
                  key={post.id}
                  post={post}
                  onOpen={() => undefined}
                  isViewing={false}
                />
              ))}
            </div>
            <AgentFeedDock>
              <AgentGlassComposer
                value={query}
                onChange={setQuery}
                onSubmit={() => undefined}
                pending={<AgentMonitor items={toMonitorItems(agents)} />}
              />
            </AgentFeedDock>
          </div>
        </div>
      </AgentProvider>
    </AgentDemoProviders>
  );
};

/*
 * Client-only. The mock data takes its timestamps from the clock when it is
 * built, so the server's copy and the browser's are seconds apart and every
 * relative time hydrates as a mismatch — "7m" against "7m" that disagree. A
 * review surface gains nothing from being server-rendered, and this removes the
 * whole class rather than silencing one warning.
 */
export default dynamic(() => Promise.resolve(Page), { ssr: false });
