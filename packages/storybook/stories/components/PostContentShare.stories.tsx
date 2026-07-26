import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { PostContentShare } from '@dailydotdev/shared/src/components/post/common/PostContentShare';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { getShortLinkProps } from '@dailydotdev/shared/src/hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';

const mockUser = {
  id: '1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2024-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/testuser',
} as unknown as LoggedUser;

const post = {
  id: 'post-1',
  title: 'The pragmatic guide to shipping fast without breaking prod',
  permalink: 'https://api.daily.dev/r/post-1',
  commentsPermalink: 'https://daily.dev/posts/post-1',
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/placeholder',
  createdAt: '2024-01-15T10:30:00.000Z',
  numUpvotes: 42,
  numComments: 12,
  type: PostType.Article,
  source: {
    id: 'tds',
    handle: 'tds',
    name: 'Towards Data Science',
    permalink: 'https://app.daily.dev/sources/tds',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
    type: 'machine',
    active: true,
  },
  userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
} as unknown as Post;

// Same id/permalink (so the seeded query keys still match), longer headline —
// the title is what gets pre-filled as the share text on every network.
const longTitlePost = {
  ...post,
  title:
    'Why your incremental static regeneration strategy is quietly costing you six figures a year, and the four-line config change that fixes it for good',
} as unknown as Post;

const SHORT_LINK = 'https://dly.to/abc123';

// `SocialShareList` renders the "Share via…" chip only when `navigator.share`
// is a function — i.e. mobile web and the mobile apps. Storybook runs in
// desktop Chrome, so the chip is invisible by default. A configurable getter
// lets a single story opt in: every story renders through `Harness`, which sets
// the flag during its own render pass, immediately before its subtree renders,
// so the value is always the one that story asked for.
let hasNativeShare = false;
const noopNativeShare = async () => undefined;

if (typeof globalThis?.navigator !== 'undefined') {
  Object.defineProperty(globalThis.navigator, 'share', {
    configurable: true,
    get: () => (hasNativeShare ? noopNativeShare : undefined),
  });
}

interface HarnessProps {
  /**
   * Whether the `share_upvote_prompt` variant is on. Storybook aliases
   * `@growthbook/growthbook` to a mock whose `getFeatureValue` coerces every
   * falsy default to the truthy string `'control'`, so a flag can't be
   * evaluated as `false` here. Flag-off is therefore simulated by holding the
   * features context as "not ready", which is the exact path
   * `useConditionalFeature` takes to fall back to the (false) default value.
   */
  enabled: boolean;
  /** The prompt only mounts after an upvote; `false` seeds a non-upvoted post. */
  upvoted?: boolean;
  /**
   * `false` leaves the short-URL query unresolved (no authenticated user, so
   * the query never runs) — the component's own loading gate then renders null.
   */
  linkResolved?: boolean;
  /** Expose `navigator.share`, as on mobile web / the mobile apps. */
  nativeShare?: boolean;
  children: ReactNode;
}

