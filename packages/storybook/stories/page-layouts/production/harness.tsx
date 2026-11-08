import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import type { DehydratedState } from '@tanstack/react-query';
import { bypass, graphql, http, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BOOT_QUERY_KEY } from '@dailydotdev/shared/src/contexts/common';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { ShellStateProvider } from '@dailydotdev/shared/src/contexts/ShellStateProvider';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { PostReferrerContextProvider } from '@dailydotdev/shared/src/contexts/PostReferrerContext';
import { ShortcutsProvider } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import {
  FeaturesReadyContext,
  GrowthBookContext,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { ANONYMOUS_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { CoresRole } from '@dailydotdev/shared/src/lib/user';
import {
  SourceMemberRole,
  SourcePermissions,
} from '@dailydotdev/shared/src/graphql/sources';
import { OrganizationMemberRole } from '@dailydotdev/shared/src/features/organizations/types';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import { useRouter } from 'next/router';
import { defaultBootData, getBootMock } from '../../../mock/boot';

// Production pages from packages/webapp/pages, mounted the way _app mounts
// them: the same providers, then the page's own getLayout. Data is live:
// every GraphQL request goes to the production API through the dev
// server's /__daily-api proxy. The API sees a logged-out visitor, but the
// app boots as a member, so pages show the chrome most people see: the
// personal feed is answered from the public one, and anything else that
// needs a session answers empty.

export type PageModule = {
  default: ComponentType<Record<string, unknown>> & {
    getLayout?: (
      page: ReactNode,
      pageProps: Record<string, unknown>,
      layoutProps: Record<string, unknown>,
    ) => ReactNode;
    layoutProps?: Record<string, unknown>;
  };
  getStaticProps?: (context: {
    params?: Record<string, string>;
  }) => Promise<{ props?: Record<string, unknown> }>;
  getServerSideProps?: (context: {
    params?: Record<string, string>;
    query: Record<string, string>;
    req: unknown;
    res: unknown;
  }) => Promise<{ props?: Record<string, unknown> }>;
};

type GraphQLBody = {
  query: string;
  operationName?: string;
  variables?: Record<string, unknown>;
};

/** What each operation asked and got, on window.liveOps for debugging. */
const log = (operation: string, entry: Record<string, unknown>): void => {
  const target = window as unknown as {
    liveOps?: Record<string, unknown>[];
  };
  target.liveOps = [...(target.liveOps ?? []), { operation, ...entry }];
};

// Each page loads at three breakpoints, in three frames that ask the same
// queries. Answers are kept for a few minutes in the Cache API, which every
// frame shares, and a lock per query lets one frame ask while the rest wait.
const answers = 'page-layouts-answers';
const answerLifetime = 10 * 60 * 1000;

const ask = async (body: GraphQLBody) => {
  const json = JSON.stringify(body);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(json),
  );
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  const key = `${window.location.origin}/__page-layouts-answer/${hash}`;
  return navigator.locks.request(key, async () => {
    const cache = await caches.open(answers);
    const kept = await cache.match(key);
    if (
      kept &&
      Date.now() - Number(kept.headers.get('date-kept')) < answerLifetime
    ) {
      return kept.json();
    }
    const response = await fetch(
      bypass(`${window.location.origin}/__daily-api/graphql`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: json,
      }),
    );
    const text = await response.text();
    if (response.ok) {
      await cache.put(
        key,
        new Response(text, { headers: { 'date-kept': String(Date.now()) } }),
      );
    }
    return JSON.parse(text);
  });
};

const operationOf = (body: GraphQLBody): string =>
  body.operationName ??
  /(?:query|mutation)\s+(\w+)/.exec(body.query)?.[1] ??
  '';

// Actions the member completed in this frame. Answered locally: refused,
// the app keeps completing them, and every completion refetches the list.
const completedActions = new Set<string>();

/**
 * Mutations never reach production; they answer here. A draft feed is
 * created on /feeds/new, so that one returns a feed.
 */
