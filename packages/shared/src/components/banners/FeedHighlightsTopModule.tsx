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

const HighlightRowSkeleton = (): ReactElement => (
  <div className="flex items-start gap-3 px-4 py-2.5">
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
    <section className="mb-4 w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90">
      <header className="flex items-center border-b border-white/10 px-4 py-3">
        <h2 className="font-bold text-white typo-title3">Happening Now</h2>
      </header>

      <div className="divide-y divide-white/10">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <HighlightRowSkeleton key={index} />
            ))
          : highlights.slice(0, 3).map((highlight, index) => (
              <Link
                key={`${highlight.channel}-${highlight.post.id}`}
                href={highlight.post.commentsPermalink}
                passHref
              >
                <a
                  className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
                  onClick={() => onHighlightClick?.(highlight, index + 1)}
                >
                  <span className="line-clamp-2 flex-1 text-white typo-callout">
                    {highlight.headline}
                  </span>
                  <RelativeTime
                    dateTime={highlight.highlightedAt}
                    className="shrink-0 text-white/70 typo-caption2"
                  />
                </a>
              </Link>
            ))}
      </div>

      <footer className="flex items-center border-t border-white/10 px-4 py-2.5">
        <span className="text-white/60 typo-caption2">More from</span>
        <Link href={`${webappUrl}agents`} passHref>
          <a
            className="ml-1.5 text-white typo-caption1 hover:underline"
            onClick={onAgentsLinkClick}
          >
            daily.dev/agents
          </a>
        </Link>
      </footer>
    </section>
  );
};
