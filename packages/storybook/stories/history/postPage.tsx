import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createPortal } from 'react-dom';
import { PostContent } from '@dailydotdev/shared/src/components/post/PostContent';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import type { HistoryItem } from './data';
import { HistoryStyles } from './kit';
import { fullPost } from './posts';

// The real post page for a history item: production's PostContent, fed the
// post as POST_BY_ID_QUERY returned it from api.daily.dev. daily.dev can't
// be framed (X-Frame-Options: DENY), so the page renders from source.
//
// It renders into a frame of its own so the page's media queries see the
// card's width, not the window's: the post gets its tablet layout.

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
    doc.open();
    doc.write('<!doctype html><html><head></head><body></body></html>');
    doc.close();
    doc.documentElement.className = document.documentElement.className;
    document.head
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => doc.head.appendChild(node.cloneNode(true)));
    doc.body.className = 'bg-background-default text-text-primary';
    doc.body.style.margin = '0';
    setBody(doc.body);

    const theme = new MutationObserver(() => {
      doc.documentElement.className = document.documentElement.className;
    });
    theme.observe(document.documentElement, { attributes: true });
    return () => theme.disconnect();
  }, [frame]);

  return (
    <iframe ref={setFrame} title="Post" className={className}>
      {body && createPortal(children, body)}
    </iframe>
  );
};

export const PostPage = ({ item }: { item: HistoryItem }): ReactElement => {
  const post = fullPost(item.id);
  return (
    <div className="flex min-h-0 flex-1">
      <Viewport className="h-full w-full border-0 bg-background-default">
        <HistoryStyles />
        <ActivePostContextProvider post={post}>
          <PostContent
            key={post.id}
            post={post}
            isPostPage
            origin={Origin.ArticlePage}
          />
        </ActivePostContextProvider>
      </Viewport>
    </div>
  );
};
