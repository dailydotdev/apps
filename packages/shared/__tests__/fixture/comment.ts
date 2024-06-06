import { Comment } from '../../src/graphql/comments';
import { author } from './loggedUser';

const comment: Comment = {
  id: 'c1',
  content: 'my comment',
  contentHtml: '<p>my comment</p>',
  author,
  createdAt: new Date(2017, 1, 10, 0, 0).toISOString(),
  permalink: 'https://daily.dev',
  numUpvotes: 0,
};

export default comment;
