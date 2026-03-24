import type { ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { RelativeTime } from '../utilities/RelativeTime';
import type { PostHighlight } from '../../graphql/highlights';
import { webappUrl } from '../../lib/constants';

interface FeedHighlightsTopModuleProps {
  highlights: PostHighlight[];
  loading: boolean;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onAgentsLinkClick?: () => void;
}

const HIGHLIGHT_SKELETON_KEYS = ['one', 'two', 'three'] as const;

const HighlightRowSkeleton = (): ReactElement => (
  <div className="flex items-start gap-3 px-4 py-3">
    <div className="h-4 flex-1 animate-pulse rounded-8 bg-white/10" />
    <div className="h-3 w-10 shrink-0 animate-pulse rounded-8 bg-white/10" />
  </div>
);

export const FeedHighlightsTopModule = ({
  highlights,
  loading,
  onHighlightClick,
  onAgentsLinkClick,
}: FeedHighlightsTopModuleProps): ReactElement | null => {
  if (!loading && highlights.length === 0) {
    return null;
  }

  return (
    <section className="relative mb-4 w-full overflow-hidden rounded-16 border border-white/10 bg-raw-pepper-90 shadow-2">
      <div className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

      <header className="relative flex items-center border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-accent-cabbage-default" />
          <h2 className="font-bold text-white typo-title3">Happening Now</h2>
        </div>
        <span className="ml-auto rounded-full border border-white/20 px-2 py-0.5 text-white/80 typo-caption2">
          Live
        </span>
      </header>

      <div className="divide-y divide-white/10">
        {loading
          ? HIGHLIGHT_SKELETON_KEYS.map((key) => (
              <HighlightRowSkeleton key={key} />
            ))
          : highlights.slice(0, 3).map((highlight, index) => (
              <Link
                key={`${highlight.channel}-${highlight.post.id}`}
                href={highlight.post.commentsPermalink}
                passHref
              >
                <a
                  href={highlight.post.commentsPermalink}
                  className="group flex items-start gap-3 px-4 py-3 transition-all hover:bg-white/5"
                  onClick={() => onHighlightClick?.(highlight, index + 1)}
                >
                  <span className="mt-0.5 text-white/60 typo-caption1">
                    {index + 1}
                  </span>
                  <span className="line-clamp-2 flex-1 text-white typo-callout group-hover:text-white/95">
                    {highlight.headline}
                  </span>
                  <RelativeTime
                    dateTime={highlight.highlightedAt}
                    className="shrink-0 text-white/65 typo-caption2 group-hover:text-white/80"
                  />
                </a>
              </Link>
            ))}
      </div>

      <footer className="relative flex items-center border-t border-white/10 px-4 py-2.5">
        <span className="text-white/55 typo-caption2">More from</span>
        <Link href={`${webappUrl}agents`} passHref>
          <a
            href={`${webappUrl}agents`}
            className="ml-1.5 text-white/90 typo-caption1 underline-offset-2 hover:text-white hover:underline"
            onClick={onAgentsLinkClick}
          >
            daily.dev/agents
          </a>
        </Link>
      </footer>
    </section>
  );
};
