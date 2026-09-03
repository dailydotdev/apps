import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import {
  FeaturesReadyContext,
  GrowthBookContext,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { HighlightItem } from '@dailydotdev/shared/src/components/highlights/HighlightItem';
import { HighlightSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightSnapshotCard';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { featureHappeningNowShare } from '@dailydotdev/shared/src/lib/featureManagement';
import type { PostHighlightFeed } from '@dailydotdev/shared/src/graphql/highlights';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { LogContextData } from '@dailydotdev/shared/src/hooks/log/useLogContextData';

/**
 * /dev/snapshot-happening-now — the expanded-highlight placement rendered by
 * the production HighlightItem with `snapshot_highlight_expanded` forced on,
 * so what is reviewed here is what ships. Blocked on the canonical production
 * hosts and carries `noindex`/`nofollow`.
 */

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const HIGHLIGHTS: PostHighlightFeed[] = [
  {
    id: 'dev-highlight-openai',
    channel: 'headlines',
    headline: 'OpenAI ships a cheaper model tier',
    highlightedAt: hoursAgo(2),
    post: {
      id: 'dev-post-openai',
      type: 'article',
      commentsPermalink: 'https://app.daily.dev/posts/dev-post-openai',
      summary:
        'Priced at a third of the previous tier with the same context window. The cut lands first on the API, with the assistant products following next quarter.',
    },
  },
  {
    id: 'dev-highlight-react',
    channel: 'webdev',
    headline: 'React 20 drops the legacy render path',
    highlightedAt: hoursAgo(4),
    post: {
      id: 'dev-post-react',
      type: 'article',
      commentsPermalink: 'https://app.daily.dev/posts/dev-post-react',
      summary:
        'The codemod covers most applications; class components with legacy context are the exception and will need a manual pass.',
    },
  },
  {
    id: 'dev-highlight-postgres',
    channel: 'databases',
    headline:
      'Postgres 19 lands asynchronous I/O by default across every supported platform',
    highlightedAt: hoursAgo(6),
    post: {
      id: 'dev-post-postgres',
      type: 'article',
      commentsPermalink: 'https://app.daily.dev/posts/dev-post-postgres',
      summary:
        'Early benchmarks show double-digit gains on write-heavy workloads, with the largest wins on NVMe and the smallest on network storage.',
    },
  },
];

const CARD_PREVIEW_SIZE = 300;

const useIsAllowedHost = () => {
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    const { hostname } = window.location;
    setAllowed(hostname !== 'app.daily.dev' && hostname !== 'www.daily.dev');
  }, []);

  return allowed;
};

const LogContext = getLogContextStatic();

/**
 * `/dev/*` short-circuits to a QueryClient-only tree in _app — no boot, no
 * auth — which is what makes this page load without the API. HighlightItem
 * reaches for both, so the review harness stands in: signed out, logging
 * swallowed, and the flag forced rather than fetched.
 */
const AUTH_STUB = {
  isLoggedIn: false,
  isAuthReady: true,
  tokenRefreshed: true,
  shouldShowLogin: false,
  squads: [],
  showLogin: () => {},
  closeLogin: () => {},
  logout: async () => {},
  updateUser: async () => {},
  getRedirectUri: () => '',
} as unknown as AuthContextData;

const LOG_STUB = {
  logEvent: () => {},
  logEventStart: () => {},
  logEventEnd: () => {},
} as unknown as LogContextData;

const FORCED: Record<string, unknown> = {
  [featureHappeningNowShare.id]: true,
};

/* GrowthBookContext is re-exported for harnesses exactly like this one, so the
   flag is pinned here rather than fetched. */
const GB_STUB = {
  getFeatureValue: (id: string, fallback: unknown) => FORCED[id] ?? fallback,
} as never;

