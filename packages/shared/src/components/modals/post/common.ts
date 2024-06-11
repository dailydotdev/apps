import { FeedItemPosition } from '../../../lib/feed';
import { Post } from '../../../graphql/posts';
import { Comment } from '../../../graphql/comments';
import { Origin } from '../../../lib/log';

export interface ShareProps extends FeedItemPosition {
  post: Post;
  comment?: Comment;
  origin: Origin;
}
