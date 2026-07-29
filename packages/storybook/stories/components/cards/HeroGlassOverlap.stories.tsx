import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { ArticleFeaturedWideGridCard } from '@dailydotdev/shared/src/components/cards/article/ArticleFeaturedWideGridCard';

import { defaultBootData, getBootMock } from '../../../mock/boot';

/**
 * The hero (featured-wide) card floats the glass action pill absolutely at
 * `bottom-2` over the *content* column. `FeaturedWideActions` reserves an
 * `h-14` spacer under the text so the clipped text should end above the pill —
 * but the text column is `flex-1 overflow-hidden` and both the title
 * (`line-clamp-3`) and the TLDR (`line-clamp-3`) fight for the same fixed
 * `min-h-cardGlass` (21.5rem) height. When title + tags + metadata + TLDR are
 * tall enough, the TLDR's last line gets clipped hard right against the pill —
 * which reads as "the actions bar cuts over the TLDR".
 *
 * This page renders the REAL `ArticleFeaturedWideGridCard` across a matrix of
 * title length × TLDR length × engagement metrics so every case where the
 * overlap shows up (or doesn't) is visible side by side.
 */

const queryClient = new QueryClient();

// The hero card enters glass mode via `useFeedCardGlassActions`, which only
// resolves a flag once the features-ready gate flips true. Seeding `exp.features`
// on the boot data flips that gate; the mocked GrowthBook then returns a truthy
// value for `feed_card_glass_actions` (default is off), so the glass pill
// renders here regardless of the real experiment state.
const GlassProviders = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <BootDataProvider
      app={BootApp.Extension}
      deviceId="123"
      getPage={fn()}
      getRedirectUri={fn()}
      version="pwa"
      localBootData={getBootMock({
        ...defaultBootData,
        exp: { f: '{}', e: [], a: [], features: {} },
      })}
    >
      <ActiveFeedContext.Provider value={{ items: [], queryKey: [] }}>
        {children}
      </ActiveFeedContext.Provider>
    </BootDataProvider>
  </QueryClientProvider>
);

const mockSource = {
  id: 'iw',
  handle: 'infoworld',
  name: 'InfoWorld',
  permalink: 'https://app.daily.dev/sources/infoworld',
  image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
  type: 'machine' as const,
  active: true,
};

const mockAuthor = {
  id: 'author-1',
  name: 'John Developer',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/avatars/default',
  permalink: 'https://app.daily.dev/johndeveloper',
  username: 'johndeveloper',
  bio: 'Full-stack developer',
};

const coverImage =
  'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/article-placeholder';

const basePost = {
  numUpvotes: 39,
  numComments: 4,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  tags: ['webdev', 'javascript'],
  source: mockSource,
  author: mockAuthor,
  readTime: 1,
  createdAt: '2024-01-15T10:30:00.000Z',
  permalink: 'https://api.daily.dev/r/article-1',
  commentsPermalink: 'https://daily.dev/posts/article-1',
  image: coverImage,
  type: PostType.Article,
  hero: { significance: 'major' },
  userState: {
    vote: UserVote.None,
    flags: { feedbackDismiss: false },
  },
};

let idCounter = 0;
const make = (overrides: Record<string, unknown>): Post => {
  idCounter += 1;
  return {
    ...basePost,
    id: `hero-${idCounter}`,
    ...overrides,
  } as unknown as Post;
};

// --- Content ladders ------------------------------------------------------

const TITLES: Record<string, string> = {
  '1 line': 'ES2026 approved',
  '2 lines': 'ECMAScript 2026 specification approved',
  '3 lines':
    'ECMAScript 2026 specification approved by ECMA International after committee review',
  'overflow (clamps to 3)':
    'ECMAScript 2026 specification approved by ECMA International after a long standards committee review process spanning several years of iteration and debate',
};

const TLDRS: Record<string, string | undefined> = {
  none: undefined,
  short: 'A quick one-line summary of the change.',
  medium:
    'ECMA International has approved ECMAScript 2026, the 17th edition of the JavaScript specification.',
  'long (clamps to 3)':
    'ECMA International has approved ECMAScript 2026 (ES2026), the 17th edition of the JavaScript specification, marking 30 years since the language first appeared and bundling a set of long-awaited language features.',
  'very long (clamps to 3)':
    'ECMA International has approved ECMAScript 2026 (ES2026), the 17th edition of the JavaScript specification, marking 30 years since the language first appeared. The release bundles a set of long-awaited language features, developer-experience improvements and standard-library additions that have been requested by the community for a long time and finally reached stage four.',
};

const METRICS: Record<string, { numUpvotes: number; numComments: number }> = {
  'zero (0 / 0)': { numUpvotes: 0, numComments: 0 },
  'small (39 / 4)': { numUpvotes: 39, numComments: 4 },
  'large (9.8K / 1.2K)': { numUpvotes: 9800, numComments: 1240 },
  'huge (128K / 44K)': { numUpvotes: 128000, numComments: 44300 },
};

const actionHandlers = {
  onPostClick: fn(),
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
  onShare: fn(),
  onReadArticleClick: fn(),
};

const gridContainerStyle = {
  '--num-cards': 3,
  '--feed-gap': '2rem',
} as React.CSSProperties;

