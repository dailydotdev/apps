import type { ReactElement, RefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { useVotePost } from '@dailydotdev/shared/src/hooks/vote/useVotePost';
import type { VoteEntityPayload } from '@dailydotdev/shared/src/hooks/vote/types';
import { voteMutationHandlers } from '@dailydotdev/shared/src/hooks/vote/types';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  applyTheme,
  SettingsContextProvider,
  ThemeMode,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { AlertContextProvider } from '@dailydotdev/shared/src/contexts/AlertContext';
import type { FeaturesReadyContextValue } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { FeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';

interface ToolPost {
  id: string;
  title: string;
  url?: string | null;
  image?: string | null;
  summary?: string | null;
  type?: string;
  createdAt: string;
  commentsPermalink: string;
  source?: Pick<Source, 'id' | 'name' | 'handle' | 'image'>;
  author?: { name?: string } | null;
  tags?: string[];
  readTime?: number | null;
  numUpvotes?: number;
  numComments?: number;
  userState?: { vote: UserVote } | null;
  upvoted?: boolean;
}

type ToolData = ToolPost | ToolPost[];

interface HostGlobals {
  toolOutput?: { data?: ToolData } | null;
  theme?: 'light' | 'dark';
  displayMode?: 'inline' | 'fullscreen' | 'pip';
  userId?: string;
}

type ToolResultMeta = Record<string, unknown> | null | undefined;

interface ToolCallResult {
  isError?: boolean;
}

interface OpenAi extends Omit<HostGlobals, 'userId'> {
  toolResponseMetadata?: ToolResultMeta;
  openExternal?: (options: { href: string }) => void;
  callTool?: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<ToolCallResult>;
}

const MCP_APPS_PROTOCOL_VERSION = '2026-01-26';
const INITIALIZE_REQUEST_ID = 1;
const UTM_MEDIUM = 'mcp_app';
const USER_ID_META = 'dailydev/userId';
const VOTE_TOOL = 'putPostsByIdVote';
const TOOL_DATA_KEY = ['mcp-app', 'tool-data'];
const HOST_REQUEST_TIMEOUT_MS = 10000;
const TIMED_OUT: ToolCallResult = { isError: true };
let nextRequestId = INITIALIZE_REQUEST_ID + 1;
let mcpHostName: string | undefined;
const pendingRequests = new Map<number, (result: ToolCallResult) => void>();

const getUserId = (meta: ToolResultMeta): string | undefined => {
  const userId = meta?.[USER_ID_META];
  return typeof userId === 'string' ? userId : undefined;
};

const getOpenAi = (): OpenAi | undefined =>
  (globalThis as { openai?: OpenAi }).openai;

const isEmbedded = (): boolean => globalThis.parent !== globalThis.window;

const postToHost = (message: Record<string, unknown>): void => {
  globalThis.parent.postMessage({ jsonrpc: '2.0', ...message }, '*');
};

const definedOnly = (globals: HostGlobals): HostGlobals =>
  Object.fromEntries(
    Object.entries(globals).filter(([, value]) => value !== undefined),
  );

const useHostGlobals = (): HostGlobals => {
  const [globals, setGlobals] = useState<HostGlobals>({});

  useEffect(() => {
    const merge = (update: HostGlobals) =>
      setGlobals((current) => ({ ...current, ...definedOnly(update) }));

    const readOpenAi = () => {
      const openAi = getOpenAi();
      if (openAi) {
        merge({
          toolOutput: openAi.toolOutput,
          theme: openAi.theme,
          displayMode: openAi.displayMode,
          userId: getUserId(openAi.toolResponseMetadata),
        });
      }
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== globalThis.parent || event.data?.jsonrpc !== '2.0') {
        return;
      }

      const { id, method, params, result, error } = event.data;
      const pending = method ? undefined : pendingRequests.get(id);
      if (pending) {
        pendingRequests.delete(id);
        pending(error ? { isError: true } : result);
        return;
      }

      if (id === INITIALIZE_REQUEST_ID && result) {
        mcpHostName = result.hostInfo?.name;
        merge({
          theme: result.hostContext?.theme,
          displayMode: result.hostContext?.displayMode,
        });
        postToHost({ method: 'ui/notifications/initialized' });
        return;
      }

      if (method === 'ui/notifications/tool-result') {
        merge({
          toolOutput: params?.structuredContent,
          // eslint-disable-next-line no-underscore-dangle
          userId: getUserId(params?._meta),
        });
        return;
      }

      if (method === 'ui/notifications/host-context-changed') {
        merge({ theme: params?.theme, displayMode: params?.displayMode });
        return;
      }

      if (method === 'ui/resource-teardown') {
        postToHost({ id, result: {} });
      }
    };

    readOpenAi();
    globalThis.addEventListener('openai:set_globals', readOpenAi);
    globalThis.addEventListener('message', onMessage);

    if (isEmbedded()) {
      postToHost({
        id: INITIALIZE_REQUEST_ID,
        method: 'ui/initialize',
        params: {
          appInfo: { name: 'daily.dev', version: '1.0.0' },
          appCapabilities: { availableDisplayModes: ['inline', 'fullscreen'] },
          protocolVersion: MCP_APPS_PROTOCOL_VERSION,
        },
      });
    }

    return () => {
      globalThis.removeEventListener('openai:set_globals', readOpenAi);
      globalThis.removeEventListener('message', onMessage);
    };
  }, []);

  return globals;
};

const useHostSize = (): RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !isEmbedded()) {
      return undefined;
    }

    const observer = new ResizeObserver(() =>
      postToHost({
        method: 'ui/notifications/size-changed',
        params: { height: Math.ceil(element.getBoundingClientRect().height) },
      }),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return ref;
};

