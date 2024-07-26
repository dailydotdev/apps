import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { ArrowIcon } from '../icons';
import { Post } from '../../graphql/posts';
import styles from '../cards/Card.module.css';
import { CardLink } from '../cards/Card';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';
import { postLogEvent } from '../../lib/feed';
import LogContext from '../../contexts/LogContext';
import { WidgetContainer } from './common';
import { combinedClicks } from '../../lib/click';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';

export type BestDiscussionsProps = {
  posts: Post[] | null;
  isLoading: boolean;
  className?: string;
};

const Separator = <div className="h-px bg-border-subtlest-tertiary" />;

type PostProps = {
  post: Post;
  onLinkClick: (post: Post) => unknown;
};

const ListItem = ({ post, onLinkClick }: PostProps): ReactElement => (
  <article
    className={classNames(
      'group relative flex flex-col items-start px-4 py-3 hover:bg-surface-hover',
      styles.card,
    )}
  >
    <Link href={post.commentsPermalink} prefetch={false} passHref>
      <CardLink
        title={post.title}
        {...combinedClicks(() => onLinkClick(post))}
      />
    </Link>
    <h5
      className={classNames(
        'multi-truncate mb-2 text-text-primary typo-callout',
        styles.title,
      )}
    >
      {post.title}
    </h5>
    <div className="flex items-center text-text-tertiary typo-footnote">
      <div>{post.numComments} Comments</div>
    </div>
  </article>
);

const TextPlaceholder = classed(ElementPlaceholder, 'h-3 rounded-12 my-0.5');

const ListItemPlaceholder = (): ReactElement => (
  <article aria-busy className="relative flex flex-col items-start px-4 py-3">
    <TextPlaceholder style={{ width: '80%' }} />
    <TextPlaceholder style={{ width: '80%' }} />
    <TextPlaceholder style={{ width: '40%' }} />
  </article>
);

export const BestDiscussionsContainer = classed(
  WidgetContainer,
  'flex flex-col',
);

export default function BestDiscussions({
  posts,
  isLoading,
  className,
}: BestDiscussionsProps): ReactElement {
  const { logEvent } = useContext(LogContext);

  const onLinkClick = (post: Post): void => {
    logEvent(
      postLogEvent('click', post, {
        extra: { origin: 'best discussions' },
      }),
    );
  };

  const onLucky = (): void => {};

  return (
    <BestDiscussionsContainer className={className}>
      <h4 className="my-0.5 px-4 py-3 text-text-tertiary typo-body">
        Best discussions
      </h4>
      {Separator}
      {isLoading ? (
        <>
          <ListItemPlaceholder />
          <ListItemPlaceholder />
          <ListItemPlaceholder />
        </>
      ) : (
        <>
          {posts?.slice(1).map((post) => (
            <ListItem key={post.id} post={post} onLinkClick={onLinkClick} />
          ))}
        </>
      )}

      {Separator}
      <Link
        href={posts?.[0]?.commentsPermalink ?? '/'}
        prefetch={false}
        passHref
      >
        <Button
          variant={ButtonVariant.Tertiary}
          className="my-2 ml-2 self-start"
          size={ButtonSize.Small}
          tag="a"
          icon={<ArrowIcon className="rotate-90" />}
          iconPosition={ButtonIconPosition.Right}
          {...combinedClicks(onLucky)}
        >
          I&apos;m feeling lucky
        </Button>
      </Link>
    </BestDiscussionsContainer>
  );
}
