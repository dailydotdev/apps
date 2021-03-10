import React, { ReactNode } from 'react';
import LazyImage from '../LazyImage';
import { Comment } from '../../graphql/comments';
import styles from '../../styles/cards.module.css';
import classed from '../../lib/classed';
import classNames from 'classnames';
import { getTooltipProps } from '../../lib/tooltip';

export const CardTitle = classed(
  'h3',
  styles.title,
  'my-2 font-bold typo-body text-theme-label-primary multi-truncate',
);

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

export const featuredCommentsToButtons = (
  comments: Comment[],
  onClick: (comment: Comment) => unknown,
  selectedId?: string,
): ReactNode[] =>
  comments?.map((comment) => (
    <button
      {...getTooltipProps(`See ${comment.author.name}'s comment`)}
      onClick={() => onClick(comment)}
      key={comment.id}
      className="flex p-0 bg-none border-none rounded-full cursor-pointer focus-outline"
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
