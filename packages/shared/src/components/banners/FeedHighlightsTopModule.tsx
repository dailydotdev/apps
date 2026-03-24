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
  <div className="flex items-start gap-3 px-4 py-2.5">
    <div className="bg-white/10 h-4 flex-1 animate-pulse rounded-8" />
    <div className="bg-white/10 h-3 w-10 shrink-0 animate-pulse rounded-8" />
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
      <header className="border-white/10 flex items-center border-b px-4 py-3">
        <h2 className="font-bold text-white typo-title3">Happening Now</h2>
      </header>

      <div className="divide-white/10 divide-y">
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
                  className="hover:bg-white/5 flex items-start gap-3 px-4 py-2.5 transition-colors"
                  onClick={() => onHighlightClick?.(highlight, index + 1)}
                >
                  <span className="line-clamp-2 flex-1 text-white typo-callout">
                    {highlight.headline}
                  </span>
                  <RelativeTime
                    dateTime={highlight.highlightedAt}
                    className="text-white/70 shrink-0 typo-caption2"
                  />
                </a>
              </Link>
            ))}
      </div>

      <footer className="border-white/10 flex items-center border-t px-4 py-2.5">
        <span className="text-white/60 typo-caption2">More from</span>
        <Link href={`${webappUrl}agents`} passHref>
          <a
            href={`${webappUrl}agents`}
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