function Harness({
  enabled,
  upvoted = true,
  linkResolved = true,
  nativeShare = false,
  children,
}: HarnessProps): ReactElement {
  hasNativeShare = nativeShare;

  // Built once per mount so an interaction (copy, dismiss) isn't wiped by a
  // re-render handing the tree a freshly-seeded client.
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    client.setQueryData(
      generateQueryKey(RequestKey.PostActions, { id: post.id }),
      {
        interaction: upvoted ? 'upvote' : 'none',
        previousInteraction: 'none',
      },
    );

    if (linkResolved) {
      // Seed the resolved short URL so nothing hits the network.
      const { queryKey } = getShortLinkProps(
        post.commentsPermalink,
        ReferralCampaignKey.SharePost,
        mockUser,
      );
      client.setQueryData(queryKey, SHORT_LINK);

      // `SocialShareList` runs the link through `getShortUrl` again on click.
      // Seed that lookup too, otherwise every social button waits on a real
      // API call that Storybook can't make.
      const { queryKey: reshortenKey } = getShortLinkProps(
        SHORT_LINK,
        undefined,
        mockUser,
      );
      client.setQueryData(reshortenKey, SHORT_LINK);
    }

    return client;
  });

  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={
          {
            user: linkResolved ? mockUser : null,
            isLoggedIn: linkResolved,
            isAuthReady: true,
            tokenRefreshed: true,
            shouldShowLogin: false,
            showLogin: fn(),
            closeLogin: fn(),
            logout: fn(),
            updateUser: fn(),
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
        <GrowthBookProvider
          app={BootApp.Webapp}
          user={mockUser}
          deviceId="storybook"
        >
          <FeaturesReadyContext.Provider
            value={{
              ready: enabled,
              getFeatureValue: (feature) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                feature.defaultValue as any,
            }}
          >
            <LogContext.Provider
              value={{
                logEvent: fn(),
                logEventStart: fn(),
                logEventEnd: fn(),
                sendBeacon: () => false,
              }}
            >
              {children}
            </LogContext.Provider>
          </FeaturesReadyContext.Provider>
        </GrowthBookProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

const withHarness =
  (options: Omit<HarnessProps, 'children'>) =>
  (Story: React.ComponentType): ReactElement =>
    (
      <Harness {...options}>
        <div className="mx-auto w-full max-w-[40rem] p-4">
          <Story />
        </div>
      </Harness>
    );

// The component returns `null` in these states, so the canvas would otherwise
// be blank with nothing to tell a reviewer whether that's the point or a bug.
const withEmptyStateNote =
  (note: string) =>
  (Story: React.ComponentType): ReactElement =>
    (
      <div className="mx-auto w-full max-w-[40rem] p-4">
        <p className="mb-2 text-text-tertiary typo-footnote">{note}</p>
        <div className="rounded-12 border border-dashed border-border-subtlest-tertiary p-4">
          <Story />
        </div>
      </div>
    );

const meta: Meta<typeof PostContentShare> = {
  title: 'Components/Share/PostContentShare',
  component: PostContentShare,
  args: { post },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Post-upvote share prompt. Control is the plain "Should anyone else see this post?" copy-link widget; the `share_upvote_prompt` variant (also gated by the `sharing_visibility` master flag) turns it into a prominent card built on the shared `ShareActions` row.',
          '',
          'The widget only has three shapes: **control**, **variant**, and **nothing at all** (not upvoted, or the tracked short link has not resolved yet). Everything below is that matrix crossed with viewport, theme, and the two interactions the card supports — copy and dismiss.',
          '',
          'Stories with a `play` function (`RedesignedCopying`, `RedesignedDismissed`) do not auto-run on this docs page — open them in the Canvas tab to see the interaction.',
        ].join('\n'),
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PostContentShare>;

// -- Variant (flag on) ------------------------------------------------------

// The redesigned prompt at the peak-intent moment right after an upvote.
export const Redesigned: Story = {
  decorators: [withHarness({ enabled: true })],
};

// Same card on dark. Semantic tokens only — no hardcoded colours to drift.
export const RedesignedDark: Story = {
  decorators: [withHarness({ enabled: true })],
  globals: { theme: 'dark' },
};

// Not a visual state: the card's copy is fixed, so the post title never
// reaches the screen — it only feeds the share payload. This story asserts the
// outgoing network URL carries the full headline and the tracked short link,
// rather than pretending there is something to look at. Check the Interactions
// panel, not the pixels.
export const LongTitleSharePayload: Story = {
  args: { post: longTitlePost },
  decorators: [withHarness({ enabled: true })],
  play: async ({ canvasElement }) => {
    const opened: string[] = [];
    const realOpen = globalThis.open;
    globalThis.open = ((url?: string | URL) => {
      opened.push(String(url));
      return null;
    }) as typeof globalThis.open;

    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByTestId('social-share-X'));
      await waitFor(() => expect(opened).toHaveLength(1));
      expect(decodeURIComponent(opened[0])).toContain(longTitlePost.title);
      expect(opened[0]).toContain('dly.to/abc123');
    } finally {
      globalThis.open = realOpen;
    }
  },
};

