import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import type { PostHighlightFeed } from '../../graphql/highlights';
import { stripHtmlTags } from '../../lib/strings';
import { ArrowIcon } from '../icons/Arrow';
import { IconSize } from '../Icon';
import Link from '../utilities/Link';
import { RelativeTime } from '../utilities/RelativeTime';

interface HighlightItemProps {
  highlight: PostHighlightFeed;
  defaultExpanded?: boolean;
}

export const HighlightItem = ({
  highlight,
  defaultExpanded = false,
}: HighlightItemProps): ReactElement => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (defaultExpanded) {
      setExpanded(true);
    }
  }, [defaultExpanded]);

  useEffect(() => {
    if (defaultExpanded && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [defaultExpanded]);

  const tldr = useMemo(() => {
    const summary = highlight.post.summary?.trim();
    if (summary) {
      return summary;
    }

    const html = highlight.post.contentHtml?.trim();
    if (html) {
      return stripHtmlTags(html).slice(0, 300);
    }

    return '';
  }, [highlight.post.summary, highlight.post.contentHtml]);

  return (
    <article ref={ref}>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-bold text-text-primary typo-body">
            {highlight.headline}
          </span>
          <RelativeTime
            dateTime={highlight.highlightedAt}
            maxHoursAgo={72}
            className="text-text-quaternary typo-footnote"
          />
        </div>
        <ArrowIcon
          size={IconSize.Small}
          className={classNames(
            'shrink-0 text-text-tertiary transition-transform',
            expanded ? 'rotate-180' : 'rotate-90',
          )}
        />
      </button>
      {expanded && tldr && (
        <div className="flex flex-col gap-3 px-4 pb-3">
          <p className="text-text-secondary typo-markdown">{tldr}</p>
          <Link href={highlight.post.commentsPermalink}>
            <a className="flex items-center gap-1 font-bold text-text-link typo-footnote hover:underline">
              Read more
            </a>
          </Link>
        </div>
      )}
    </article>
  );
};
