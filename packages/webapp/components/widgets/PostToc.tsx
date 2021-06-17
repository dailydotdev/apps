import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post, TocItem } from '@dailydotdev/shared/src/graphql/posts';
import {
  logReadArticle,
  trackEvent,
} from '@dailydotdev/shared/src/lib/analytics';
import TocIcon from '@dailydotdev/shared/icons/toc.svg';
import styles from './PostToc.module.css';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';

export type PostTocProps = {
  post: Post;
  className?: string;
  collapsible?: boolean;
};

const Separator = <div className="h-px bg-theme-divider-tertiary mb-3" />;

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
  const onLinkClick = async (): Promise<void> => {
    trackEvent({
      category: 'Post',
      action: 'Click',
      label: 'Toc',
    });
    await logReadArticle('toc');
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
          className="flex-1 py-2 px-4 hover:bg-theme-hover truncate typo-callout"
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
        <summary
          className={`cursor-pointer focus-outline hover:bg-theme-hover ${styles.summary}`}
        >
          <div className={titleClass}>
            <TocIcon className="text-2xl mr-2" />
            Table of contents
            <ArrowIcon
              className={`icon ml-auto text-xl transform rotate-180 ${styles.arrow}`}
              style={{ transition: 'transform 0.1s linear' }}
            />
          </div>
        </summary>
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
        <TocIcon className="text-2xl mr-2" />
        Table of contents
      </h4>
      {Separator}
      {items}
    </section>
  );
}
