import { ReactNode } from 'react';
import { Post } from '../../../graphql/posts';

export type CardType = {
  post: Post;
  children?: ReactNode;
  index?: number;
};
