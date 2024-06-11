import { FeedItemPosition } from '../../../lib/feed';
import { Post } from '../../../graphql/posts';
import { Comment } from '../../../graphql/comments';
import { Origin } from '../../../lib/logs';

export interface ShareProps extends FeedItemPosition {
  post: Post;
  comment?: Comment;
  origin: Origin;
}
