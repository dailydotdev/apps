import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GrowthBookContext } from '@growthbook/growthbook-react';
import { BriefContent } from '@dailydotdev/shared/src/components/brief/BriefContent';
import { BriefListItem } from '@dailydotdev/shared/src/components/brief/BriefListItem';
import { BriefPostHeaderActions } from '@dailydotdev/shared/src/components/post/brief/BriefPostHeaderActions';
import { BriefPostHeader } from '@dailydotdev/shared/src/features/briefing/components/BriefPostHeader';
import { Pill } from '@dailydotdev/shared/src/components/Pill';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import {
  AnalyticsIcon,
  TimerIcon,
} from '@dailydotdev/shared/src/components/icons';
import { FeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import type { SettingsContextData } from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { Origin, TargetId } from '@dailydotdev/shared/src/lib/log';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                    */
/* -------------------------------------------------------------------------- */

const briefPost = {
  id: 'brief-1',
  slug: 'presidential-briefing-jul-22',
  title: 'Presidential briefing',
  summary:
    'Rust 1.90 lands async closures, Node 24 ships a stable permission model, and three CVEs hit the npm supply chain.',
  commentsPermalink: 'https://app.daily.dev/posts/presidential-briefing-jul-22',
  createdAt: '2026-07-22T06:00:00.000Z',
  readTime: 4,
  read: false,
  flags: { posts: 42, sources: 18 },
} as unknown as Post;

const digestPost = {
  ...briefPost,
  id: 'digest-1',
  slug: 'your-personalized-digest-jul-22',
  title: 'Your personalized digest',
  commentsPermalink:
    'https://app.daily.dev/posts/your-personalized-digest-jul-22',
} as unknown as Post;

const briefWithoutSummary = {
  ...briefPost,
  id: 'brief-no-summary',
  summary: undefined,
} as unknown as Post;

const briefWithLongTitle = {
  ...briefPost,
  id: 'brief-long-title',
  title:
    'Presidential briefing — the npm supply chain incident, Rust 1.90 async closures, and everything else that shipped this week',
} as unknown as Post;

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

/* -------------------------------------------------------------------------- */
/* Feature-flag pinning                                                        */
/* -------------------------------------------------------------------------- */

/**
 * `useConditionalFeature` reads GrowthBook through `FeaturesReadyContext` +
 * `GrowthBookContext`. With neither provider mounted (Storybook's default) every
 * flag resolves to its `defaultValue`, i.e. OFF — so flag-on states have to be
 * pinned explicitly. This provider does that per story instead of relying on the
 * mocked `useFeature`, which returns the string `'control'` (truthy) for
 * everything and therefore can't express an off state.
 */
type FlagMap = Record<string, boolean>;

const FLAGS_ON: FlagMap = {
  sharing_visibility: true,
  share_briefing_digest: true,
};

const FLAGS_OFF: FlagMap = {
  sharing_visibility: false,
  share_briefing_digest: false,
};

const FeatureGate = ({
  flags,
  children,
}: {
  flags: FlagMap;
  children: ReactNode;
}) => {
  const growthbook = useMemo(
    () => ({
      getFeatureValue: (id: string, fallback: unknown) => flags[id] ?? fallback,
    }),
    [flags],
  );

  return (
    <GrowthBookContext.Provider
      value={{ growthbook } as never}
      key={JSON.stringify(flags)}
    >
      <FeaturesReadyContext.Provider
        value={{
          ready: true,
          getFeatureValue: (feature) =>
            (flags[feature.id] ?? feature.defaultValue) as never,
        }}
      >
        {children}
      </FeaturesReadyContext.Provider>
    </GrowthBookContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/* Providers                                                                   */
/* -------------------------------------------------------------------------- */

const settings = {
  loadedSettings: true,
  optOutReadingStreak: false,
  insaneMode: false,
  spaciness: 'eco',
  openNewTab: true,
  sidebarExpanded: false,
  flags: {},
} as unknown as SettingsContextData;

const withProviders = (Story: () => JSX.Element) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  // Mock the short-URL resolution so copy actions don't hit network.
  queryClient.setQueryData(['shortUrl'], 'https://dly.to/abc123');
  // `useOnPostClick` pulls in the reading streak query; seed it so the list
  // stories don't fire a request the Storybook environment can't answer.
  queryClient.setQueryData(generateQueryKey(RequestKey.UserStreak, mockUser), {
    max: 0,
    total: 0,
    current: 0,
    weekStart: 0,
  });

  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: mockUser,
          shouldShowLogin: false,
          isLoggedIn: true,
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
        }}
      >
        <SettingsContext.Provider value={settings}>
          <LogContext.Provider
            value={{
              logEvent: fn(),
              logEventStart: fn(),
              logEventEnd: fn(),
              sendBeacon: () => false,
            }}
          >
            <div className="flex min-h-40 w-full max-w-2xl flex-col justify-center gap-4 p-4">
              <Story />
            </div>
            {/* Every copy action toasts through `useCopy`. Storybook otherwise
                never mounts the renderer, so the confirmation was invisible
                here even though it fires in the app. */}
            <Toast autoDismissNotifications />
          </LogContext.Provider>
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

/* -------------------------------------------------------------------------- */
/* Review helpers                                                              */
/* -------------------------------------------------------------------------- */

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) => (
  <section className="flex w-full flex-col gap-2">
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {title}
    </Typography>
    {!!note && (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {note}
      </Typography>
    )}
    {children}
  </section>
);

