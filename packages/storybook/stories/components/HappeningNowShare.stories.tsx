import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DigestCTA } from '@dailydotdev/shared/src/components/highlights/DigestCTA';
import { HighlightItem } from '@dailydotdev/shared/src/components/highlights/HighlightItem';
import { HighlightShareButton } from '@dailydotdev/shared/src/components/highlights/HighlightShareButton';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import type { PostHighlightFeed } from '@dailydotdev/shared/src/graphql/highlights';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { fn } from 'storybook/test';

const CHANNEL_LINK = 'https://app.daily.dev/highlights/agents';
const PAGE_LINK = 'https://app.daily.dev/highlights';

const digest = {
  frequency: 'daily',
  source: {
    id: 'source-1',
    name: 'AI agents',
    image: 'https://daily.dev/image.jpg',
    handle: 'ai-agents',
    permalink: 'https://app.daily.dev/sources/ai-agents',
  },
};

const highlight: PostHighlightFeed = {
  id: 'highlight-1',
  channel: 'agents',
  headline: 'Agent frameworks converge on a single tool-calling spec',
  highlightedAt: new Date().toISOString(),
  significance: 'major',
  post: {
    id: 'post-1',
    type: 'article',
    commentsPermalink: 'https://app.daily.dev/posts/post-1',
    summary:
      'The three biggest agent frameworks now emit the same tool-calling payload, which means adapters written for one runtime drop straight into the others.',
  },
};

// The Happening Now header is part of `HighlightsPage`, which needs the router
// and the highlights queries. The header row is reproduced here only so the
// page-level control can be reviewed next to the other two levels.
const PageHeader = (): React.ReactElement => (
  <header className="flex items-center px-3 py-4 laptop:px-4">
    <h1 className="font-bold text-text-primary typo-large-title">
      Happening Now
    </h1>
    <HighlightShareButton
      link={PAGE_LINK}
      text="See what's happening now in tech on daily.dev"
      label="Share Happening Now"
      level="page"
      targetId="Headlines"
      buttonSize={ButtonSize.Small}
      className="ml-auto shrink-0"
    />
  </header>
);

interface SurfaceProps {
  showShare: boolean;
}

const HappeningNowSurface = ({
  showShare,
}: SurfaceProps): React.ReactElement => (
  <div className="flex w-full flex-col border-x border-border-subtlest-tertiary">
    {showShare ? (
      <PageHeader />
    ) : (
      <header className="flex items-center px-3 py-4 laptop:px-4">
        <h1 className="font-bold text-text-primary typo-large-title">
          Happening Now
        </h1>
      </header>
    )}
    <DigestCTA
      digest={digest}
      displayName="AI agents"
      shareLink={showShare ? CHANNEL_LINK : undefined}
    />
    <HighlightItem
      highlight={highlight}
      defaultExpanded
      showShare={showShare}
    />
    <HighlightItem
      highlight={{ ...highlight, id: 'highlight-2', headline: 'Second story' }}
      showShare={showShare}
    />
  </div>
);

const meta: Meta<typeof HappeningNowSurface> = {
  title: 'Components/Share/HappeningNow',
  component: HappeningNowSurface,
  args: { showShare: true },
  argTypes: {
    showShare: {
      control: 'boolean',
      description:
        'Resolved value of `share_happening_now` (AND the `sharing_visibility` master switch). `HighlightsPage` evaluates it once and threads it down, so these stories take the resolved boolean directly — no GrowthBook mock is involved and the off state is a real control.',
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      const LogContext = getLogContextStatic();

      return (
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider
            value={
              {
                user: null,
                shouldShowLogin: false,
                isLoggedIn: false,
                isAuthReady: true,
                showLogin: fn(),
                closeLogin: fn(),
                logout: fn(),
                updateUser: fn(),
                tokenRefreshed: true,
                getRedirectUri: fn(),
                loadingUser: false,
                loadedUserFromCache: true,
                refetchBoot: fn(),
                squads: [],
                isAndroidApp: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any
            }
          >
            <LogContext.Provider
              value={{
                logEvent: fn(),
                logEventStart: fn(),
                logEventEnd: fn(),
                sendBeacon: () => false,
              }}
            >
              <div className="mx-auto flex w-full max-w-2xl">
                <Story />
              </div>
            </LogContext.Provider>
          </AuthContext.Provider>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof HappeningNowSurface>;

// All three levels at once — page header, channel digest CTA, expanded
// highlight. Only the expanded highlight exposes an item-level control, so the
// levels never pile up into a row of share buttons.
export const AllLevels: Story = {
  args: { showShare: true },
};

// True control: the same surface with the resolved flag off. Nothing about the
// existing markup changes.
export const FlagOff: Story = {
  args: { showShare: false },
};

// Level 1 — the whole Happening Now page.
export const PageLevel: Story = {
  render: () => <PageHeader />,
};

// Level 2 — a single channel/topic, next to the digest subscribe control.
export const TopicLevel: Story = {
  render: () => (
    <DigestCTA
      digest={digest}
      displayName="AI agents"
      shareLink={CHANNEL_LINK}
    />
  ),
};

// Level 3 — a single highlight, next to "Read more".
export const ItemLevel: Story = {
  render: () => (
    <HighlightItem highlight={highlight} defaultExpanded showShare />
  ),
};

// `ShareActions` switches to a one-tap native share sheet below the laptop
// breakpoint (it reads the real viewport via `useViewSize`), so narrow the
// preview pane to exercise it. The frame below only previews the layout at
// mobile width.
export const MobileWidth: Story = {
  args: { showShare: true },
  render: (args) => (
    <div className="w-[375px] border border-border-subtlest-tertiary">
      <HappeningNowSurface {...args} />
    </div>
  ),
};
