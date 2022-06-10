import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Post, TocItem } from '../../graphql/posts';
import TocIcon from '../icons/Unread';
import { Summary, SummaryArrow } from '../utilities';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import styles from './PostToc.module.css';

export type PostTocProps = {
  post: Post;
  className?: string;
  collapsible?: boolean;
};

const Separator = <div className="mb-3 h-px bg-theme-divider-tertiary" />;

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
  const { trackEvent } = useContext(AnalyticsContext);

  const onLinkClick = async (): Promise<void> => {
    trackEvent(postAnalyticsEvent('click', post, { extra: { origin: 'toc' } }));
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
          className="flex-1 py-2 px-4 truncate hover:bg-theme-hover typo-callout"
        >
          {item.text}
        </a>
      ))}
    </>
  );

  const titleClass =
    'flex items-center py-3 px-4 typo-body text-theme-label-tertiary';
  if (collapsible) {
    return (
      <details
        className={classNames(
          'flex-col rounded-2xl bg-theme-bg-secondary overflow-hidden select-none',
          styles.details,
          className,
        )}
      >
        <Summary className="hover:bg-theme-hover">
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
    <section
      className={classNames(
        'flex-col rounded-2xl pb-3 bg-theme-bg-secondary overflow-hidden',
        className,
      )}
    >
      <h4 className={titleClass}>
        <TocIcon className="mr-2 text-2xl" />
        Table of contents
      </h4>
      {Separator}
      {items}
    </section>
  );
}