/** Opens the share popover so the reviewer sees it without interacting. */
const openSharePopover = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) =>
  waitFor(async () => {
    const [trigger] = within(canvasElement).getAllByLabelText('Share briefing');
    await userEvent.click(trigger);
    await expect(
      within(document.body).getByText('WhatsApp'),
    ).toBeInTheDocument();
  });

const listItemProps = {
  origin: Origin.BriefPage,
  targetId: TargetId.List,
} as const;

/* -------------------------------------------------------------------------- */
/* Briefing body fixture                                                       */
/* -------------------------------------------------------------------------- */

// Shaped like a real briefing: h2 sections, a lead paragraph, and bullet lists.
const briefContentHtml = `
<h2>The npm supply chain took another hit</h2>
<p>Three packages with a combined 40M weekly downloads shipped a post-install script that exfiltrated environment variables. All three were pulled within six hours.</p>
<ul>
  <li><strong>What happened:</strong> a maintainer account with no 2FA was taken over via a reused password from an unrelated breach.</li>
  <li><strong>Who is affected:</strong> anyone who ran a fresh install between Tuesday 02:00 and 08:00 UTC. Lockfile-only installs were not hit.</li>
  <li><strong>What to do:</strong> rotate any credentials that were present in CI during that window, then re-run your install from a clean cache.</li>
</ul>
<h2>Rust 1.90 lands async closures</h2>
<p>The feature has been in nightly for two years. Stabilizing it removes most of the boilerplate around passing async callbacks into combinators.</p>
<ul>
  <li>Async closures now capture by reference, which removes a whole class of lifetime workarounds.</li>
  <li>The <code>AsyncFn</code> trait family is stable alongside it, so libraries can finally accept them in public APIs.</li>
</ul>
<h2>Node 24 ships a stable permission model</h2>
<p>Deno-style permission flags are no longer experimental. Filesystem, network, and child-process access can each be denied at startup.</p>
<ul>
  <li>Opt-in only — existing apps keep full access until you pass the flags.</li>
  <li>Worth wiring into CI first, where the blast radius of a compromised dependency is largest.</li>
</ul>
`;

/* -------------------------------------------------------------------------- */
/* Meta                                                                        */
/* -------------------------------------------------------------------------- */

const meta: Meta = {
  title: 'Components/Share/BriefSharing',
  decorators: [withProviders],
  parameters: {
    docs: {
      description: {
        component:
          'Every state of the briefing / digest sharing surfaces: the briefing-list row, the post header (brief + personalized digest) and the briefing body itself, each in flag-on and flag-off form.',
      },
    },
  },
};

export default meta;

type ListStory = StoryObj<typeof BriefListItem>;

