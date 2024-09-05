import { Comment } from '../../../graphql/comments';
import { Post } from '../../../graphql/posts';
import { FeedItemPosition } from '../../../lib/feed';
import { Origin } from '../../../lib/log';

export interface ShareProps extends FeedItemPosition {
  post: Post;
  comment?: Comment;
  origin: Origin;
}
