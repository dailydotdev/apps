import type { ReactElement, RefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
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
}

interface HostGlobals {
  toolOutput?: { data?: ToolPost | ToolPost[] } | null;
  theme?: 'light' | 'dark';
  displayMode?: 'inline' | 'fullscreen' | 'pip';
}

interface OpenAi extends HostGlobals {
  openExternal?: (options: { href: string }) => void;
}

const MCP_APPS_PROTOCOL_VERSION = '2026-01-26';
const INITIALIZE_REQUEST_ID = 1;
const UTM_MEDIUM = 'mcp_app';
let nextRequestId = INITIALIZE_REQUEST_ID + 1;
let mcpHostName: string | undefined;

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
        });
      }
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== globalThis.parent || event.data?.jsonrpc !== '2.0') {
        return;
      }

      const { id, method, params, result } = event.data;
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
        merge({ toolOutput: params?.structuredContent });
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

const anonymousAuth: AuthContextData = {
  isLoggedIn: false,
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
};

const featuresReady: FeaturesReadyContextValue = {
  ready: true,
  settled: true,
  getFeatureValue: ((feature) =>
    feature.defaultValue) as FeaturesReadyContextValue['getFeatureValue'],
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
  }) as Post;

const ChatGptPostCard = ({ post }: { post: ToolPost }): ReactElement => (
  <ArticleGrid
    post={toCardPost(post)}
    onPostClick={openPost}
    onPostAuxClick={openPost}
    onUpvoteClick={openPost}
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
}: Pick<HostGlobals, 'displayMode'> & {
  data: ToolPost | ToolPost[];
}): ReactElement => {
  if (!Array.isArray(data)) {
    return (
      <div className="mx-auto w-72">
        <ChatGptPostCard post={data} />
      </div>
    );
  }

  if (displayMode === 'fullscreen') {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-4 p-4">
        {data.map((post) => (
          <ChatGptPostCard key={post.id} post={post} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
      {data.map((post) => (
        <div key={post.id} className="w-72 shrink-0 snap-start">
          <ChatGptPostCard post={post} />
        </div>
      ))}
    </div>
  );
};

export default function ChatGptPostEmbed(): ReactElement {
  const { toolOutput, theme, displayMode } = useHostGlobals();
  const sizeRef = useHostSize();
  const data = toolOutput?.data;

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
      <AuthContext.Provider value={anonymousAuth}>
        <FeaturesReadyContext.Provider value={featuresReady}>
          <SettingsContextProvider>
            <style>
              {
                'html,body{margin:0;min-width:0!important;background:transparent!important}'
              }
            </style>
            <div ref={sizeRef}>
              {data && <ChatGptPosts data={data} displayMode={displayMode} />}
            </div>
          </SettingsContextProvider>
        </FeaturesReadyContext.Provider>
      </AuthContext.Provider>
    </AlertContextProvider>
  );
}
