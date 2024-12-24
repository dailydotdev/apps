import type { FeedItemPosition } from '../../../lib/feed';
import type { Post } from '../../../graphql/posts';
import type { Comment } from '../../../graphql/comments';
import type { Origin } from '../../../lib/log';

export interface ShareProps extends FeedItemPosition {
  post: Post;
  comment?: Comment;
  origin: Origin;
}