const withAttribution = (href: string): string => {
  const url = new URL(href);
  url.searchParams.set(
    'utm_source',
    getOpenAi() ? 'chatgpt' : (mcpHostName ?? UTM_MEDIUM),
  );
  url.searchParams.set('utm_medium', UTM_MEDIUM);

  return url.toString();
};

const withTimeout = (
  promise: Promise<ToolCallResult>,
  onTimeout?: () => void,
): Promise<ToolCallResult> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<ToolCallResult>((resolve) => {
    timeout = setTimeout(() => {
      onTimeout?.();
      resolve(TIMED_OUT);
    }, HOST_REQUEST_TIMEOUT_MS);
  });

  return Promise.race([promise, timedOut]).finally(() => clearTimeout(timeout));
};

const requestFromHost = (
  method: string,
  params: Record<string, unknown>,
): Promise<ToolCallResult> => {
  const id = nextRequestId;
  nextRequestId += 1;

  const response = new Promise<ToolCallResult>((resolve) => {
    pendingRequests.set(id, resolve);
  });
  postToHost({ id, method, params });

  return withTimeout(response, () => pendingRequests.delete(id));
};

const callServerTool = async (
  name: string,
  args: Record<string, unknown>,
): Promise<boolean> => {
  try {
    const openAi = getOpenAi();
    const result = openAi?.callTool
      ? await withTimeout(openAi.callTool(name, args))
      : await requestFromHost('tools/call', { name, arguments: args });

    return !result?.isError;
  } catch {
    return false;
  }
};

const openLink = (link: string): void => {
  const openAi = getOpenAi();
  const href = withAttribution(link);

  if (openAi?.openExternal) {
    openAi.openExternal({ href });
    return;
  }

  if (isEmbedded()) {
    postToHost({
      id: nextRequestId,
      method: 'ui/open-link',
      params: { url: href },
    });
    nextRequestId += 1;
    return;
  }

  globalThis.open(href, '_blank', 'noopener');
};

const openPost = (post: Post): void => openLink(post.commentsPermalink);

const noop = (): void => {};

const getAuth = (userId?: string): AuthContextData => ({
  isLoggedIn: !!userId,
  ...(userId && { user: { id: userId } as LoggedUser }),
  shouldShowLogin: false,
  showLogin: noop,
  closeLogin: noop,
  logout: async () => {},
  updateUser: async () => {},
  tokenRefreshed: true,
  isTokenValid: true,
  getRedirectUri: () => '',
  isAuthReady: true,
  isAuthReadyOrCached: true,
});

const featuresReady: FeaturesReadyContextValue = {
  ready: true,
  settled: true,
  getFeatureValue: ((feature) =>
    feature.defaultValue) as FeaturesReadyContextValue['getFeatureValue'],
};

const getVote = (post: ToolPost): UserVote =>
  post.userState?.vote ?? (post.upvoted ? UserVote.Up : UserVote.None);

const updateToolPost = (
  data: ToolData,
  id: string,
  update: (post: VoteEntityPayload) => Partial<VoteEntityPayload>,
): ToolData => {
  const apply = (post: ToolPost): ToolPost =>
    post.id === id
      ? {
          ...post,
          ...update({ ...post, userState: { vote: getVote(post) } }),
        }
      : post;

  return Array.isArray(data) ? data.map(apply) : apply(data);
};