/* ========================================================================== */
/* 1. Row controls                                                            */
/* ========================================================================== */

/**
 * The pair every surface uses: copy link, then the arrow that opens the social
 * popover. The row used to group these behind a dropdown, but with no summary
 * the menu collapsed to two near-identical "copy" entries — more chrome than
 * the controls it hid.
 */
export const RowControls: ListStory = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Section
        title="Small · Tertiary — the briefing list row"
        note="Copy link is one tap; the arrow opens the social surface."
      >
        <div className="flex rounded-16 border border-border-subtlest-tertiary p-4">
          <BriefListItem
            {...listItemProps}
            post={briefPost}
            title="Presidential briefing"
            readTime={4}
            postsCount={42}
            sourcesCount={18}
            showCopyActions
          />
        </div>
      </Section>
      <Section
        title="Medium · Tertiary — the post header"
        note="Same two controls, one size up, plus the settings cog."
      >
        <FeatureGate flags={FLAGS_ON}>
          <div className="flex justify-end rounded-16 border border-border-subtlest-tertiary p-4">
            <BriefPostHeaderActions
              {...headerProps}
              post={briefPost}
              showShareButton
            />
          </div>
        </FeatureGate>
      </Section>
    </div>
  ),
};

/** The social popover itself — no heading, tiles left-aligned, even padding. */
export const SharePopover: ListStory = {
  render: () => (
    <FeatureGate flags={FLAGS_ON}>
      <div className="flex min-h-80 items-end justify-center rounded-16 border border-border-subtlest-tertiary p-4">
        <BriefPostHeaderActions
          {...headerProps}
          post={briefPost}
          showShareButton
        />
      </div>
    </FeatureGate>
  ),
  play: openSharePopover,
};

/* ========================================================================== */
/* 2. Briefing list row                                                       */
/* ========================================================================== */

// Flag on: the row gains the copy menu, pinned via `showCopyActions`.
export const ListItemWithCopyActions: ListStory = {
  render: () => (
    <BriefListItem
      {...listItemProps}
      post={briefPost}
      title={briefPost.title}
      pill={{ label: 'Just in' }}
      readTime={briefPost.readTime}
      postsCount={briefPost.flags?.posts}
      sourcesCount={briefPost.flags?.sources}
      showCopyActions
    />
  ),
};

// The row with its share popover open, over the full-bleed `CardLink` overlay —
// this is the stacking case the `z-1` wrapper exists for.
export const ListItemSharePopoverOpen: ListStory = {
  render: () => (
    <BriefListItem
      {...listItemProps}
      post={briefPost}
      title={briefPost.title}
      pill={{ label: 'Just in' }}
      readTime={briefPost.readTime}
      postsCount={briefPost.flags?.posts}
      sourcesCount={briefPost.flags?.sources}
      showCopyActions
    />
  ),
  play: openSharePopover,
};

// Flag-off control: the row renders exactly as it does on main today.
// `showCopyActions` is pinned explicitly rather than left to the gate, so the
// story stays honest regardless of how Storybook resolves flags.
export const ListItemControl: ListStory = {
  render: () => (
    <BriefListItem
      {...listItemProps}
      post={briefPost}
      title={briefPost.title}
      readTime={briefPost.readTime}
      postsCount={briefPost.flags?.posts}
      sourcesCount={briefPost.flags?.sources}
      showCopyActions={false}
    />
  ),
};

// Read state — title and gradient icon dim, the copy menu stays available.
export const ListItemRead: ListStory = {
  render: () => (
    <BriefListItem
      {...listItemProps}
      post={briefPost}
      title={briefPost.title}
      readTime={briefPost.readTime}
      postsCount={briefPost.flags?.posts}
      sourcesCount={briefPost.flags?.sources}
      isRead
      showCopyActions
    />
  ),
};

// Locked (non-Plus) briefing — the lock badge and the copy menu coexist.
export const ListItemLocked: ListStory = {
  render: () => (
    <BriefListItem
      {...listItemProps}
      post={briefPost}
      title={briefPost.title}
      readTime={briefPost.readTime}
      postsCount={briefPost.flags?.posts}
      sourcesCount={briefPost.flags?.sources}
      isLocked
      showCopyActions
    />
  ),
};

