import React, { useEffect } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import fixturePost from '@dailydotdev/shared/__tests__/fixture/post';
import { defaultBootData, getBootMock } from '../../../mock/boot';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const anonymousUser = {
  id: 'anonymous-review',
  firstVisit: '2026-08-27T00:00:00.000Z',
  isFirstVisit: false,
};

/**
 * The app's SettingsContext and Storybook's theme decorator both write the
 * theme class on <html>, and whichever runs last wins. The review frames must
 * be the app's default (dark), so this keeps `light` off for as long as the
 * story is mounted.
 */
const DarkLock = (): null => {
  useEffect(() => {
    const el = document.documentElement;
    // Only touch the attribute when it is wrong: classList.add() re-sets the
    // attribute even for a present token, which would re-trigger the observer
    // below forever.
    const pin = () => {
      if (el.classList.contains('light') || el.classList.contains('auto')) {
        el.classList.remove('light', 'auto');
      }
      if (!el.classList.contains('dark')) {
        el.classList.add('dark');
      }
    };
    pin();
    const observer = new MutationObserver(pin);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return null;
};

/**
 * Same wiring as the extension stories, with one switch: `loggedIn=false`
 * boots an anonymous user so the logged-out post page renders as it does for
 * a visitor arriving from Google.
 */
export const ReviewProviders: FC<PropsWithChildren<{ loggedIn?: boolean }>> = ({
  loggedIn = true,
  children,
}) => (
  <QueryClientProvider client={queryClient}>
    <BootDataProvider
      app={BootApp.Extension}
      deviceId="review"
      getPage={fn()}
      getRedirectUri={fn()}
      version="pwa"
      localBootData={getBootMock({
        ...defaultBootData,
        user: loggedIn ? defaultBootData.user : anonymousUser,
        settings: { ...defaultBootData.settings, theme: 'darcula' },
      })}
    >
      <ActiveFeedContext.Provider value={{ items: [], queryKey: [] }}>
        <DarkLock />
        {children}
      </ActiveFeedContext.Provider>
    </BootDataProvider>
  </QueryClientProvider>
);

/** The fixture article, filled in with the fields a real post page shows. */
export const reviewPost: Post = {
  ...fixturePost,
  domain: 'towardsdatascience.com',
  summary:
    'Why courts, doctors and engineers keep confusing P(evidence | innocent) with P(innocent | evidence) — and the one habit that stops you doing it.',
  tags: ['statistics', 'data-science', 'probability'],
  numUpvotes: 248,
  numComments: 31,
  readTime: 8,
  createdAt: '2026-08-20T09:00:00.000Z',
  commentsPermalink: 'https://app.daily.dev/posts/the-prosecutors-fallacy',
  source: {
    ...(fixturePost.source as Post['source']),
    id: 'tds',
    handle: 'tds',
    name: 'Towards Data Science',
    permalink: 'https://app.daily.dev/sources/tds',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
    type: 'machine',
    public: true,
  } as Post['source'],
};
