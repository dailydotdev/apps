import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import type { Post, TocItem } from '../../graphql/posts';
import { UnreadIcon as TocIcon } from '../icons';
import { Summary, SummaryArrow, TruncateText } from '../utilities';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { ActiveFeedContext } from '../../contexts';
import styles from './PostToc.module.css';
import { WidgetContainer } from './common';
import { LogEvent } from '../../lib/log';

export type PostTocProps = {
  post: Post;
  className?: string;
  collapsible?: boolean;
};

const Separator = <div className="mb-3 h-px bg-border-subtlest-tertiary" />;

const generateTocLink = (post: Post, item: TocItem): string => {
  if (!item.id) {
    return post.permalink;
  }
  return `${post.permalink}?a=${item.id}`;
};

export default function PostToc({
  post,
  className,
  collapsible,
}: PostTocProps): ReactElement {
  const { logEvent } = useLogContext();
  const { logOpts } = useContext(ActiveFeedContext);

  const onLinkClick = async (): Promise<void> => {
    logEvent(
      postLogEvent(LogEvent.Click, post, {
        extra: { origin: 'toc' },
        ...(logOpts && logOpts),
      }),
    );
  };

  const items = (
    <>
      {post.toc.map((item) => (
        <a
          key={item.text}
          href={generateTocLink(post, item)}
          target="_blank"
          rel="noopener"
          title={item.text}
          onClick={onLinkClick}
          className="flex flex-1 truncate px-4 py-2 typo-callout hover:bg-surface-hover"
        >
          <TruncateText>{item.text}</TruncateText>
        </a>
      ))}
    </>
  );

  const titleClass =
    'flex items-center py-3 px-4 typo-body text-text-tertiary border border-border-subtlest-quaternary';
  if (collapsible) {
    return (
      <details
        className={classNames(
          'select-none flex-col overflow-hidden rounded-16',
          styles.details,
          className,
        )}
      >
        <Summary className="hover:bg-surface-hover">
          <div className={titleClass}>
            <TocIcon className="mr-2 text-2xl" />
            Table of contents
            <SummaryArrow />
          </div>
        </Summary>
        {Separator}
        {items}
      </details>
    );
  }
  return (
    <WidgetContainer
      className={classNames(
        'flex-col overflow-hidden rounded-16 border border-border-subtlest-quaternary pb-3',
        className,
      )}
    >
      <h4 className={titleClass}>
        <TocIcon className="mr-2 text-2xl" />
        Table of contents
      </h4>
      {Separator}
      {items}
    </WidgetContainer>
  );
}
