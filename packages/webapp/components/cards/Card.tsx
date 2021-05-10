import React, { ReactNode } from 'react';
import { LazyImage } from '@dailydotdev/shared';
import { Comment } from '../../graphql/comments';
import styles from '../../styles/cards.module.css';
import classed from '../../lib/classed';
import classNames from 'classnames';
import { getTooltipProps } from '../../lib/tooltip';
import { Post } from '../../graphql/posts';

const Title = classed(
  'h3',
  styles.title,
  'font-bold typo-body text-theme-label-primary multi-truncate',
);

export const CardTitle = classed(Title, 'my-2');

export const ListCardTitle = classed(Title, 'mr-2');

export const CardTextContainer = classed('div', 'flex flex-col mx-4');

export const CardImage = classed(LazyImage, 'rounded-xl h-40');

export const CardSpace = classed('div', 'flex-1');

export const CardLink = classed(
  'a',
  styles.link,
  'absolute inset-0 w-full h-full',
);

export const Card = classed(
  'article',
  styles.card,
  'relative flex flex-col p-2 rounded-2xl bg-theme-bg-secondary border border-theme-divider-tertiary hover:border-theme-divider-secondary shadow-2',
);

export const CardHeader = classed(
  'div',
  styles.header,
  'flex h-8 items-center my-1 -mx-1.5',
);

export const ListCard = classed(
  'article',
  styles.card,
  'relative flex items-stretch pt-4 pb-3 pr-4 rounded-2xl bg-theme-bg-secondary border border-theme-divider-tertiary hover:border-theme-divider-secondary shadow-2',
);

export const ListCardMain = classed(
  'div',
  'flex-1 flex flex-col items-start ml-4',
);

export const ListCardAside = classed('div', 'flex flex-col w-14 items-center');

export const ListCardDivider = classed(
  'div',
  'w-px bg-theme-divider-tertiary mb-1',
);

export const CardNotification = classed(
  'div',
  'px-4 py-1.5 -mx-1.5 rounded-10 bg-theme-label-primary text-theme-label-invert typo-callout font-bold',
);

export const getPostClassNames = (
  post: Post,
  selectedComment: Comment,
  className: string,
): string =>
  classNames(
    {
      [styles.read]: post.read,
      [styles.hideContent]: selectedComment,
      [styles.trending]: post.trending > 0,
    },
    styles.post,
    'group',
    className,
  );

export const featuredCommentsToButtons = (
  comments: Comment[],
  onClick: (comment: Comment) => unknown,
  selectedId?: string,
  className = 'mx-1',
  tooltipPosition: 'up' | 'down' | 'left' | 'right' = 'down',
): ReactNode[] =>
  comments?.map((comment) => (
    <button
      {...getTooltipProps(`See ${comment.author.name}'s comment`, {
        position: tooltipPosition,
      })}
      onClick={() => onClick(comment)}
      key={comment.id}
      className={classNames(
        'flex p-0 bg-none border-none rounded-full cursor-pointer focus-outline',
        className,
      )}
    >
      <img
        src={comment.author.image}
        alt={`${comment.author.name}'s profile image`}
        className={classNames(
          'w-6 h-6 rounded-full',
          selectedId === comment.id ? 'opacity-100' : 'opacity-64',
        )}
        style={{ background: 'var(--theme-background-tertiary)' }}
      />
    </button>
  ));