// Long title with the menu present: the text column is `min-w-0` so the
// metadata line truncates instead of pushing the control off the row.
export const ListItemLongTitle: ListStory = {
  render: () => (
    <BriefListItem
      {...listItemProps}
      post={briefWithLongTitle}
      title={briefWithLongTitle.title}
      pill={{ label: 'Just in' }}
      readTime={briefWithLongTitle.readTime}
      postsCount={briefWithLongTitle.flags?.posts}
      sourcesCount={briefWithLongTitle.flags?.sources}
      showCopyActions
    />
  ),
};

// Missing metadata: no read time, no counts — the row falls back to
// "Based on 0 posts from 0 sources" and the menu is unaffected.
export const ListItemMissingMetadata: ListStory = {
  render: () => (
    <BriefListItem
      {...listItemProps}
      post={briefWithoutSummary}
      title="Presidential briefing"
      showCopyActions
    />
  ),
};

// Mobile: below `mobileXL` the gradient icon is hidden, so the copy menu is the
// only control competing with the title for horizontal space.
export const ListItemMobile: ListStory = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div className="w-[360px]">
      <BriefListItem
        {...listItemProps}
        post={briefWithLongTitle}
        title={briefWithLongTitle.title}
        pill={{ label: 'Just in' }}
        readTime={briefWithLongTitle.readTime}
        postsCount={briefWithLongTitle.flags?.posts}
        sourcesCount={briefWithLongTitle.flags?.sources}
        showCopyActions
      />
    </div>
  ),
};

/**
 * Regression guard for the row overflow.
 *
 * `base.css` sets a global `* { flex-shrink: 0 }`, so the text column's old
 * `w-full` made it refuse to shrink and pushed the trailing control past the
 * card border — on every row, not just long titles. The column is now
 * `min-w-0 flex-1`, and the title truncates. Narrow the canvas: the control
 * should stay inside the border at every width.
 */
export const RowShrinkBehaviour: ListStory = {
  render: () => (
    <div className="flex flex-col gap-6">
      {[640, 480, 360].map((width) => (
        <Section key={width} title={`${width}px`}>
          <div style={{ width }}>
            <BriefListItem
              {...listItemProps}
              post={briefWithLongTitle}
              title={briefWithLongTitle.title}
              pill={{ label: 'Just in' }}
              readTime={6}
              postsCount={58}
              sourcesCount={24}
              showCopyActions
            />
          </div>
        </Section>
      ))}
    </div>
  ),
};

/**
 * The glyph vocabulary these surfaces share. One meaning per icon:
 * arrow = opens a share surface, link = copies the bare URL, stacked squares =
 * copies text with the link appended, page = copies the generated summary.
 */
export const IconLanguage: ListStory = {
  render: () => (
    <FeatureGate flags={FLAGS_ON}>
      <div className="flex flex-col gap-6">
        <Section
          title="Arrow — opens a share surface"
          note="Social popover on desktop, native share sheet on mobile. Never a one-tap copy."
        >
          <div className="flex rounded-16 border border-border-subtlest-tertiary p-4">
            <BriefPostHeaderActions
              {...headerProps}
              post={briefPost}
              showShareButton
            />
          </div>
        </Section>
        <Section
          title="Link — copies the link straight to the clipboard"
          note="Its own control on every surface, so the most common action never costs two taps."
        >
          <div className="rounded-16 border border-border-subtlest-tertiary p-4">
            <BriefListItem
              {...listItemProps}
              post={briefPost}
              title="Presidential briefing"
              readTime={4}
              postsCount={42}
              sourcesCount={18}
              showCopyActions
            />
          </div>
        </Section>
        <Section
          title="Copy (stacked squares) — copies text, with the link appended"
          note="Used on every item inside the briefing. What lands on the clipboard is quotable prose that still carries attribution, so a paste into Slack is shareable on its own."
        >
          <div className="rounded-16 border border-border-subtlest-tertiary px-4 [&_.brief-item-copy-mount_button]:!opacity-100">
            <BriefContent
              post={briefPost}
              origin={Origin.ArticlePage}
              contentHtml={`<h2>Section heading</h2><ul><li>A single bullet, copied with the briefing link appended.</li></ul>`}
              showItemActions
            />
          </div>
        </Section>
      </div>
    </FeatureGate>
  ),
};

