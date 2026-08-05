import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  CardLayout,
  DocsIcon,
  TerminalIcon,
  TimerIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { AgentEmbedCard } from '@dailydotdev/shared/src/features/interests/components/blocks/AgentEmbedCard';
import { AgentCodeBlock } from '@dailydotdev/shared/src/features/interests/components/blocks/AgentCodeBlock';
import { AgentTable } from '@dailydotdev/shared/src/features/interests/components/blocks/AgentTable';
import { AgentPostCard } from '@dailydotdev/shared/src/features/interests/components/AgentPostCard';
import { AgentPickList } from '@dailydotdev/shared/src/features/interests/components/AgentPickList';
import { mockFeedPosts } from '@dailydotdev/shared/src/features/interests/mockFeed';

const noop = (): void => undefined;

const MOCK_USER = {
  id: 'sb-user',
  name: 'Dev Dana',
  username: 'devdana',
  image:
    'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  permalink: 'https://app.daily.dev/devdana',
  createdAt: '2021-01-01T00:00:00.000Z',
  reputation: 42,
  providers: ['github'],
} as const;

const Providers = ({ children }: { children: ReactNode }): ReactElement => {
  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthContextProvider
        user={MOCK_USER as never}
        firstLoad={false}
        isFetched
        loadingUser={false}
        tokenRefreshed
        loadedUserFromCache
        getRedirectUri={() => ''}
        updateUser={noop as never}
        refetchBoot={noop as never}
        visit={{ visitId: 'sb', sessionId: 'sb' } as never}
        accessToken={null as never}
        squads={[]}
        feeds={undefined}
        geo={{} as never}
        isAndroidApp={false}
      >
        <LogContext.Provider
          value={{
            logEvent: noop,
            logEventStart: noop,
            logEventEnd: noop,
            sendBeacon: noop,
          }}
        >
          <SettingsContext.Provider
            value={
              {
                insaneMode: false,
                spaciness: 'roomy',
                loadedSettings: true,
                openNewTab: false,
                flags: {},
              } as never
            }
          >
            <div className="min-h-screen bg-background-default p-6 text-text-primary">
              {children}
            </div>
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}): ReactElement => (
  <FlexCol className="gap-3 border-b border-border-subtlest-quaternary pb-8">
    <FlexCol className="gap-0.5">
      <Typography type={TypographyType.Body} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </FlexCol>
    <FlexCol className="max-w-[45rem] gap-3">{children}</FlexCol>
  </FlexCol>
);

const Blocks = (): ReactElement => (
  <FlexCol className="gap-8">
    <Section
      title="Embed — row"
      description="Points at something the agent can open in the side panel. Replaces the bare text button: the label, the kind and the action each get their own slot."
    >
      <AgentEmbedCard
        icon={<CardLayout size={IconSize.Size16} />}
        title="All 9 findings"
        subtitle="Feed · 9 posts"
        actionLabel="Open"
        onAction={noop}
      />
      <AgentEmbedCard
        icon={<TimerIcon size={IconSize.Size16} />}
        title="Activity"
        subtitle="14 events · last run 42m ago"
        actionLabel="Open"
        onAction={noop}
        onMenu={noop}
      />
      <AgentEmbedCard
        icon={<TerminalIcon size={IconSize.Size16} />}
        title="Debug"
        subtitle="Raw findings and scores"
      />
    </Section>

    <Section
      title="Embed — card"
      description="Same anatomy with a preview area on top, for when the thing being linked has a face."
    >
      <AgentEmbedCard
        media={
          <img
            src={mockFeedPosts[0].image ?? ''}
            alt=""
            className="size-full object-cover"
          />
        }
        icon={<DocsIcon size={IconSize.Size16} />}
        title={mockFeedPosts[0].title ?? ''}
        subtitle={`${mockFeedPosts[0].source?.name} · 7m read`}
        actionLabel="Open"
        onAction={noop}
        onMenu={noop}
      />
    </Section>

    <Section
      title="Code"
      description="For anything the agent generated that a reader may want verbatim — a query, a filter, a config. Copy is always present; run is opt-in."
    >
      <AgentCodeBlock
        label="agent query"
        code={`zig OR ziglang\n  -"vs rust"\n  min_upvotes: 100\n  sources: [github, hn, lobsters]`}
      />
      <AgentCodeBlock
        label="scoring.jsonc"
        runLabel="Re-run"
        onRun={noop}
        code={`{ "recency": 0.4, "source_weight": 0.35, "engagement": 0.25 }`}
      />
    </Section>

    <Section
      title="Table"
      description="For a comparison the agent is making — why something scored the way it did, what changed between runs."
    >
      <AgentTable
        columns={['Signal', 'Weight', 'Effect on this run']}
        rows={[
          ['Recency', '0.40', 'Pushed 3 posts from today to the top'],
          ['Source weight', '0.35', 'Demoted 2 aggregator reposts'],
          ['Engagement', '0.25', 'No change, all candidates cleared the floor'],
        ]}
      />
      <AgentTable
        caption="Run comparison"
        columns={['', 'Yesterday', 'Today']}
        rows={[
          ['Scanned', '96', '128'],
          ['Kept', '14', '6'],
          ['Written up', '1', '1'],
        ]}
      />
    </Section>

    <Section
      title="Post — compact card"
      description="One post the agent wants read. Compact enough to sit inside a sentence, rich enough to judge."
    >
      <AgentPostCard post={mockFeedPosts[0]} onOpen={noop} isViewing={false} />
      <AgentPostCard post={mockFeedPosts[1]} onOpen={noop} isViewing />
    </Section>

    <Section
      title="Post — pick list"
      description="Several posts at once, metadata-first. Titles carry the row; everything else is secondary."
    >
      <AgentPickList
        posts={mockFeedPosts.slice(0, 3)}
        onOpen={noop}
        activePostId={mockFeedPosts[1].id}
      />
    </Section>
  </FlexCol>
);

const meta: Meta = {
  title: 'Features/Interests/AgentBlocks',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <Providers>
      <Blocks />
    </Providers>
  ),
};

export default meta;

export const Default: StoryObj = {};
