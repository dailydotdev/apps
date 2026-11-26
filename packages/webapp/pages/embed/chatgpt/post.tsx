import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
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

interface OpenAiGlobals {
  toolOutput?: { data?: ToolPost | ToolPost[] } | null;
  theme?: 'light' | 'dark';
  displayMode?: 'inline' | 'fullscreen' | 'pip';
}

interface OpenAi extends OpenAiGlobals {
  openExternal?: (options: { href: string }) => void;
}

const getOpenAi = (): OpenAi | undefined =>
  (globalThis as { openai?: OpenAi }).openai;

const useOpenAiGlobals = (): OpenAiGlobals => {
  const [globals, setGlobals] = useState<OpenAiGlobals>({});

  useEffect(() => {
    const read = () =>
      setGlobals({
        toolOutput: getOpenAi()?.toolOutput,
        theme: getOpenAi()?.theme,
        displayMode: getOpenAi()?.displayMode,
      });

    read();
    globalThis.addEventListener('openai:set_globals', read);

    return () => globalThis.removeEventListener('openai:set_globals', read);
  }, []);

  return globals;
};

const openLink = (href: string): void => {
  const openAi = getOpenAi();

  if (openAi?.openExternal) {
    openAi.openExternal({ href });
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
}: Pick<OpenAiGlobals, 'displayMode'> & {
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
  const { toolOutput, theme, displayMode } = useOpenAiGlobals();
  const data = toolOutput?.data;

  useEffect(() => {
    if (theme) {
      applyTheme(theme === 'light' ? ThemeMode.Light : ThemeMode.Dark);
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
            {data && <ChatGptPosts data={data} displayMode={displayMode} />}
          </SettingsContextProvider>
        </FeaturesReadyContext.Provider>
      </AuthContext.Provider>
    </AlertContextProvider>
  );
}