const mutate = (operation: string, variables: Record<string, unknown>) => {
  if (operation === 'CompleteAction') {
    completedActions.add(variables.type as string);
    return { completeAction: { _: true } };
  }
  if (operation === 'CreateFeed') {
    return {
      createFeed: {
        id: 'page-layouts-feed',
        userId: 'page-layouts-member',
        slug: 'page-layouts-feed',
        createdAt: new Date().toISOString(),
        type: 'custom',
        flags: {
          name: variables.name,
          icon: variables.icon ?? null,
          orderBy: null,
          minDayRange: null,
          minUpvotes: null,
          minViews: null,
          disableEngagementFilter: null,
          origin: null,
        },
      },
    };
  }
  return null;
};

// The Squad this frame's member runs, set by admin-only frames. Its live
// answer is kept and the member is made its admin.
let ownedSquad: string | undefined;

/** Makes the member the admin of a Squad, for its manage pages. */
export const ownSquad = (handle: string): void => {
  ownedSquad = handle;
};

const asAdmin = (source: Record<string, unknown>) => ({
  ...source,
  currentMember: {
    user: { id: 'page-layouts-member' },
    role: SourceMemberRole.Admin,
    permissions: Object.values(SourcePermissions),
    referralToken: null,
    flags: { hideFeedPosts: false, collapsePinnedPosts: false },
  },
});

// Organization pages need one the member owns; there is no public one.
const placeholderOrganization = {
  role: OrganizationMemberRole.Owner,
  referralToken: null,
  referralUrl: null,
  seatType: null,
  organization: {
    id: 'page-layouts-org',
    name: 'Placeholder organization',
    image: null,
    seats: 5,
    activeSeats: 1,
    status: 'active',
    members: [],
  },
};

const emptyBlock = { html: '', content: '' };

// Recruiter pages edit one job; the member's own draft, as no job is public.
const placeholderOpportunity = {
  id: 'page-layouts-opportunity',
  type: 1,
  state: OpportunityState.DRAFT,
  title: 'Placeholder job',
  tldr: '',
  organization: {
    ...placeholderOrganization.organization,
    description: '',
    size: null,
    stage: null,
    website: null,
    perks: [],
    category: null,
    founded: null,
    location: null,
    customLinks: [],
    socialLinks: [],
    pressLinks: [],
    recruiterTotalSeats: 1,
    recruiterSubscriptionFlags: { hasSlackConnection: false },
  },
  content: {
    overview: emptyBlock,
    responsibilities: emptyBlock,
    requirements: emptyBlock,
    whatYoullDo: emptyBlock,
    interviewProcess: emptyBlock,
  },
  keywords: [],
  recruiters: [],
  meta: {
    roleType: null,
    seniorityLevel: null,
    teamSize: null,
    employmentType: null,
    salary: null,
    equity: null,
  },
  locations: [],
  questions: [],
  feedbackQuestions: [],
  flags: {
    batchSize: null,
    // Paid, or the editor sends the recruiter to the plans page first.
    plan: 'page-layouts-plan',
    showSlack: false,
    showFeedback: false,
    parseErrorUserMessage: null,
  },
};

/**
 * Member-only queries answered here as a new member would see them. Refused,
 * the wallet never paints, and follow buttons ask again for every post.
 */
const memberAnswers: Record<string, () => unknown> = {
  CompletedUserActions: () => ({
    actions: [...completedActions].map((type) => ({
      type,
      completedAt: new Date().toISOString(),
    })),
  }),
  ContentPreferenceStatus: () => ({ contentPreferenceStatus: null }),
  OrganizationBase: () => ({ organization: placeholderOrganization }),
  Organization: () => ({ organization: placeholderOrganization }),
  OrganizationsBase: () => ({ organizations: [placeholderOrganization] }),
  Organizations: () => ({ organizations: [placeholderOrganization] }),
  OpportunityById: () => ({ opportunityById: placeholderOpportunity }),
  // A member with nothing saved yet; refused, the feed retries before it
  // shows its empty state.
  BookmarksFeed: () => ({
    page: { pageInfo: { hasNextPage: false, endCursor: null }, edges: [] },
  }),
  GetBookmarkFolders: () => ({ bookmarkLists: [] }),
  OpportunityMatches: () => ({
    opportunityMatches: {
      pageInfo: { hasNextPage: false, endCursor: null, totalCount: 0 },
      edges: [],
    },
  }),
  TransactionSummary: () => ({
    transactionSummary: { purchased: 0, received: 0, spent: 0 },
  }),
  transactions: () => ({
    transactions: {
      edges: [],
      pageInfo: { endCursor: null, hasNextPage: false },
    },
  }),
};

