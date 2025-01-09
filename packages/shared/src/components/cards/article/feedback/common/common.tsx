import type { MouseEventHandler } from 'react';
import type { Post } from '../../../../../graphql/posts';

export interface FeedbackProps {
  post: Post;
  onUpvoteClick: MouseEventHandler;
  onDownvoteClick: MouseEventHandler;
  isVideoType?: boolean;
}
