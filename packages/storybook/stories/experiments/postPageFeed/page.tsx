import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createPortal } from 'react-dom';
import { PostContent } from '@dailydotdev/shared/src/components/post/PostContent';
import { SquadPostContent } from '@dailydotdev/shared/src/components/post/SquadPostContent';
import { CollectionPostContent } from '@dailydotdev/shared/src/components/post/collection/CollectionPostContent';
import { PollPostContent } from '@dailydotdev/shared/src/components/post/poll/PollPostContent';
import { SocialTwitterPostContent } from '@dailydotdev/shared/src/components/post/SocialTwitterPostContent';
import type { PostContentProps } from '@dailydotdev/shared/src/components/post/common';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import ExtensionProviders from '../../extension/_providers';
import { HistoryStyles } from '../../history/kit';
import {
  laptopQuery,
  useDeviceUrl,
  useMediaQueryIn,
} from '../../history/device';
import { DEFAULT_POST_ID, postById } from './data';
import { OpenProvider } from './kit';
import { SeedComments, SettlePending } from './api';
import { AppShell } from './shell';

// One device's whole page: the app in the layout that ships (layout_v2_2:
// the rail and the floating card on laptops, ShellBlock, the bottom bar and
// the capsule on phones; see shell.tsx), and the post page the way
// pages/posts/[id] renders it, with Keep reading after the comments. A post
// opened from the feed becomes the page's post, so the review can be read
// through, post to post.

type PostContentComponent = ComponentType<PostContentProps>;

/** pages/posts/[id]'s content map, for the types the feed carries. */
const CONTENT_MAP: Partial<Record<PostType, PostContentComponent>> = {
  [PostType.Article]: PostContent as PostContentComponent,
  [PostType.VideoYouTube]: PostContent as PostContentComponent,
  [PostType.Share]: SquadPostContent as PostContentComponent,
  [PostType.Freeform]: SquadPostContent as PostContentComponent,
  [PostType.Collection]: CollectionPostContent as PostContentComponent,
  [PostType.Poll]: PollPostContent as PostContentComponent,
  [PostType.SocialTwitter]: SocialTwitterPostContent as PostContentComponent,
};

/** pages/posts/[id]'s containerClass. */
const containerClass = '!mt-0 mb-0 max-w-[69.25rem] laptop:pb-6 laptopL:pb-0';

export type Start = 'feed' | 'top';

/**
 * Keeps the page scrolled so the end of the post sits just above the fold
 * while the post's images load and push the feed down, until the reader
 * scrolls themselves.
 */
const useStartAtFeed = (
  anchor: React.RefObject<HTMLElement>,
  start: Start,
  postId: string,
): void => {
  useEffect(() => {
    const node = anchor.current;
    const view = node?.ownerDocument.defaultView;
    if (!node || !view || start !== 'feed') {
      return undefined;
    }
    let stopped = false;
    const stop = () => {
      stopped = true;
    };
    const align = () => {
      if (stopped) {
        return;
      }
      const top = node.getBoundingClientRect().top + view.scrollY;
      // A little of the post's end stays on screen, so it reads as "under
      // the post", not as a page of its own.
      view.scrollTo({ top: Math.max(0, top - 220), behavior: 'instant' });
    };
    const timers = [50, 300, 800, 1500, 2500, 4000].map((ms) =>
      view.setTimeout(align, ms),
    );
    view.addEventListener('wheel', stop, { passive: true });
    view.addEventListener('touchstart', stop, { passive: true });
    view.addEventListener('keydown', stop);
    return () => {
      timers.forEach((timer) => view.clearTimeout(timer));
      view.removeEventListener('wheel', stop);
      view.removeEventListener('touchstart', stop);
      view.removeEventListener('keydown', stop);
    };
  }, [anchor, start, postId]);
};

