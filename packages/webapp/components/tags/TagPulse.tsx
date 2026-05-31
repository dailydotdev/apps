import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { TopPost } from '@dailydotdev/shared/src/graphql/feed';
import styles from './tagShowcase.module.css';

interface TagPulseProps {
  tag: string;
  posts: TopPost[];
}

/**
 * Live "newsroom ticker" — an auto-scrolling marquee of the freshest posts for
 * a tag. Real titles (SSR data, in the DOM for crawlers) plus motion make the
 * page feel alive the second it loads. Pauses on hover so titles are clickable.
 */
export function TagPulse({ tag, posts }: TagPulseProps): ReactElement | null {
  const items = posts.filter((post) => !!post.title).slice(0, 12);
  if (items.length < 4) {
    return null;
  }

  const renderItem = (post: TopPost, copy: string): ReactElement => (
    <Link
      key={`${copy}-${post.id}`}
      href={`/posts/${post.slug || post.id}`}
      prefetch={false}
    >
      <a className="flex shrink-0 items-center gap-2 whitespace-nowrap text-text-secondary typo-footnote hover:text-text-primary">
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-accent-cabbage-default"
        />
        {post.title}
      </a>
    </Link>
  );

  return (
    <section
      aria-label={`Latest ${tag} posts`}
      className="mx-4 flex items-stretch overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float"
    >
      <div className="z-1 flex shrink-0 items-center gap-2 border-r border-border-subtlest-tertiary bg-surface-float px-4 font-bold typo-footnote">
        <span className="size-2 animate-scale-down-pulse rounded-full bg-accent-ketchup-default" />
        Live
      </div>
      <div className={`${styles.marquee} relative flex-1 overflow-hidden`}>
        <div
          className={`${styles.marqueeTrack} flex items-center gap-8 py-3 pl-8`}
        >
          {/* Duplicated track so the -50% marquee loops seamlessly. */}
          {items.map((post) => renderItem(post, 'a'))}
          {items.map((post) => renderItem(post, 'b'))}
        </div>
      </div>
    </section>
  );
}
