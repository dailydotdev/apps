import React, { ReactElement } from 'react';
import classNames from 'classnames';
import styles from '../../../cards/Card.module.css';
import classed from '../../../../lib/classed';
import { useActiveFeedContext } from '../../../../contexts';
import { Post } from '../../../../graphql/posts';

const clickableCardClasses = classNames(
  styles.link,
  'absolute inset-0 w-full h-full focus-outline',
);

const RawCardButton = classed('button', clickableCardClasses);
export const CardButton = ({ post }: { post: Post }): ReactElement => {
  const { items, onOpenModal } = useActiveFeedContext();
  const postIndex = items.findIndex(
    (item) => item.type === 'post' && item.post.id === post.id,
  );
  return <RawCardButton onClick={() => onOpenModal(postIndex)} />;
};
