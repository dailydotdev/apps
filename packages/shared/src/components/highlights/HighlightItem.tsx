import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import type { PostHighlightFeed } from '../../graphql/highlights';
import { stripHtmlTags } from '../../lib/strings';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { PostSelectionArea } from '../post/PostSelectionArea';
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
    const post =
      highlight.post.type === PostType.Share && highlight.post.sharedPost
        ? highlight.post.sharedPost
        : highlight.post;

    const summary = post.summary?.trim();
    if (summary) {
      return summary;
    }

    const html = post.contentHtml?.trim();
    if (html) {
      return stripHtmlTags(html).slice(0, 300);
    }

    return '';
  }, [highlight.post]);

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
            className="mt-0.5 text-text-quaternary typo-footnote"
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
          {/*
            Only the expanded summary is quotable. The headline sits inside the
            expand/collapse button, where a drag toggles the row instead of
            selecting, so binding the bar to it would raise nothing.
            The query fetches enough of the post for the bar and its logging.
          */}
          <PostSelectionArea post={highlight.post as unknown as Post}>
            <p className="text-text-secondary typo-markdown">{tldr}</p>
          </PostSelectionArea>
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