const DevProviders = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={AUTH_STUB}>
    <LogContext.Provider value={LOG_STUB}>
      <GrowthBookContext.Provider value={{ growthbook: GB_STUB }}>
        <FeaturesReadyContext.Provider
          value={{
            ready: true,
            getFeatureValue: (feature) =>
              (FORCED[feature.id] ?? feature.defaultValue) as never,
          }}
        >
          {children}
        </FeaturesReadyContext.Provider>
      </GrowthBookContext.Provider>
    </LogContext.Provider>
  </AuthContext.Provider>
);

const Section = ({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-8">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold text-text-primary typo-title2">{title}</h2>
      <p className="max-w-[52rem] text-text-tertiary typo-callout">{caption}</p>
    </div>
    {children}
  </section>
);

const Feed = ({ expandedId }: { expandedId?: string }) => (
  <div className="w-full max-w-[34rem] rounded-16 border border-border-subtlest-tertiary">
    {HIGHLIGHTS.map((highlight) => (
      <HighlightItem
        key={highlight.id}
        defaultExpanded={highlight.id === expandedId}
        highlight={highlight}
      />
    ))}
  </div>
);

const SnapshotHappeningNowDevPage = (): ReactElement => {
  const allowed = useIsAllowedHost();

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-default p-12">
        <p className="text-text-secondary typo-callout">
          The snapshot review page is not available on production.
        </p>
      </div>
    );
  }

  return (
    <>
      <NextSeo nofollow noindex title="Snapshot · Happening now · daily.dev" />
      <Toast autoDismissNotifications />
      <DevProviders>
        <div className="min-h-screen bg-background-default">
          <div className="mx-auto flex max-w-[72rem] flex-col gap-8 p-8">
            <div className="flex flex-col gap-3">
              <h1 className="font-bold text-text-primary typo-mega3">
                Snapshot on Happening now
              </h1>
              <p className="max-w-[52rem] text-text-secondary typo-body">
                Every highlight is a self-contained claim with sources behind
                it, and today none of them can be lifted out. The page also has
                the shortest shelf life in the product, which is why the image
                beats the link: a URL sends someone to a page that has already
                moved on.
              </p>
              <p className="max-w-[52rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-callout">
                These are the production rows with{' '}
                <code>snapshot_highlight_expanded</code> forced on, not a copy
                of them. On <code>/highlights</code> the flag defaults to off
                and opens on branch previews.
              </p>
            </div>

            <Section
              caption="The row is unchanged until it is opened. Expansion is the intent signal: the reader has said which claim they care about, and there is room for a label without crowding the row."
              title="Collapsed, then expanded"
            >
              <div className="flex flex-wrap gap-8">
                <Feed />
                <Feed expandedId={HIGHLIGHTS[0].id} />
              </div>
            </Section>

            <Section
              caption="Press Snapshot on any expanded highlight above and the PNG lands on your clipboard with the link. The headline steps down a size as it grows, so a long one keeps its TLDR."
              title="What it exports"
            >
              <div className="flex flex-wrap gap-6">
                {HIGHLIGHTS.map((highlight) => (
                  <figure key={highlight.id} className="flex flex-col gap-2">
                    <figcaption className="font-bold uppercase text-text-quaternary typo-caption2">
                      {highlight.headline.length} characters
                    </figcaption>
                    <div
                      className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
                      style={{
                        width: CARD_PREVIEW_SIZE,
                        height: CARD_PREVIEW_SIZE,
                      }}
                    >
                      <div
                        style={{
                          transform: `scale(${
                            CARD_PREVIEW_SIZE / SNAPSHOT_SIZE
                          })`,
                          transformOrigin: 'top left',
                        }}
                      >
                        <HighlightSnapshotCard
                          headline={highlight.headline}
                          meta="2h ago"
                          seed={highlight.id}
                          tldr={highlight.post.summary}
                        />
                      </div>
                    </div>
                  </figure>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </DevProviders>
    </>
  );
};

SnapshotHappeningNowDevPage.getLayout = (page: ReactNode): ReactNode => page;

export default SnapshotHappeningNowDevPage;