const forward = async (request: Request) => {
  const body = (await request.clone().json()) as GraphQLBody;
  const operation = operationOf(body);
  const variables: Record<string, unknown> = {
    ...body.variables,
    loggedIn: false,
  };

  if (/^\s*mutation\b/.test(body.query)) {
    log(operation, { mutation: true });
    return HttpResponse.json({ data: mutate(operation, variables) });
  }
  if (memberAnswers[operation]) {
    return HttpResponse.json({ data: memberAnswers[operation]() });
  }

  if (operation === 'FeedV2' || operation === 'Feed') {
    const { highlightsLimit, ...rest } = variables;
    const result = await ask({ query: ANONYMOUS_FEED_QUERY, variables: rest });
    const page = result.data?.page;
    log(operation, { variables: rest, edges: page?.edges?.length });
    if (operation === 'Feed' || !page) {
      return HttpResponse.json(result);
    }
    return HttpResponse.json({
      data: {
        page: {
          pageInfo: page.pageInfo,
          edges: page.edges.map(({ node }: { node: unknown }) => ({
            node: { __typename: 'FeedPostItem', feedMeta: null, post: node },
          })),
        },
      },
    });
  }

  const result = await ask({ ...body, variables });
  const source = result.data?.source;
  if (ownedSquad && source?.handle === ownedSquad) {
    result.data.source = asAdmin(source);
  }
  const codes = (result.errors ?? []).map(
    (error: { extensions?: { code?: string } }) => error.extensions?.code,
  );
  if (
    codes.length &&
    codes.every((code: string) =>
      ['UNAUTHENTICATED', 'FORBIDDEN'].includes(code),
    )
  ) {
    log(operation, { refused: true });
    return HttpResponse.json({ data: null });
  }
  log(operation, { errors: result.errors?.length });
  return HttpResponse.json(result);
};

/** MSW handlers that send every GraphQL request to production. */
export const liveApi = [
  graphql.operation(({ request }) => forward(request) as never),
  // The onboarding funnel's steps come from a REST boot, live as well.
  http.get('*/boot/funnels/*', async ({ request }) => {
    const { pathname, search } = new URL(request.url);
    const response = await fetch(
      bypass(`${window.location.origin}/__daily-api${pathname}${search}`, {
        headers: { app: request.headers.get('app') ?? '' },
      }),
    );
    return HttpResponse.json(await response.json(), {
      status: response.status,
    });
  }),
  // Analytics and other side calls answer empty.
  http.post('*/e', () => new HttpResponse(null, { status: 204 })),
];

// The onboarding funnel is for people who are not signed up yet, and sends
// members on; frames for it boot as a first-time visitor instead.
let isVisitor = false;

/** Boots this frame as a first-time visitor rather than a member. */
export const bootAsVisitor = (): void => {
  isVisitor = true;
};

/**
 * Boots as a member. Boot refetches through the global mock, so the mock
 * answers with this member too, dark theme included (the mock's is light).
 */
const memberBoot = () => {
  const boot = {
    ...getBootMock(),
    settings: { ...defaultBootData.settings, theme: 'darcula' },
    user: isVisitor
      ? { id: 'page-layouts-visitor', isFirstVisit: true }
      : {
          ...defaultBootData.user,
          id: 'page-layouts-member',
          username: 'member',
          name: 'daily.dev member',
          image: fallbackImages.avatar,
          // Cores users can open the wallet; without it the page redirects.
          coresRole: CoresRole.User,
          balance: { amount: 0 },
        },
  };
  getBootMock.mockReturnValue(boot as never);
  return boot;
};

/**
 * The GrowthBook mock never loads features, so it is never ready and they
 * never settle; feed pages wait on both before they paint.
 */
const GrowthBookReady = ({ children }: { children: ReactNode }) => {
  const context = useContext(GrowthBookContext);
  const features = useContext(FeaturesReadyContext);
  const [value] = useState(() => ({
    ...context,
    growthbook: Object.assign(context.growthbook ?? {}, { ready: true }),
  }));
  return (
    <GrowthBookContext.Provider value={value as never}>
      <FeaturesReadyContext.Provider
        value={{ ...features, ready: true, settled: true }}
      >
        {children}
      </FeaturesReadyContext.Provider>
    </GrowthBookContext.Provider>
  );
};