const toCardPost = (post: ToolPost): Post =>
  ({
    id: post.id,
    title:
      post.title ||
      (post.author?.name ? `Shared by ${post.author.name}` : 'Shared post'),
    image: post.image ?? undefined,
    summary: post.summary ?? undefined,
    type:
      post.type === PostType.VideoYouTube
        ? PostType.VideoYouTube
        : PostType.Article,
    createdAt: post.createdAt,
    commentsPermalink: post.commentsPermalink,
    permalink: post.url || post.commentsPermalink,
    source: post.source,
    tags: post.tags ?? [],
    readTime: post.readTime ?? undefined,
    numUpvotes: post.numUpvotes ?? 0,
    numComments: post.numComments ?? 0,
    userState: { vote: getVote(post) },
  }) as Post;

const ChatGptPostCard = ({
  post,
  onUpvote,
}: {
  post: ToolPost;
  onUpvote: (post: Post) => unknown;
}): ReactElement => (
  <ArticleGrid
    post={toCardPost(post)}
    onPostClick={openPost}
    onPostAuxClick={openPost}
    onUpvoteClick={onUpvote}
    onDownvoteClick={openPost}
    onCommentClick={openPost}
    onBookmarkClick={openPost}
    onShare={openPost}
    onCopyLinkClick={(_, item: Post) => openPost(item)}
    openNewTab
  />
);

const ChatGptPosts = ({
  data,
  displayMode,
  userId,
}: Pick<HostGlobals, 'displayMode' | 'userId'> & {
  data: ToolData;
}): ReactElement => {
  const client = useQueryClient();
  const { toggleUpvote } = useVotePost({
    mutationFn: async ({ id, vote }) => {
      if (!(await callServerTool(VOTE_TOOL, { id, vote }))) {
        throw new Error('Vote failed');
      }
    },
    onMutate: ({ id, vote }) => {
      const previous = client.getQueryData<ToolData>(TOOL_DATA_KEY);
      client.setQueryData<ToolData>(
        TOOL_DATA_KEY,
        (current) =>
          current && updateToolPost(current, id, voteMutationHandlers[vote]),
      );

      return () => client.setQueryData(TOOL_DATA_KEY, previous);
    },
  });

  const onUpvote = (post: Post) =>
    userId
      ? toggleUpvote({ payload: post, origin: Origin.Feed })
      : openPost(post);

  if (!Array.isArray(data)) {
    return (
      <div className="mx-auto w-72">
        <ChatGptPostCard post={data} onUpvote={onUpvote} />
      </div>
    );
  }

  if (displayMode === 'fullscreen') {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-4 p-4">
        {data.map((post) => (
          <ChatGptPostCard key={post.id} post={post} onUpvote={onUpvote} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
      {data.map((post) => (
        <div key={post.id} className="w-72 shrink-0 snap-start">
          <ChatGptPostCard post={post} onUpvote={onUpvote} />
        </div>
      ))}
    </div>
  );
};

export default function ChatGptPostEmbed(): ReactElement {
  const { toolOutput, theme, displayMode, userId } = useHostGlobals();
  const sizeRef = useHostSize();
  const client = useQueryClient();
  const { data } = useQuery<ToolData>({
    queryKey: TOOL_DATA_KEY,
    queryFn: skipToken,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (toolOutput?.data) {
      client.setQueryData(TOOL_DATA_KEY, toolOutput.data);
    }
  }, [client, toolOutput]);

  useEffect(() => {
    if (theme) {
      applyTheme(theme === 'light' ? ThemeMode.Light : ThemeMode.Dark);
      document.documentElement.style.colorScheme = theme;
    }
  }, [theme]);

  useEffect(() => {
    const onLinkClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a[href]');
      if (!link) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openLink((link as HTMLAnchorElement).href);
    };

    document.addEventListener('click', onLinkClick, true);

    return () => document.removeEventListener('click', onLinkClick, true);
  }, []);

  return (
    <AlertContextProvider loadedAlerts>
      <AuthContext.Provider value={getAuth(userId)}>
        <FeaturesReadyContext.Provider value={featuresReady}>
          <SettingsContextProvider>
            <style>
              {
                'html,body{margin:0;min-width:0!important;background:transparent!important}'
              }
            </style>
            <div ref={sizeRef}>
              {data && (
                <ChatGptPosts
                  data={data}
                  displayMode={displayMode}
                  userId={userId}
                />
              )}
            </div>
          </SettingsContextProvider>
        </FeaturesReadyContext.Provider>
      </AuthContext.Provider>
    </AlertContextProvider>
  );
}