/**
 * Below laptop the post page is one column: the post, its comments, then
 * the widgets and the site footer. A feed after the footer reads as an
 * afterthought, so there it goes right after the comments, in a node
 * placed after the post's main column. Production would need that as a
 * slot in PostContent; this is the one place the review reaches inside it.
 * On laptops the widgets sit beside the post and the feed goes under both.
 */
const useFeedSlot = (
  main: React.RefObject<HTMLElement>,
  postId: string,
): HTMLElement | null => {
  const laptop = useMediaQueryIn(main, laptopQuery);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = main.current;
    if (!root || laptop !== false) {
      setSlot(null);
      return undefined;
    }
    const node = root.ownerDocument.createElement('div');
    node.className = 'flex flex-col';
    const place = () => {
      const column = root.querySelector('[data-testid="postContainer"]');
      if (!column || column.nextElementSibling === node) {
        return;
      }
      column.after(node);
      setSlot(node);
    };
    place();
    const observer = new MutationObserver(place);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      node.remove();
      setSlot(null);
    };
  }, [main, laptop, postId]);

  return slot;
};

export const PostPageWithFeed = ({
  postId = DEFAULT_POST_ID,
  post,
  start = 'feed',
  renderFeed,
}: {
  postId?: string;
  /** A post to open on instead of `postId`, for edge cases made up from one. */
  post?: Post;
  start?: Start;
  /** The feed after the comments; without it, the post page as it is today. */
  renderFeed?: (host: Post) => ReactNode;
}): ReactElement => {
  const [host, setHost] = useState<Post>(
    () => post ?? ((postById(postId) ?? postById(DEFAULT_POST_ID)) as Post),
  );
  const [opened, setOpened] = useState(0);
  const anchor = useRef<HTMLDivElement>(null);
  const setUrl = useDeviceUrl();

  useEffect(() => {
    const slug = host.slug ?? host.id;
    setUrl(`/posts/${slug}`);
  }, [host, setUrl]);

  const open = useCallback((post: Post) => {
    setHost(post);
    setOpened((count) => count + 1);
    anchor.current?.ownerDocument.defaultView?.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, []);

  const main = useRef<HTMLElement>(null);
  const slot = useFeedSlot(main, host.id);
  useStartAtFeed(
    anchor,
    opened ? 'top' : start,
    `${host.id}-${slot ? 'slot' : 'inline'}`,
  );

  const Content =
    CONTENT_MAP[host.type] ?? (PostContent as PostContentComponent);
  const feed = (
    <>
      <div ref={anchor} id="post-feed" />
      {renderFeed && (
        <React.Fragment key={host.id}>{renderFeed(host)}</React.Fragment>
      )}
    </>
  );

  // A card opens its post in place (its click handler); the link under it
  // must not take the frame away to app.daily.dev. This runs on the frame's
  // window, after React's own handler, so it only stops the navigation.
  useEffect(() => {
    const view = main.current?.ownerDocument.defaultView;
    if (!view) {
      return undefined;
    }
    const keepInPlace = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (
        target?.closest('[data-testid="postPageFeed"] a[href]') &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault();
      }
    };
    view.addEventListener('click', keepInPlace);
    return () => view.removeEventListener('click', keepInPlace);
  }, []);

  return (
    <ExtensionProviders>
      <SeedComments />
      <SettlePending />
      <HistoryStyles />
      <OpenProvider value={open}>
        <AppShell post={host} mainRef={main}>
          <ActivePostContextProvider post={host}>
            <Content
              key={host.id}
              post={host}
              isPostPage
              origin={Origin.ArticlePage}
              className={{
                container: containerClass,
                fixedNavigation: { container: 'flex laptop:hidden' },
                navigation: {
                  container: 'flex tablet:hidden',
                  actions: 'flex-1 justify-between',
                },
              }}
            />
          </ActivePostContextProvider>
          {slot ? createPortal(feed, slot) : feed}
        </AppShell>
      </OpenProvider>
    </ExtensionProviders>
  );
};