/* ========================================================================== */
/* Inside the briefing post                                                   */
/* ========================================================================== */

/** The briefing page chrome, so the header controls are seen in context. */
const BriefingPage = ({
  showItemActions,
  post = briefPost,
}: {
  showItemActions?: boolean;
  post?: Post;
}) => (
  <article className="flex flex-col gap-6">
    <BriefPostHeader
      kicker={post.title ?? ''}
      heading="Your presidential briefing"
      stats={[
        { Icon: TimerIcon, label: 'Save 38m of reading' },
        { Icon: AnalyticsIcon, label: '42 posts analyzed' },
      ]}
    >
      <BriefPostHeaderActions
        {...headerProps}
        post={post}
        origin={Origin.ArticlePage}
        showShareButton
      />
    </BriefPostHeader>
    <div className="-mt-3 flex flex-wrap items-center gap-3">
      <Pill
        className="rounded-20 border border-border-subtlest-tertiary px-2.5 py-2 font-normal"
        label={
          <span className="flex items-center gap-1">
            <TimerIcon aria-hidden className="text-text-tertiary" />
            <Typography type={TypographyType.Footnote}>4m read</Typography>
          </span>
        }
      />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        18 Sources
      </Typography>
    </div>
    <BriefContent
      post={post}
      origin={Origin.ArticlePage}
      contentHtml={briefContentHtml}
      showItemActions={showItemActions}
    />
  </article>
);

/**
 * The whole briefing as a reader sees it, flag on: copy-link + share arrow in
 * the header, and a copy-text control on every section heading and every bullet
 * (the item's text with the briefing link appended, so a paste is quotable and
 * still attributed). The per-item controls sit dimmed at rest and come to full
 * strength on hover or focus — never hover-only, which would make them
 * undiscoverable on a mouse and unreachable on touch.
 */
export const InsideBriefing: ListStory = {
  render: () => (
    <FeatureGate flags={FLAGS_ON}>
      <BriefingPage showItemActions />
    </FeatureGate>
  ),
};

/** Same briefing with every per-item control forced visible, for review. */
export const InsideBriefingItemsRevealed: ListStory = {
  parameters: {
    pseudo: { hover: true },
  },
  render: () => (
    <FeatureGate flags={FLAGS_ON}>
      <div className="[&_.brief-item-copy-mount_button]:!opacity-100">
        <BriefingPage showItemActions />
      </div>
    </FeatureGate>
  ),
};

/** Flag off — the briefing body is exactly what main renders today. */
export const InsideBriefingControl: ListStory = {
  render: () => (
    <FeatureGate flags={FLAGS_OFF}>
      <BriefingPage showItemActions={false} />
    </FeatureGate>
  ),
};

// The `/briefing` page as a reviewer would actually see it: newest unread at the
// top, older reads below, one locked demo row.
export const BriefingList: ListStory = {
  render: () => (
    <div className="flex flex-col gap-3">
      <BriefListItem
        {...listItemProps}
        post={briefPost}
        title="Presidential briefing"
        pill={{ label: 'Just in' }}
        readTime={4}
        postsCount={42}
        sourcesCount={18}
        showCopyActions
      />
      <BriefListItem
        {...listItemProps}
        post={briefWithLongTitle}
        title={briefWithLongTitle.title}
        readTime={6}
        postsCount={58}
        sourcesCount={24}
        showCopyActions
      />
      <BriefListItem
        {...listItemProps}
        post={briefPost}
        title="Presidential briefing"
        readTime={3}
        postsCount={31}
        sourcesCount={12}
        isRead
        showCopyActions
      />
      <BriefListItem
        {...listItemProps}
        post={briefWithoutSummary}
        title="Presidential briefing"
        readTime={5}
        postsCount={47}
        sourcesCount={21}
        isRead
        isLocked
        showCopyActions
      />
    </div>
  ),
};

