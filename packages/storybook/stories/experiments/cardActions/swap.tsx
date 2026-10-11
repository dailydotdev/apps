import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { PostTypeToGridCard } from '@dailydotdev/shared/src/components/cards/common/gridCards';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import type { DemoActions } from './demo';
import { useDemoActions } from './demo';
import realFeed from './realFeed.json';
import { reachCss } from './primitives';

/* ------------------------------------------------------------------------ */
/* Real content                                                              */
/* ------------------------------------------------------------------------ */

/**
 * 40 posts from the live anonymous feed (api.daily.dev, popularity ranking,
 * fetched 2026-10-08): real titles, covers, sources and counts.
 */
export const realPosts: Post[] = realFeed.posts.map(
  (p) =>
    ({
      ...p,
      title: p.title ?? '',
      bookmarked: false,
      read: false,
      commented: false,
      numAwards: 0,
      userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
      sharedPost: p.sharedPost
        ? { ...p.sharedPost, private: false, summary: '' }
        : undefined,
    } as unknown as Post),
);

export const postsOfType = (type: string): Post[] =>
  realPosts.filter((p) => p.type === type);

/** One of each card type, for the per-type comparisons. */
export const typeSampler: { label: string; post: Post }[] = [
  { label: 'Article', post: postsOfType('article')[1] },
  { label: 'Share', post: postsOfType('share')[1] },
  { label: 'Post', post: postsOfType('freeform')[0] },
  { label: 'Video', post: postsOfType('video:youtube')[3] },
];

/* ------------------------------------------------------------------------ */
/* A concept: what it replaces in the real card                              */
/* ------------------------------------------------------------------------ */

export interface ConceptContext {
  post: Post;
  a: DemoActions;
}

export interface Slots {
  /** Replaces the production action bar. */
  bar?: (ctx: ConceptContext) => ReactNode;
  /**
   * Inserted right before the header's ⋯ button, hover-only on desktop like
   * Read post and ⋯ (visible on touch).
   */
  beforeOptions?: (ctx: ConceptContext) => ReactNode;
}

interface Hosts {
  bar?: HTMLElement;
  beforeOptions?: HTMLElement;
}

const makeHost = (tag: 'div' | 'span' = 'div'): HTMLElement => {
  const host = document.createElement(tag);
  host.dataset.conceptHost = '';
  return host;
};

/**
 * Renders the production grid card for the post and swaps in a concept by
 * DOM surgery: the real bar is hidden and the concept is portalled into hosts
 * placed next to it. No production code is touched, so every card type keeps
 * its real layout, content and spacing.
 */
export const RealCard = ({
  post,
  slots,
  list = false,
}: {
  post: Post;
  slots?: Slots;
  /** Phones and tablets get list cards in production (below 1,020px). */
  list?: boolean;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [hosts, setHosts] = useState<Hosts>({});
  const [missing, setMissing] = useState<string[]>([]);
  const a = useDemoActions(post);
  const Card = list
    ? PostTypeToListCard[post.type] ?? ArticleList
    : PostTypeToGridCard[post.type] ?? ArticleGrid;

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !slots) {
      return undefined;
    }
    const undo: (() => void)[] = [];
    const next: Hosts = {};

    const upvote = root.querySelector('[id$="-upvote-btn"]');
    const bar = upvote?.closest<HTMLElement>(
      '.flex-row.items-center.justify-between',
    );
    if (slots.bar && bar) {
      const host = makeHost();
      host.dataset.bar = '';
      bar.style.display = 'none';
      bar.after(host);
      next.bar = host;
      undo.push(() => {
        host.remove();
        bar.style.display = '';
      });
    }

    // Every grid header (freeform's too) has the ⋯ "Options" button.
    const options = root.querySelector<HTMLElement>(
      'button[aria-label="Options"]',
    );
    if (slots.beforeOptions && options) {
      const host = makeHost();
      // Same rule production gives Read post and ⋯ (`visibleOnGroupHover`):
      // hidden at rest on desktop, shown while the card is hovered.
      host.className =
        'flex items-center laptop:mouse:invisible laptop:mouse:group-hover:visible';
      options.before(host);
      next.beforeOptions = host;
      undo.push(() => host.remove());
    }

    setHosts(next);
    // The swap leans on production markup (the upvote button's id, the bar's
    // classes, the ⋯ button's label). If any of it changes, say so on the
    // card instead of quietly showing production's bar as the concept.
    setMissing(
      (['bar', 'beforeOptions'] as const).filter(
        (slot) => slots[slot] && !next[slot],
      ),
    );
    return () => undo.forEach((u) => u());
  }, [slots]);

  const ctx = { post, a };
  return (
    <div ref={ref} className="relative flex flex-col">
      <style>{reachCss}</style>
      {missing.length > 0 && (
        <p
          role="alert"
          className="absolute left-2 top-2 rounded-8 bg-accent-ketchup-default px-2 py-1 font-bold text-white typo-caption1"
          style={{ zIndex: 3 }}
        >
          Slot not found: {missing.join(', ')}
        </p>
      )}
      <Card
        post={post}
        onPostClick={fn()}
        onPostAuxClick={fn()}
        onUpvoteClick={fn()}
        onDownvoteClick={fn()}
        onCommentClick={fn()}
        onBookmarkClick={fn()}
        onCopyLinkClick={fn()}
        onShare={fn()}
        onReadArticleClick={fn()}
      />
      {slots?.bar && hosts.bar && createPortal(slots.bar(ctx), hosts.bar)}
      {slots?.beforeOptions &&
        hosts.beforeOptions &&
        createPortal(slots.beforeOptions(ctx), hosts.beforeOptions)}
    </div>
  );
};
