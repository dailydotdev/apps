import { MouseEventHandler } from 'react';
import { Post } from '../../../../../graphql/posts';

export interface FeedbackProps {
  post: Post;
  onUpvoteClick: MouseEventHandler;
  onDownvoteClick: MouseEventHandler;
  isVideoType?: boolean;
}
