import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  cardHandlers,
  FeedHeroProviders,
} from '../features/feed/feedHero.mocks';
import { realPosts } from '../hero-cover/realData';

/* Real posts from the production snapshot (hero-cover/realFeed.ts), ranked
   by the visitor's picked stack so the "build your feed" variations show a
   feed that visibly changes with each chip. */

export type Stack = { label: string; tags: string[] };

export const stacks: Stack[] = [
  { label: 'React', tags: ['react', 'javascript', 'css', 'webdev'] },
  { label: 'TypeScript', tags: ['typescript', 'javascript', 'nodejs'] },
  {
    label: 'AI & LLMs',
    tags: ['llm', 'ai', 'ai-agents', 'rag', 'machine-learning', 'ai-coding'],
  },
  { label: 'Python', tags: ['python', 'machine-learning'] },
  { label: 'DevOps', tags: ['devops', 'kubernetes', 'docker', 'cloud'] },
  { label: 'Rust', tags: ['rust'] },
  { label: 'Go', tags: ['golang'] },
  {
    label: 'Backend',
    tags: ['database', 'postgresql', 'architecture', 'nodejs', '.net', 'c#'],
  },
  { label: 'Career', tags: ['career', 'productivity'] },
  { label: 'Open source', tags: ['open-source'] },
];

const stackByLabel = new Map(stacks.map((stack) => [stack.label, stack]));

export const matchedStack = (
  post: Post,
  picked: Iterable<string>,
): string | undefined => {
  for (const label of picked) {
    const stack = stackByLabel.get(label);
    if (stack && post.tags?.some((tag) => stack.tags.includes(tag))) {
      return label;
    }
  }
  return undefined;
};

export const rankPosts = (picked: Set<string>, count: number): Post[] => {
  const scored = realPosts.map((post, index) => {
    const hits = [...picked].filter((label) =>
      stackByLabel.get(label)?.tags.some((tag) => post.tags?.includes(tag)),
    ).length;
    return { post, index, hits };
  });
  scored.sort((a, b) => b.hits - a.hits || a.index - b.index);
  return scored.slice(0, count).map((entry) => entry.post);
};

export const postsThisWeek = (picked: Set<string>): number =>
  picked.size === 0 ? 184 : 61 + picked.size * 47;

export type FeedAction = 'upvote' | 'save' | 'read';

const actionOf = (target: HTMLElement): FeedAction => {
  const control = target.closest('button, a');
  const label = `${control?.getAttribute('aria-label') ?? ''} ${
    control?.textContent ?? ''
  }`.toLowerCase();
  if (label.includes('upvote')) {
    return 'upvote';
  }
  if (label.includes('bookmark') || label.includes('save')) {
    return 'save';
  }
  return 'read';
};

/** Production feed cards. `onAction` swallows every click and reports what
 * the visitor tried to do, for the variations that gate on the first
 * action. */
export const FeedCards = ({
  posts,
  columns = 3,
  className,
  onAction,
}: {
  posts: Post[];
  columns?: 2 | 3 | 4;
  className?: string;
  onAction?: (action: FeedAction, post: Post) => void;
}): ReactElement => (
  <FeedHeroProviders>
    <div
      className={classNames(
        'grid grid-cols-1 gap-4',
        columns === 2 && 'tablet:grid-cols-2',
        columns === 3 && 'tablet:grid-cols-3',
        columns === 4 && 'tablet:grid-cols-4',
        className,
      )}
    >
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex min-h-[20rem]"
          onClickCapture={
            onAction
              ? (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onAction(actionOf(event.target as HTMLElement), post);
                }
              : undefined
          }
        >
          <ArticleGrid post={post} {...cardHandlers} />
        </div>
      ))}
    </div>
  </FeedHeroProviders>
);

/** A compact row per post for the frames beside the signup column. */
export const MiniFeed = ({
  posts,
  reasons,
  title,
  footer,
}: {
  posts: Post[];
  reasons?: Set<string>;
  title?: ReactNode;
  footer?: ReactNode;
}): ReactElement => (
  <div className="lh-mini">
    {title && <div className="lh-mini-head">{title}</div>}
    <ul className="lh-mini-list">
      {posts.map((post) => {
        const reason = reasons ? matchedStack(post, reasons) : undefined;
        return (
          <li key={post.id} className="lh-mini-card">
            <img className="lh-mini-img" src={post.image} alt="" />
            <span className="lh-mini-body">
              <span className="lh-mini-title">{post.title}</span>
              <span className="lh-mini-meta">
                <img src={post.source?.image} alt="" />
                {post.source?.name} · {post.readTime}m read
                {reason && <em className="lh-mini-reason">Matches {reason}</em>}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
    {footer && <div className="lh-mini-foot">{footer}</div>}
  </div>
);
