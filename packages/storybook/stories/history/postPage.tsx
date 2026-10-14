import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createPortal } from 'react-dom';
import { PostContent } from '@dailydotdev/shared/src/components/post/PostContent';
import { SquadPostContent } from '@dailydotdev/shared/src/components/post/SquadPostContent';
import { CollectionPostContent } from '@dailydotdev/shared/src/components/post/collection/CollectionPostContent';
import { BriefPostContent } from '@dailydotdev/shared/src/components/post/brief/BriefPostContent';
import { PollPostContent } from '@dailydotdev/shared/src/components/post/poll/PollPostContent';
import { SocialTwitterPostContent } from '@dailydotdev/shared/src/components/post/SocialTwitterPostContent';
import { DigestPostContent } from '@dailydotdev/shared/src/components/post/digest/DigestPostContent';
import type { PostContentProps } from '@dailydotdev/shared/src/components/post/common';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import type { HistoryItem } from './data';
import { mountFrame } from './device';
import { HistoryStyles } from './kit';
import { fullPost } from './posts';

// The real post page for a history item: the component production's post
// page picks for its type, fed the post as POST_BY_ID_QUERY returned it
// from api.daily.dev. daily.dev can't
// be framed (X-Frame-Options: DENY), so the page renders from source.
//
// It renders into a frame of its own so the page's media queries see the
// card's width, not the window's: the post gets its tablet layout.

type PostContentComponent = ComponentType<PostContentProps>;

/** pages/posts/[id]'s CONTENT_MAP, type for type. */
const CONTENT_MAP: Record<PostType, PostContentComponent> = {
  article: PostContent as PostContentComponent,
  share: SquadPostContent as PostContentComponent,
  freeform: SquadPostContent as PostContentComponent,
  [PostType.VideoYouTube]: PostContent as PostContentComponent,
  collection: CollectionPostContent as PostContentComponent,
  [PostType.Brief]: BriefPostContent as PostContentComponent,
  [PostType.Poll]: PollPostContent as PostContentComponent,
  [PostType.SocialTwitter]: SocialTwitterPostContent as PostContentComponent,
  [PostType.Digest]: DigestPostContent,
};

/**
 * A blank frame with this document's styles and theme, portaled into so
 * React context still reaches the page inside.
 */
const Viewport = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const doc = frame?.contentDocument;
    if (!doc) {
      return undefined;
    }
    const unmount = mountFrame(doc);
    setBody(doc.body);
    return unmount;
  }, [frame]);

  // As tall as the post, so the page scrolls it in full.
  useEffect(() => {
    if (!frame || !body) {
      return undefined;
    }
    // The body keeps the frame's size; what the frame scrolls is the post.
    const fit = () => {
      const doc = body.ownerDocument;
      const height = Math.max(
        doc.documentElement.scrollHeight,
        body.scrollHeight,
      );
      if (Math.abs(height - frame.offsetHeight) > 1) {
        frame.style.height = `${height}px`;
      }
    };
    const observer = new ResizeObserver(fit);
    [...body.children].forEach((child) => observer.observe(child));
    // Comments, embeds and images arrive after the first paint.
    const changes = new MutationObserver(fit);
    changes.observe(body, { childList: true, subtree: true });
    body.addEventListener('load', fit, true);
    fit();
    return () => {
      observer.disconnect();
      changes.disconnect();
      body.removeEventListener('load', fit, true);
    };
  }, [frame, body]);

  return (
    <iframe ref={setFrame} title="Post" className={className}>
      {body && createPortal(children, body)}
    </iframe>
  );
};

export const PostPage = ({ item }: { item: HistoryItem }): ReactElement => {
  const post = fullPost(item.id);
  const Content = CONTENT_MAP[post.type];
  return (
    <div className="flex">
      <Viewport className="w-full border-0 bg-background-default">
        <HistoryStyles />
        {/* The window is a laptop in production, so every post type's
            header actions (Read post, its ⋯) show on the source line. */}
        <style>{'.hidden.laptop\\:flex { display: flex; }'}</style>
        <ActivePostContextProvider post={post}>
          <Content
            key={post.id}
            post={post}
            isPostPage
            origin={Origin.ArticlePage}
            className={{
              container:
                // min-h-page left out: in a frame sized to its content it
                // would grow the frame forever.
                'mb-16 max-w-[69.25rem] tablet:mb-8 laptop:mb-0 laptop:pb-6 laptopL:pb-0',
              fixedNavigation: { container: 'flex laptop:hidden' },
              navigation: {
                container: 'flex tablet:hidden',
                actions: 'flex-1 justify-between',
              },
            }}
          />
        </ActivePostContextProvider>
      </Viewport>
    </div>
  );
};
