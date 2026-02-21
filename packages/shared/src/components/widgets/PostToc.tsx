import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import type { Post, TocItem } from '../../graphql/posts';
import { Summary, SummaryArrow, TruncateText } from '../utilities';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { ActiveFeedContext } from '../../contexts';
import { widgetClasses, WidgetContainer } from './common';
import { LogEvent } from '../../lib/log';

export type PostTocProps = {
  post: Post;
  className?: string;
  collapsible?: boolean;
};

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
          className="-mx-4 flex flex-1 truncate px-4 py-2 typo-callout hover:bg-surface-hover"
        >
          <TruncateText>{item.text}</TruncateText>
        </a>
      ))}
    </>
  );

  const desktopTitleClass = 'mb-2 typo-callout font-bold text-text-primary';
  const collapsibleTitleClass = 'typo-callout font-bold text-text-primary';
  if (collapsible) {
    return (
      <details
        className={classNames(
          'select-none flex-col overflow-hidden px-4 py-0',
          widgetClasses,
          className,
        )}
      >
        <Summary className="-mx-4 px-4 py-3 hover:bg-surface-hover">
          <div className={classNames(collapsibleTitleClass, 'flex items-center')}>
            Table of contents
            <SummaryArrow />
          </div>
        </Summary>
        {items}
      </details>
    );
  }
  return (
    <WidgetContainer
      className={classNames('flex-col overflow-hidden p-4', className)}
    >
      <h4 className={desktopTitleClass}>Table of contents</h4>
      {items}
    </WidgetContainer>
  );
}