// A single hero rendered at its real feed footprint: 2 columns wide, alone in
// the row so its height collapses to `min-h-cardGlass` — the constrained height
// where the overlap actually happens.
const HeroCell = ({
  post,
  label,
  note,
}: {
  post: Post;
  label: string;
  note?: string;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <div className="flex items-baseline gap-2">
      <span className="font-bold text-text-primary typo-footnote">{label}</span>
      {note && (
        <span className="text-text-quaternary typo-caption1">{note}</span>
      )}
    </div>
    <div
      className="grid w-full max-w-[42rem] grid-cols-2 gap-8"
      style={gridContainerStyle}
    >
      <ArticleFeaturedWideGridCard
        post={post}
        wideColSpan={2}
        domProps={{ className: 'col-span-2' }}
        {...actionHandlers}
      />
    </div>
  </div>
);

const SectionShell = ({
  title,
  children,
  intro,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="mb-16">
    <h3 className="mb-2 text-xl font-bold text-text-primary">{title}</h3>
    {intro && (
      <p className="mb-6 max-w-3xl text-sm text-text-tertiary">{intro}</p>
    )}
    <div className="flex flex-col gap-10">{children}</div>
  </section>
);

const PageShell = ({ children }: { children: ReactNode }): ReactElement => (
  <GlassProviders>
    <div className="min-h-screen bg-background-default p-8">
      <h2 className="mb-2 text-2xl font-bold text-text-primary">
        Hero card — glass actions vs. TLDR overlap
      </h2>
      <p className="mb-10 max-w-3xl text-sm text-text-tertiary">
        The floating glass action pill sits{' '}
        <code>absolute inset-x-2 bottom-2</code> over the content column. The
        text column is <code>flex-1 overflow-hidden</code> inside a fixed{' '}
        <code>min-h-cardGlass</code> (21.5rem) card, so a tall title + a 3-line
        TLDR run out of vertical room and the TLDR&apos;s last line gets clipped
        right against the pill. Scan the matrix below to see which
        title/TLDR/metric combos collide and which have breathing room. Toggle
        Storybook&apos;s light/dark theme to check contrast of the clipped edge
        behind the glass. (The &quot;Major&quot; highlight chip is gated by a
        separate flag and does not render in Storybook — it does not affect the
        vertical overlap.)
      </p>
      {children}
    </div>
  </GlassProviders>
);

// --- Stories --------------------------------------------------------------

const OverlapMatrix = (): ReactElement => (
  <PageShell>
    {Object.entries(TITLES).map(([titleLabel, title]) => (
      <SectionShell
        key={titleLabel}
        title={`Title: ${titleLabel}`}
        intro="Same title, TLDR grows from none → very long. Watch the bottom line of the TLDR meet the pill as the TLDR lengthens."
      >
        {Object.entries(TLDRS).map(([tldrLabel, summary]) => (
          <HeroCell
            key={tldrLabel}
            label={`TLDR: ${tldrLabel}`}
            note={summary ? undefined : 'no summary — pill sits below metadata'}
            post={make({ title, summary })}
          />
        ))}
      </SectionShell>
    ))}
  </PageShell>
);

const MetricsVariations = (): ReactElement => (
  <PageShell>
    <SectionShell
      title="Engagement metrics"
      intro="Title + TLDR are fixed at the worst case (3-line title, long TLDR). Only the counters change. The pill keeps a fixed height and just grows its own buttons — the counter length never reflows the text column, but it's here to confirm large counters don't push the text around."
    >
      {Object.entries(METRICS).map(([metricLabel, metric]) => (
        <HeroCell
          key={metricLabel}
          label={`Metrics: ${metricLabel}`}
          post={make({
            title: TITLES['3 lines'],
            summary: TLDRS['long (clamps to 3)'],
            ...metric,
          })}
        />
      ))}
    </SectionShell>
  </PageShell>
);

const EdgeCases = (): ReactElement => (
  <PageShell>
    <SectionShell
      title="Edge cases"
      intro="Other inputs that change how the content column fills the fixed height."
    >
      <HeroCell
        label="No cover image"
        note="text column spans full width; pill floats over the TLDR itself"
        post={make({
          title: TITLES['2 lines'],
          summary: TLDRS['very long (clamps to 3)'],
          image: undefined,
        })}
      />
      <HeroCell
        label="Video post"
        note="play button overlay on the cover"
        post={make({
          title: TITLES['3 lines'],
          summary: TLDRS['long (clamps to 3)'],
          type: PostType.VideoYouTube,
        })}
      />
      <HeroCell
        label="Many tags + clickbait shield"
        note="tags row can add pressure onto the TLDR"
        post={make({
          title: TITLES['2 lines'],
          summary: TLDRS['long (clamps to 3)'],
          tags: ['webdev', 'javascript', 'typescript', 'nodejs', 'tooling'],
          clickbaitTitleDetected: true,
        })}
      />
      <HeroCell
        label="Bookmarked + upvoted, huge counts"
        post={make({
          title: TITLES['3 lines'],
          summary: TLDRS['long (clamps to 3)'],
          bookmarked: true,
          upvoted: true,
          numUpvotes: 128000,
          numComments: 44300,
          userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
        })}
      />
      <HeroCell
        label="Best case (short title, short TLDR)"
        note="clear gap between TLDR and pill — the target look"
        post={make({
          title: TITLES['1 line'],
          summary: TLDRS.short,
        })}
      />
    </SectionShell>
  </PageShell>
);

const meta: Meta = {
  title: 'Components/Cards/Hero Glass Overlap',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

export const TitleAndTldrMatrix: Story = {
  render: () => <OverlapMatrix />,
  name: 'Title × TLDR matrix',
};

export const Metrics: Story = {
  render: () => <MetricsVariations />,
  name: 'Metrics variations',
};

export const Edge: Story = {
  render: () => <EdgeCases />,
  name: 'Edge cases',
};
