import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import fixturePost from '@dailydotdev/shared/__tests__/fixture/post';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import ArticlePostModal from '@dailydotdev/shared/src/components/modals/ArticlePostModal';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { WidgetContainer } from '@dailydotdev/shared/src/components/widgets/common';
import { Portal } from '@dailydotdev/shared/src/components/tooltips/Portal';
import { GetAppQrCode } from '@dailydotdev/shared/src/features/getApp/components/GetAppQrCode';
import { ExtensionProviders } from '../extension/_providers';
import { cardHandlers, feedPosts } from '../features/feed/feedHero.mocks';

// The real post modal, opened over the feed, with the proposed phone widget at
// the top of its real sidebar.

const meta: Meta = {
  title: 'Day Zero Retention/Live post',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const [feedPost] = feedPosts;

const post: Post = {
  ...fixturePost,
  ...feedPost,
  summary:
    'Most effects in a React codebase are not effects at all. This walks through six common ones, derived state, event handlers, data fetching, subscriptions, syncing with props and resetting state, and shows where each one actually belongs.',
  author: fixturePost.author,
};

// PostWidgets renders the sidebar as the modal's only <aside>. The widget has
// no slot there, so this mounts a node at the top of it.
const useSidebarSlot = (): HTMLElement | null => {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let node: HTMLElement | null = null;
    const attach = (): boolean => {
      const sidebar = document.querySelector<HTMLElement>(
        '.ReactModal__Content aside',
      );

      if (!sidebar) {
        return false;
      }

      node = document.createElement('div');
      sidebar.prepend(node);
      setSlot(node);
      return true;
    };

    if (attach()) {
      return () => node?.remove();
    }

    const observer = new MutationObserver(() => {
      if (attach()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      node?.remove();
    };
  }, []);

  return slot;
};

const PhoneWidget = ({
  title,
  body,
}: {
  title: ReactNode;
  body: string;
}): ReactElement | null => {
  const slot = useSidebarSlot();

  if (!slot) {
    return null;
  }

  return (
    <Portal container={slot}>
      <WidgetContainer className="flex w-full flex-col items-center gap-3 p-4 text-center">
        <h4 className="font-bold text-text-primary typo-callout">{title}</h4>
        <GetAppQrCode className="size-28" />
        <p className="text-text-tertiary typo-footnote">{body}</p>
      </WidgetContainer>
    </Portal>
  );
};

// react-modal looks up #__next when it opens, so it opens once that is mounted.
const OpenPostModal = (): ReactElement | null => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return null;
  }

  return (
    <ArticlePostModal id={post.id} post={post} isOpen onRequestClose={fn()} />
  );
};

const PostOverFeed = ({ isLate }: { isLate: boolean }): ReactElement => (
  <ExtensionProviders>
    <div id="__next" className="min-h-dvh bg-background-default p-8">
      <div className="grid grid-cols-4 gap-6">
        {[...feedPosts, ...feedPosts].slice(0, 8).map((card, index) => (
          <ArticleGrid
            // eslint-disable-next-line react/no-array-index-key -- repeated mocks
            key={`${card.id}-${index}`}
            post={card}
            {...cardHandlers}
          />
        ))}
      </div>
      <OpenPostModal />
      {isLate ? (
        <PhoneWidget
          title={
            <>
              Late one?
              <br />
              Finish it in bed
            </>
          }
          body="Scan to pick up this post in the app."
        />
      ) : (
        <PhoneWidget
          title="Read it on your phone"
          body="Scan to open this post in the app."
        />
      )}
    </div>
  </ExtensionProviders>
);

export const PostModal: StoryObj<{ late: boolean }> = {
  name: 'Post modal · phone widget',
  args: { late: false },
  render: ({ late }) => <PostOverFeed isLate={late} />,
};