/** Points the mocked next/router at the route the page renders. */
export const setRoute = (
  pathname: string,
  query: Record<string, string> = {},
): void => {
  const path = Object.entries(query).reduce(
    (url, [key, value]) => url.replace(`[${key}]`, value),
    pathname,
  );
  (
    useRouter as unknown as {
      mockImplementation: (impl: () => unknown) => void;
    }
  ).mockImplementation(() => ({
    pathname,
    asPath: path,
    route: pathname,
    query,
    isReady: true,
    replace: fn(),
    push: fn(),
    prefetch: fn(() => Promise.resolve()),
    back: fn(),
    events: { on: fn(), off: fn(), emit: fn() },
  }));
};

const loadOnce = async (
  page: PageModule,
  params: Record<string, string>,
): Promise<{ props?: Record<string, unknown> }> => {
  if (page.getStaticProps) {
    return page.getStaticProps({ params });
  }
  if (page.getServerSideProps) {
    return page.getServerSideProps({
      params,
      query: params,
      // Next's request, as far as the pages read it.
      req: { headers: {}, cookies: {}, socket: { remoteAddress: '' } },
      res: { setHeader: fn() },
    });
  }
  return { props: {} };
};

/**
 * The props production would hand the page, fetched live. A frame's first
 * requests can go out before MSW has claimed it, and the page then reports
 * not found, so an empty answer is asked again.
 */
export const loadPageProps = async (
  page: PageModule,
  params: Record<string, string> = {},
): Promise<Record<string, unknown>> => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const result = await loadOnce(page, params).catch(() => ({}));
    if ('props' in result && result.props) {
      return result.props;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000 * (attempt + 1));
    });
  }
  return {};
};

/** _app's tree around one page. */
export const ProductionPage = ({
  page,
  pageProps,
}: {
  page: PageModule;
  pageProps: Record<string, unknown>;
}): ReactElement => {
  const [bootData] = useState(memberBoot);
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false },
      },
    });
    client.setQueryData(BOOT_QUERY_KEY, bootData);
    return client;
  });
  const Page = page.default;
  const getLayout = Page.getLayout ?? ((node: ReactNode) => node);

  // Next renders the app into #__next, and modals attach to it.
  return (
    <div id="__next">
      <ProgressiveEnhancementContextProvider>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary
            state={pageProps.dehydratedState as DehydratedState | undefined}
          >
            <BootDataProvider
              app={BootApp.Webapp}
              deviceId="page-layouts"
              getPage={() => window.location.pathname}
              getRedirectUri={() => window.location.href}
              version="pwa"
              localBootData={bootData as never}
            >
              <GrowthBookReady>
                <ShellStateProvider>
                  <SubscriptionContextProvider>
                    <PostReferrerContextProvider>
                      <ShortcutsProvider>
                        <LazyModalElement />
                        <DndContextProvider>
                          {getLayout(
                            <Page {...pageProps} />,
                            pageProps,
                            Page.layoutProps ?? {},
                          )}
                        </DndContextProvider>
                      </ShortcutsProvider>
                    </PostReferrerContextProvider>
                  </SubscriptionContextProvider>
                </ShellStateProvider>
              </GrowthBookReady>
            </BootDataProvider>
          </HydrationBoundary>
        </QueryClientProvider>
      </ProgressiveEnhancementContextProvider>
    </div>
  );
};

/**
 * Fetches the page's props, then mounts it. Not a story loader: loaders run
 * side by side, so the live handlers may not be in place yet.
 */
export const LivePage = ({
  page,
  params,
}: {
  page: PageModule;
  params: Record<string, string>;
}): ReactElement | null => {
  const [pageProps, setPageProps] = useState<Record<string, unknown>>();
  useEffect(() => {
    loadPageProps(page, params).then(setPageProps);
  }, [page, params]);
  return pageProps ? (
    <ProductionPage page={page} pageProps={pageProps} />
  ) : null;
};