/* ========================================================================== */
/* 3. Post header (brief + digest)                                            */
/* ========================================================================== */

const headerProps = {
  contextMenuId: 'brief-header-actions',
  origin: Origin.ArticlePage,
} as const;

/**
 * The header reads the gate directly (no override prop), so these stories pin
 * `share_briefing_digest` through `FeatureGate`.
 */
export const PostHeaderShareEnabled: StoryObj<typeof BriefPostHeaderActions> = {
  render: () => (
    <FeatureGate flags={FLAGS_ON}>
      <div className="flex justify-end rounded-16 border border-border-subtlest-tertiary p-4">
        <BriefPostHeaderActions
          {...headerProps}
          post={briefPost}
          showShareButton
        />
      </div>
    </FeatureGate>
  ),
};

// Flag off: the legacy desktop-only copy-link button, exactly as main ships it.
// Below the `laptop` breakpoint this row shows nothing but the container.
export const PostHeaderControl: StoryObj<typeof BriefPostHeaderActions> = {
  render: () => (
    <FeatureGate flags={FLAGS_OFF}>
      <div className="flex justify-end rounded-16 border border-border-subtlest-tertiary p-4">
        <BriefPostHeaderActions
          {...headerProps}
          post={briefPost}
          showShareButton
        />
      </div>
    </FeatureGate>
  ),
};

// `showShareButton` omitted — the settings cog only. This is what the digest
// post renders today, before the parity fix.
export const PostHeaderWithoutShare: StoryObj<typeof BriefPostHeaderActions> = {
  render: () => (
    <FeatureGate flags={FLAGS_ON}>
      <div className="flex justify-end rounded-16 border border-border-subtlest-tertiary p-4">
        <BriefPostHeaderActions {...headerProps} post={briefPost} />
      </div>
    </FeatureGate>
  ),
};

// The share popover opened from the header trigger (desktop path). On mobile the
// same trigger taps straight through to the native share sheet.
export const PostHeaderSharePopover: StoryObj<typeof BriefPostHeaderActions> = {
  render: () => (
    <FeatureGate flags={FLAGS_ON}>
      <div className="flex justify-end rounded-16 border border-border-subtlest-tertiary p-4">
        <BriefPostHeaderActions
          {...headerProps}
          post={briefPost}
          showShareButton
        />
      </div>
    </FeatureGate>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByLabelText('Share briefing');
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(within(document.body).getByText(/copy/i)).toBeInTheDocument(),
    );
  },
};

// Digest parity: the brief and the digest render the same header component. The
// fix is that the digest now passes `showShareButton` too — both rows should
// look identical.
export const DigestParity: StoryObj<typeof BriefPostHeaderActions> = {
  render: () => (
    <FeatureGate flags={FLAGS_ON}>
      <div className="flex flex-col gap-4">
        <Section title="Presidential briefing — share button (unchanged)">
          <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary p-4">
            <Typography type={TypographyType.Title3} bold>
              {briefPost.title}
            </Typography>
            <BriefPostHeaderActions
              {...headerProps}
              post={briefPost}
              showShareButton
            />
          </div>
        </Section>
        <Section
          title="Personalized digest — share button (added by this PR)"
          note="On main this header has no share affordance at all."
        >
          <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary p-4">
            <Typography type={TypographyType.Title3} bold>
              {digestPost.title}
            </Typography>
            <BriefPostHeaderActions
              {...headerProps}
              post={digestPost}
              showShareButton
            />
          </div>
        </Section>
      </div>
    </FeatureGate>
  ),
};

/* ========================================================================== */
/* 4. Overview — every surface, flag on vs flag off                           */
/* ========================================================================== */

