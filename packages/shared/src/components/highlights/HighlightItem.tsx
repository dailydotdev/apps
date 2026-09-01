import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import type { PostHighlightFeed } from '../../graphql/highlights';
import { stripHtmlTags } from '../../lib/strings';
import { PostType } from '../../graphql/posts';
import { ArrowIcon } from '../icons/Arrow';
import { IconSize } from '../Icon';
import Link from '../utilities/Link';
import { RelativeTime } from '../utilities/RelativeTime';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { HighlightSnapshotButton } from '../../features/snapshot/HighlightSnapshotButton';
import { useSharePlacement } from '../../features/snapshot/useSharePlacement';
import {
  featureSnapshotHighlightExpanded,
  featureSnapshotHighlightRow,
} from '../../lib/featureManagement';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';

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
  const rowSnapshot = useSharePlacement({
    feature: featureSnapshotHighlightRow,
  });
  const expandedSnapshot = useSharePlacement({
    feature: featureSnapshotHighlightExpanded,
    shouldEvaluate: expanded,
  });

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

  const snapshotProps = {
    channel: highlight.channel,
    headline: highlight.headline,
    id: highlight.id,
    link: highlight.post.commentsPermalink,
    meta: formatDate({
      value: highlight.highlightedAt,
      type: TimeFormatType.Post,
    }),
    tldr,
  };

  return (
    <article ref={ref}>
      <div className="flex items-center pr-2 transition-colors hover:bg-surface-hover">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3 text-left"
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
        {rowSnapshot && (
          <HighlightSnapshotButton
            {...snapshotProps}
            showLabel={false}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        )}
      </div>
      {expanded && tldr && (
        <div className="flex flex-col gap-3 px-4 pb-3">
          <p className="text-text-secondary typo-markdown">{tldr}</p>
          <div className="flex items-center gap-3">
            <Link href={highlight.post.commentsPermalink}>
              <a className="flex flex-1 items-center gap-1 font-bold text-text-link typo-footnote hover:underline">
                Read more
              </a>
            </Link>
            {expandedSnapshot && (
              <HighlightSnapshotButton
                {...snapshotProps}
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
              />
            )}
          </div>
        </div>
      )}
    </article>
  );
};
