import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { NextSeo } from 'next-seo';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentProvider } from '@dailydotdev/shared/src/features/interests/AgentContext';
import { AgentGlassComposer } from '@dailydotdev/shared/src/features/interests/components/AgentGlassComposer';
import { AgentFeedDock } from '@dailydotdev/shared/src/features/interests/components/AgentFeedDock';
import { toMonitorItems } from '@dailydotdev/shared/src/features/interests/monitorItems';
import { AgentMonitor } from '@dailydotdev/shared/src/features/interests/components/AgentMonitor';
import { AgentPostCard } from '@dailydotdev/shared/src/features/interests/components/AgentPostCard';
import { mockFeedPosts } from '@dailydotdev/shared/src/features/interests/mockFeed';
import { recentMockAgents } from '@dailydotdev/shared/src/features/interests/mock';
import { mockNow } from '@dailydotdev/shared/src/features/interests/mockClock';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/common';

// Stands the docked prompt over a mock feed without boot or the flag, beside a
// widenable stand-in sidebar, which is what the dock has to keep up with.
const Page = (): ReactElement => {
  const [query, setQuery] = useState('');
  const [agents] = useState(recentMockAgents);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <AgentDemoProviders>
      <NextSeo title="Agent feed prompt" noindex nofollow />
      {/* The cards carry an add-to-chat button, which reads the agent. */}
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
                // The clock the fixtures were built from: against the real
                // one half the rows fall out of the fresh window.
                pending={
                  <AgentMonitor items={toMonitorItems(agents, mockNow())} />
                }
              />
            </AgentFeedDock>
          </div>
        </div>
      </AgentProvider>
    </AgentDemoProviders>
  );
};

export { devPageServerSideProps as getServerSideProps } from '../../lib/devPage';

export default Page;