// Copy tapped: the chip flips to "Copied!" and the card stays mounted, so a
// second destination is still one tap away. The clipboard is stubbed because
// the Storybook iframe isn't allowed to write to the real one.
//
// `useCopyLink` clears `copying` on a 1s timer, which would leave nothing to
// look at a beat after the story loads. Swallowing that one 1s callback holds
// the confirmation on screen for review; the original `setTimeout` is restored
// straight after, so nothing else in the iframe is affected.
export const RedesignedCopying: Story = {
  decorators: [withHarness({ enabled: true })],
  play: async ({ canvasElement }) => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined },
    });

    const realSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = ((
      handler: TimerHandler,
      ms?: number,
      ...rest: unknown[]
    ) =>
      ms === 1000
        ? 0
        : realSetTimeout(handler, ms, ...rest)) as typeof setTimeout;

    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByTestId('social-share-Copy link'));
      await waitFor(() =>
        expect(canvas.getByText('Copied!')).toBeInTheDocument(),
      );
    } finally {
      globalThis.setTimeout = realSetTimeout;
    }
  },
};

// Dismissed: the explicit close button is the only way out of the card, and it
// takes the prompt away for the rest of the session.
export const RedesignedDismissed: Story = {
  decorators: [withHarness({ enabled: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Dismiss share prompt'));
    await waitFor(() =>
      expect(canvas.queryByText('Good call. Now pass it on.')).toBeNull(),
    );
  },
};

// Narrow viewport: the share row centres and wraps onto two rows.
export const RedesignedMobile: Story = {
  decorators: [withHarness({ enabled: true })],
  globals: { viewport: { value: 'mobile1' } },
};

// Mobile with a native share sheet available — the extra "Share via…" chip at
// the end of the row. This is what most real mobile traffic sees.
export const RedesignedMobileNativeShare: Story = {
  decorators: [withHarness({ enabled: true, nativeShare: true })],
  globals: { viewport: { value: 'mobile1' } },
};

// -- Control (flag off) -----------------------------------------------------

// Flag off — must render exactly what ships today.
export const Control: Story = {
  decorators: [withHarness({ enabled: false })],
};

// Today's widget on dark, for a like-for-like comparison with the variant.
export const ControlDark: Story = {
  decorators: [withHarness({ enabled: false })],
  globals: { theme: 'dark' },
};

// Today's widget at 375px — the copy-link input keeps its single row.
export const ControlMobile: Story = {
  decorators: [withHarness({ enabled: false })],
  globals: { viewport: { value: 'mobile1' } },
};

// -- Nothing rendered -------------------------------------------------------

// No upvote, no prompt — the widget sits on the post page at all times and
// gates itself on the interaction.
export const HiddenNotUpvoted: Story = {
  decorators: [
    withHarness({ enabled: true, upvoted: false }),
    withEmptyStateNote(
      'Not upvoted → the component returns null. The dashed box is story chrome; the component itself renders nothing inside it.',
    ),
  ],
};

// The prompt waits for the tracked short link rather than flashing the long
// URL and swapping it — so there is no intermediate visual state to review.
export const HiddenUntilLinkResolves: Story = {
  decorators: [
    withHarness({ enabled: true, linkResolved: false }),
    withEmptyStateNote(
      'Short link unresolved → the component returns null until `useGetShortUrl` settles. The dashed box is story chrome; the component itself renders nothing inside it.',
    ),
  ],
};

// -- Side by side -----------------------------------------------------------

// The A/B call in one frame. Widen the canvas to get them next to each other.
export const ControlVsRedesigned: Story = {
  render: (args) => (
    <div className="flex w-full flex-col gap-6 p-4 laptop:flex-row">
      {[
        { label: 'Control — shipping today', enabled: false },
        { label: 'Variant — share_upvote_prompt', enabled: true },
      ].map(({ label, enabled }) => (
        <div key={label} className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-text-tertiary typo-footnote">{label}</p>
          <Harness enabled={enabled}>
            <PostContentShare {...args} />
          </Harness>
        </div>
      ))}
    </div>
  ),
};