export const Overview: ListStory = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex w-full flex-col gap-8">
      <Section
        title="1 · Briefing list row"
        note="Flag on adds one icon trigger at the end of the row; flag off is byte-identical to main."
      >
        <div className="flex flex-col gap-3">
          <BriefListItem
            {...listItemProps}
            post={briefPost}
            title="Presidential briefing — copy actions ON"
            pill={{ label: 'Just in' }}
            readTime={4}
            postsCount={42}
            sourcesCount={18}
            showCopyActions
          />
          <BriefListItem
            {...listItemProps}
            post={briefPost}
            title="Presidential briefing — copy actions OFF (control)"
            readTime={4}
            postsCount={42}
            sourcesCount={18}
            showCopyActions={false}
          />
        </div>
      </Section>

      <Section
        title="2 · Row states"
        note="Unread · read · locked · long title. The menu is present in all of them."
      >
        <div className="flex flex-col gap-3">
          <BriefListItem
            {...listItemProps}
            post={briefPost}
            title="Unread"
            pill={{ label: 'Just in' }}
            readTime={4}
            postsCount={42}
            sourcesCount={18}
            showCopyActions
          />
          <BriefListItem
            {...listItemProps}
            post={briefPost}
            title="Read"
            readTime={3}
            postsCount={31}
            sourcesCount={12}
            isRead
            showCopyActions
          />
          <BriefListItem
            {...listItemProps}
            post={briefPost}
            title="Locked (non-Plus)"
            readTime={5}
            postsCount={47}
            sourcesCount={21}
            isLocked
            showCopyActions
          />
          <BriefListItem
            {...listItemProps}
            post={briefWithLongTitle}
            title={briefWithLongTitle.title}
            readTime={6}
            postsCount={58}
            sourcesCount={24}
            showCopyActions
          />
        </div>
      </Section>

      <Section
        title="3 · The share popover"
        note="No heading, tiles left-aligned, equal padding on all four sides. Open the arrow on any row above."
      >
        <FeatureGate flags={FLAGS_ON}>
          <div className="flex justify-end rounded-16 border border-border-subtlest-tertiary p-4">
            <BriefPostHeaderActions
              {...headerProps}
              post={briefPost}
              showShareButton
            />
          </div>
        </FeatureGate>
      </Section>

      <Section
        title="4 · Post header — brief"
        note="Flag on: copy-link button + share arrow, both outside the laptop-only wrapper. Flag off: the single desktop-only copy button."
      >
        <div className="flex flex-col gap-3">
          <FeatureGate flags={FLAGS_ON}>
            <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary p-4">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                flag ON
              </Typography>
              <BriefPostHeaderActions
                {...headerProps}
                post={briefPost}
                showShareButton
              />
            </div>
          </FeatureGate>
          <FeatureGate flags={FLAGS_OFF}>
            <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary p-4">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                flag OFF (control)
              </Typography>
              <BriefPostHeaderActions
                {...headerProps}
                post={briefPost}
                showShareButton
              />
            </div>
          </FeatureGate>
        </div>
      </Section>

      <Section
        title="5 · Post header — personalized digest"
        note="Same component, previously rendered without showShareButton. Now at parity with the brief."
      >
        <div className="flex flex-col gap-3">
          <FeatureGate flags={FLAGS_ON}>
            <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary p-4">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                after (flag ON)
              </Typography>
              <BriefPostHeaderActions
                {...headerProps}
                post={digestPost}
                showShareButton
              />
            </div>
          </FeatureGate>
          <FeatureGate flags={FLAGS_ON}>
            <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary p-4">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                before (today on main)
              </Typography>
              <BriefPostHeaderActions {...headerProps} post={digestPost} />
            </div>
          </FeatureGate>
        </div>
      </Section>

      <Section
        title="6 · Inside the briefing body"
        note="Every section heading and every bullet gets a copy-text control (link appended, so the paste stays attributed). Dimmed at rest, full strength on hover or focus. Pinned at full strength here; see the Inside Briefing stories for the real resting state."
      >
        <FeatureGate flags={FLAGS_ON}>
          <div className="rounded-16 border border-border-subtlest-tertiary px-4 [&_.brief-item-copy-mount_button]:!opacity-100">
            <BriefContent
              post={briefPost}
              origin={Origin.ArticlePage}
              contentHtml={briefContentHtml}
              showItemActions
            />
          </div>
        </FeatureGate>
      </Section>
    </div>
  ),
};
